"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { StepProgress } from '@/components/ui/progress';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { validateFile } from '@/lib/fileUtils';
import { categorizeError } from '@/lib/api';
import { ClipLoader } from "react-spinners";

const UPLOAD_STEPS = [
  'ファイル選択',
  'アップロード',
  'データベース登録',
  'AI分析',
  '完了'
];

export default function UploadForm() {
  const router = useRouter();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setCurrentStep(1);
  };

  const handleFileRemove = () => {
    setFile(null);
    setCurrentStep(0);
  };

  // ポーリング
  const pollForProcessedUrl = async (videoId: string) => {
    console.log("Polling started for video:", videoId);

    while (true) {
      try {
        const { data, error } = await supabase
          .from("processed_videos")
          .select("id, processed_url")
          .eq("original_video_id", videoId)
          .single();

        if (error) {
          console.error("Polling error:", error);
        }

        if (data?.processed_url) {
          console.log("Processed URL found:", data.processed_url);
          return data;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5秒待つ
      } catch (err) {
        console.error("Polling loop error:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('ファイルが選択されていません');
      return;
    }

    setIsLoading(true);
    setCurrentStep(1);

    try {
      // Step 1: ファイルアップロード
      toast.info('アップロード中...');

      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error('無効なファイルです');
        setIsLoading(false)
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      // ファイルのアップロード
      const uploadResponse = await fetch("api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("アップロードに失敗しました");
      }

      const uploadResult = await uploadResponse.json();
      setCurrentStep(2);

      // Step 2: データベース登録
      toast.info('メタ情報登録中...');
      const { data: videoData, error: dbError } = await supabase
        .from("videos")
        .insert([{ url: uploadResult.data?.url }])
        .select()
        .single();

      if (dbError || !videoData) {
        throw new Error('データベース登録に失敗しました');
      }

      setCurrentStep(3);

      // Step 3: AI分析
      toast.info('AIで分析中...');
      const analysisResponse = await fetch("api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: uploadResult.data?.url,
          video_id: videoData.id
        })
      });

      if (!analysisResponse.ok) {
        toast.error("AI分析に失敗しました");
        return;
      }

      // Supabaseをポーリングして結果を待機
      toast.info('AI分析中... 数分かかる場合があります。');
      const processedVideo = await pollForProcessedUrl(videoData.id)

      if (processedVideo) {
        // Step 4: 完了
        setCurrentStep(4);
        toast.success('完了！');
        router.push(`/videos/${processedVideo.id}`);
      } else {
        setIsLoading(false);
        throw new Error("AI処理がタイムアウトしました。");
      }

    } catch (error) {
      console.error('Upload process error:', error);
      const errorMessage = categorizeError(error);
      toast.error('処理に失敗しました', errorMessage, 10000);
      setIsLoading(false);
      setCurrentStep(Math.max(0, currentStep - 1));
    }
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          MP4動画アップロード & 物体検出
        </h1>
        <p className="text-center text-gray-600 mb-6">
          MP4形式の動画ファイル（最大1GB）をアップロードして、AIによる物体検出を実行します
        </p>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* ステップ進捗 */}
            <StepProgress steps={UPLOAD_STEPS} currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ファイルアップロード */}
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={file}
                disabled={isLoading}
              />

              {/* アップロードボタン */}
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={!file || isLoading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <ClipLoader color="white" size="30" />
                  ) : (
                    'アップロード＆分析開始'
                  )}
                </Button>
              </div>

              {/* 処理中の説明 */}
              {isLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">処理中...</h3>
                  <p className="text-sm text-blue-700">
                    {currentStep === 1 && 'ファイルをクラウドストレージにアップロードしています...'}
                    {currentStep === 2 && 'データベースに動画情報を登録しています...'}
                    {currentStep === 3 && 'AI による物体検出分析を実行しています。この処理には数分かかる場合があります...'}
                    {currentStep === 4 && '処理が完了しました！結果ページに移動します...'}
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* トースト通知 */}
      <ToastContainer />
    </>
  );
}
