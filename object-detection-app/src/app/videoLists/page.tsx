"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ExternalLink } from 'lucide-react';

type Video = {
  id: string;
  url: string;
  processed_url?: string;
  created_at: string;
  original_video_id: string;
};

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("processed_videos")
        .select("*, original_video_id(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("取得失敗:", error);
      } else {
        setVideos(data || []);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {videos.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-lg text-muted-foreground">
            まだ動画が登録されていません。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {videos.map((video) => (
            <Card key={video.id} className="h-full flex flex-col">
              <div className="aspect-video">
                <video
                  controls
                  className="w-full h-full object-cover rounded-t-lg"
                  src={video.processed_url || video.url}
                  title={`Video ${video.id}`}
                />
              </div>
              <CardContent className="flex-grow p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Video {video.id}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.processed_url && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      物体検出済み
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {new Date(video.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/videos/${video.id}`} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      詳細表示
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      R2で開く
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
