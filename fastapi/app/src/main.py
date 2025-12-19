from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from supabase import create_client
from ultralytics import YOLO
import tempfile
import cv2
import os
import boto3
from botocore.client import Config
from dotenv import load_dotenv
import requests
import logging
import traceback

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE")
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")
R2_MODEL_PUBLIC_URL = os.getenv("R2_MODEL_PUBLIC_URL")
MODEL_R2_BUCKET = os.getenv("MODEL_R2_BUCKET")
VIDEO_R2_BUCKET = os.getenv("VIDEO_R2_BUCKET")
YOLO_MODEL = os.getenv("YOLO_MODEL")

# ログ設定
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# R2クライアント
s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="auto"
)

# R2の公開URLからYOLOモデルを直接ダウンロード
def download_model_from_r2():
    public_url = os.getenv("R2_MODEL_PUBLIC_URL")
    model_name = os.getenv("YOLO_MODEL")
    model_url = f"{public_url}/{model_name}"
    local_path = os.path.join(tempfile.gettempdir(), model_name)

    # ファイルが既に存在する場合はダウンロードをスキップ
    if os.path.exists(local_path):
        logger.info(f"✅ Model already exists at {local_path}")
        return local_path

    logger.info(f"⬇️ Downloading model from {model_url}")
    resp = requests.get(model_url, stream=True)
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="Model file not found on R2")

    with open(local_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)

    logger.info(f"Model saved to {local_path}")
    return local_path

# 起動時にR2からYOLOモデルをダウンロード
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        model_path = download_model_from_r2()
        app.state.model = YOLO(model_path)
        logger.info("YOLO model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load YOLO model: {e}")
        traceback.print_exc()
        raise
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

# R2更新
def upload_r2(output_path):
    processed_name = os.path.basename(output_path)
    s3.upload_file(
        Filename=output_path,
        Bucket=VIDEO_R2_BUCKET,
        Key=processed_name,
        ExtraArgs={"ContentType": "video/mp4"}
    )
    processed_url = f"{R2_PUBLIC_URL}/{processed_name}"

    if processed_url:
        logger.info(f"Upload complete: {processed_url}")
        return processed_url
    else:
        logger.info(f"error: {processed_url}")
        return

# supabase更新
def supabase_upload(video_id, processed_url):

    endpoint = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    payload = {
        "original_video_id": video_id,
        "processed_url": processed_url,
        }
    resp = requests.post(endpoint, headers=headers, json=payload)

    if not resp.ok:
        logger.error(f"Failed to update Supabase ({resp.status_code}): {resp.text}")
    else:
        logger.info(f"Supabase updated successfully for video_id={video_id}")

# 動画推論
async def process_video_task(video_url, video_id, model: YOLO):
    
    try:
        logger.info(f"Starting video processing for ID={video_id}")

        # ダウンロード
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        resp = requests.get(video_url, stream=True)
        resp.raise_for_status()
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                tmp_file.write(chunk)
        tmp_file.close()

        # 出力設定
        output_path = tmp_file.name.replace(".mp4", "_annotated.mp4")
        cap = cv2.VideoCapture(tmp_file.name)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        model = app.state.model
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            results = model.predict(source=frame, conf=0.5)
            annotated_frame = results[0].plot()
            writer.write(annotated_frame)
            frame_count += 1

        cap.release()
        writer.release()

        logger.info(f"Processed {frame_count} frames. Uploading to R2...")

        # R2とsupabaseを更新
        processed_url = upload_r2(output_path)
        if processed_url:
            supabase_upload(video_id, processed_url)
        else:
            logger.info("processed_url is missing")

    except Exception as e:
        logger.error(f"Error during video processing: {e}")
        traceback.print_exc()
    
    finally:
        # 一時ファイルの削除
        try:
            if os.path.exists(tmp_file.name):
                os.remove(tmp_file.name)
            if os.path.exists(output_path):
                os.remove(output_path)
        except Exception:
            pass


@app.post("/process-video")
async def process_video(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    video_url = body.get("video_url")
    video_id = body.get("video_id")

    if not video_url or not video_id:
        raise HTTPException(status_code=400, detail="video_url and video_id are required")
    
    background_tasks.add_task(process_video_task, video_url, video_id, app.state.model)
    logger.info(f"🟡 Task submitted for video {video_id}")
    return {"status": "processing started", "video_id": video_id}