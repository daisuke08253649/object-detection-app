export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * ファイルのバリデーションを行う
 */
export function validateFile(file: File): FileValidationResult {
  // ファイルサイズのチェック
  if (file.size > 1024 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'ファイルサイズが大きすぎます（最大1GB）'
    };
  }

  // ファイル形式のチェック
  if (!['video/mp4'].includes(file.type as any)) {
    // 拡張子でもチェック
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!['.mp4'].includes(extension as any)) {
      return {
        isValid: false,
        error: 'MP4形式の動画ファイルのみサポートしています。他の形式をお持ちの場合は、変換ツール（HandBrake等）をご利用ください。'
      };
    }
  }

  return { isValid: true };
}

/**
 * ファイルサイズを読みやすい形式に変換
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * サポートされているファイル形式の文字列を取得
 */
export function getSupportedFormatsString(): string {
  return ['.mp4'].join(', ');
}

/**
 * ファイルが動画ファイルかどうかをチェック
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || 
         ['.mp4'].some(ext => 
           file.name.toLowerCase().endsWith(ext)
         );
}
