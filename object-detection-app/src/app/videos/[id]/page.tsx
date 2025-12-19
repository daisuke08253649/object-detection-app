import supabase from "../../lib/supabaseClient";
import { Card, CardContent } from '@/components/ui/card';

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("processed_videos")
    .select("*, original_video_id(*)")
    // .eq("original_video_id", id)
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-2xl py-8 text-center">
        <h1 className="text-xl text-destructive">
          動画が見つかりません
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        分析済み動画の再生
      </h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Video ID: {data.id}
            </span>
            {data.processed_url && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                物体検出済み
              </span>
            )}
          </div>

          {/* Debug Info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs break-all">
            <p className="font-bold">Debug URL:</p>
            <a href={data.processed_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {data.processed_url}
            </a>
          </div>
          
          <div className="flex justify-center mt-4">
            <video 
              controls 
              src={data.processed_url} 
              className="w-full max-w-full h-auto rounded-lg shadow-lg"
            >
              <source src={data.processed_url} type="video/mp4" />
              お使いのブラウザは動画タグをサポートしていません。
            </video>
          </div>
          
          {data.created_at && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              作成日時: {new Date(data.created_at).toLocaleString('ja-JP')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
