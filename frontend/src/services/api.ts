/**
 * API 服务层
 *
 * 所有与 Cloudflare Worker 后端的通信都在此集中处理
 */

import type { EnhanceRequest, EnhanceResponse, ApiError } from '../types/index';

/**
 * 获取 Worker API 的基础 URL
 */
function getApiBaseUrl(): string {
  // 优先使用环境变量，否则使用默认值
  const url = import.meta.env.VITE_WORKER_API_BASE_URL || 'http://localhost:8787';
  return url.replace(/\/$/, ''); // 移除末尾斜杠
}

/**
 * 处理 API 响应
 */
function handleApiError(response: Response, error?: unknown): ApiError {
  if (error instanceof SyntaxError) {
    return {
      message: '响应格式错误',
      code: 'INVALID_RESPONSE_FORMAT',
      statusCode: 500,
    };
  }

  return {
    message: `API 请求失败 (${response.status})`,
    code: 'API_ERROR',
    statusCode: response.status,
  };
}

/**
 * 调用 emoji 增强 API
 *
 * @param text 需要增强的文本
 * @param style 风格选项：'restrained' | 'enhanced' | 'symmetric'
 * @returns 增强后的文本
 * @throws ApiError
 */
export async function enhanceText(text: string, style?: string): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/enhance`;

  try {
    const request: EnhanceRequest = { text, style: style as 'restrained' | 'enhanced' | 'symmetric' | undefined };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw handleApiError(response);
    }

    const data: EnhanceResponse = await response.json();

    if (!data.success) {
      throw {
        message: data.error || '增强失败，请稍后重试',
        code: data.code || 'ENHANCE_FAILED',
        statusCode: 400,
      } as ApiError;
    }

    if (!data.data) {
      throw {
        message: '返回数据为空',
        code: 'EMPTY_RESPONSE',
        statusCode: 500,
      } as ApiError;
    }

    return data.data;
  } catch (error) {
    // 如果已经是 ApiError，直接抛出
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError;
    }

    // 处理网络错误
    if (error instanceof TypeError) {
      throw {
        message: '网络连接失败，请检查网络连接和 API 地址配置',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      } as ApiError;
    }

    // 处理响应解析错误
    if (error instanceof Response) {
      throw handleApiError(error);
    }

    throw {
      message: '发生未知错误，请稍后重试',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    } as ApiError;
  }
}
