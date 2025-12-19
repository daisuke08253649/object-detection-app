"use client";

import { useState, useRef, useCallback } from 'react';
import { CloudUpload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile, formatFileSize, getSupportedFormatsString } from '@/lib/fileUtils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  disabled = false,
  className
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback((file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || '無効なファイルです');
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (handleFileValidation(file)) {
      onFileSelect(file);
    }
  }, [handleFileValidation, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFileRemove();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileRemove]);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragOver && "border-primary bg-primary/10",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50",
          selectedFile && "border-green-300 bg-green-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={['video/mp4'].join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              disabled={disabled}
              className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <CloudUpload className={cn(
              "mx-auto h-12 w-12 mb-4",
              error ? "text-red-400" : "text-gray-400"
            )} />
            <div className="space-y-2">
              <p className={cn(
                "text-lg font-medium",
                error ? "text-red-700" : "text-gray-700"
              )}>
                {isDragOver ? 'MP4ファイルをドロップしてください' : 'MP4動画ファイルを選択'}
              </p>
              <p className="text-sm text-gray-500">
                ここにMP4ファイルをドラッグ&ドロップするか、クリックして選択
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span>
            <strong>最大サイズ:</strong> {formatFileSize(1024 * 1024 * 1024)}
          </span>
        </div>
        <div>
          <strong>対応形式:</strong> {getSupportedFormatsString()}
        </div>
      </div>
    </div>
  );
}
