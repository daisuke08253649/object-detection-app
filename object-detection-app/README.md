# Object Detection App

YOLOv11 ベースのオブジェクト検出を行う Next.js アプリケーションです。専用の FastAPI サーバーを使用して動画解析（バウンディングボックスの描画）を提供します。

## 機能

- 動画ファイルのアップロード
- YOLOv11 による物体検出（FastAPI サーバーでの非同期処理）
- バウンディングボックス付き処理済み動画の生成（AVC1/MP4）
- Cloudflare R2 での動画ストレージ（オリジナル・処理済み）
- Supabase でのメタデータ管理

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **バックエンド (API)**: Next.js API Routes (プロキシ)
- **バックエンド (推論)**: FastAPI (Python)
- **AI/ML**: YOLOv11 (Ultralytics)
- **ストレージ**: Cloudflare R2
- **データベース**: Supabase
- **UI**: Radix UI, Lucide React

## セットアップ

### 1. 依存関係のインストール

#### フロントエンド (Next.js)

```bash
cd object-detection-app
npm install
```

#### バックエンド (FastAPI)

```bash
cd fastapi
python -m venv myvenv
# Windowsの場合
.\myvenv\Scripts\activate
# Mac/Linuxの場合
# source myvenv/bin/activate
pip install -r requirements.txt
```

### 2. 環境変数の設定

#### `object-detection-app/.env.local`

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudflare R2設定
R2_ENDPOINT=your_r2_endpoint
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name

# FastAPI 推論サーバー設定
AI_INFERENCE_API=your_ai_inference_api
```

#### `fastapi/.env`

FastAPI 側のディレクトリにも `.env` を作成し、R2 や Supabase、YOLO モデルの設定を記述してください。

### 3. 開発サーバーの起動

1. **FastAPI 起動**:

   ```bash
   cd fastapi
   uvicorn app.src.main:app --reload
   ```

2. **Next.js 起動**:
   ```bash
   cd object-detection-app
   npm run dev
   ```

[http://localhost:3000](http://localhost:3000) でアクセス可能です。

## システム構成図 (解析フロー)

1. **Upload**: Next.js から Cloudflare R2 へ動画をアップロード。
2. **Request**: Next.js から FastAPI の `/process-video` へ解析依頼を送信。
3. **Inference**: FastAPI が R2 から動画をダウンロードし、YOLOv11 で解析・描画。
4. **Storage**: FastAPI が処理済み動画を R2 へアップロード。
5. **Update**: FastAPI が解析結果と動画 URL を Supabase に直接保存。

## 使用方法

1. **動画アップロード**: `/uploads` ページで動画ファイルを選択してアップロード。
2. **自動解析**: アップロード完了後、バックグラウンドで FastAPI 推論サーバーが解析を開始。
3. **結果確認**: `/videoLists` や `/videos/[id]` で、バウンディングボックス付きの動画を確認。

## トラブルシューティング

### FastAPI 接続エラー

- `AI_INFERENCE_API` の URL が正しいか確認してください。
- FastAPI サーバーが起動しているか確認してください。
- CORS の設定が適切か確認してください。

### 動画再生エラー (iPhone/Mac)

- Safari 等で再生できない場合、生成動画のコーデック（AVC1）とブラウザの互換性を確認してください。

## ライセンス

MIT License
