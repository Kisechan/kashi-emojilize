/**
 * API 请求和响应类型定义
 */

/**
 * Emoji 增强请求
 */
export interface EnhanceRequest {
  text: string;
  style?: 'restrained' | 'enhanced' | 'symmetric';
}

/**
 * Emoji 增强响应
 */
export interface EnhanceResponse {
  success: boolean;
  data?: string;
  error?: string;
  code?: string;
}

/**
 * API 错误信息
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
