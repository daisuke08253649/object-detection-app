// export interface ApiResponse<T = any> {
//   success: boolean;
//   data?: T;
//   error?: string;
// }

// export interface UploadResponse {
//   url: string;
//   name: string;
// }

// export interface AnalysisResponse {
//   success: boolean;
//   processed_url: string;
//   prediction_id: string;
//   analysis_result: any;
// }

/**
 * ネットワークエラーかどうかを判定
 */
export function isNetworkError(error: any): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}

/**
 * エラーメッセージを分類して適切なメッセージを返す
 */
export function categorizeError(error: any): string {
  if (isNetworkError(error)) {
    return 'ネットワークエラーが発生しました';
  }
  
  if (error instanceof Error) {
    // 特定のエラーパターンをチェック
    if (error.message.includes('413') || error.message.includes('too large')) {
      return 'ファイルサイズが大きすぎます（最大1GB）';
    }
    if (error.message.includes('415') || error.message.includes('unsupported')) {
      return 'MP4形式の動画ファイルのみサポートしています。他の形式をお持ちの場合は、変換ツール（HandBrake等）をご利用ください。';
    }
    return error.message;
  }
  
  return '不明なエラーが発生しました';
}
