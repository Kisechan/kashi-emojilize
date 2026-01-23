/**
 * 请求和响应类型定义
 */

export interface EnhanceRequest {
  text: string;
}

export interface EnhanceResponse {
  success: boolean;
  data?: string;
  error?: string;
  code?: string;
}

/**
 * Cloudflare Workers 环境变量
 */
export interface Env {
  DEEPSEEK_API_KEY: string;
}

/**
 * DeepSeek API 请求类型
 */
export interface DeepSeekMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface DeepSeekChoice {
  message: DeepSeekMessage;
  finish_reason: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 内部错误类型
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}
