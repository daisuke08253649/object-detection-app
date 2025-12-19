'use client';
import { Button } from '@/components/ui/button';
import { CloudUpload, List } from 'lucide-react';
import {useRouter} from 'next/navigation';

export default function Header() {
  const router = useRouter()

  return (
    <header className="shadow-lg rounded-lg m-2">
      <div className="mx-auto">
        <div className="flex flex-row items-center justify-between h-16">
          <h1 className="flex-1 ml-5 text-xl font-semibold">
            物体検出アプリ
          </h1>
          
          <div className="flex mr-5 items-center gap-4">
            <Button className="flex items-center gap-2" variant="ghost" onClick={() => router.push("/")}>
                <CloudUpload className="h-4 w-4" />
                アップロード
            </Button>
            
            <Button className="flex items-center gap-2" variant="ghost" onClick={() => router.push("/videoLists")}>
                <List className="h-4 w-4" />
                動画一覧
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}