/**
 * DeepSeek API 调用模块
 *
 * 负责与 DeepSeek 大语言模型 API 交互
 * 只使用标准 Fetch API，符合 Cloudflare Workers 运行环境
 */

import {
  DeepSeekRequest,
  DeepSeekResponse,
  DeepSeekMessage,
  AppError,
} from '../types/index';

const DEEPSEEK_API_BASE = 'https://api.deepseek.com/chat/completions';

/**
 * 调用 DeepSeek API 进行文本增强
 */
export async function callDeepSeekAPI(
  messages: DeepSeekMessage[],
  apiKey: string
): Promise<string> {
  try {
    // 构建请求
    const request: DeepSeekRequest = {
      model: 'deepseek-chat',
      messages,
      temperature: 1.5,
      max_tokens: 2000,
      top_p: 1,
    };

    // 发送请求
    const response = await fetch(DEEPSEEK_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `DeepSeek API 错误 [${response.status}]: ${errorText}`
      );

      if (response.status === 401) {
        throw new AppError(
          'DEEPSEEK_AUTH_FAILED',
          'DeepSeek API 认证失败，请检查 API Key',
          500
        );
      }

      if (response.status === 429) {
        throw new AppError(
          'DEEPSEEK_RATE_LIMITED',
          'DeepSeek API 请求过于频繁，请稍后重试',
          503
        );
      }

      throw new AppError(
        'DEEPSEEK_API_ERROR',
        `DeepSeek API 返回错误 [${response.status}]`,
        500
      );
    }

    // 解析响应
    const data: DeepSeekResponse = await response.json();

    // 验证响应结构
    if (!data.choices || data.choices.length === 0) {
      throw new AppError(
        'DEEPSEEK_INVALID_RESPONSE',
        'DeepSeek API 返回无效响应',
        500
      );
    }

    // 提取增强后的文本
    const enhancedText = data.choices[0].message.content;

    if (!enhancedText || typeof enhancedText !== 'string') {
      throw new AppError(
        'DEEPSEEK_EMPTY_RESPONSE',
        'DeepSeek API 返回空响应',
        500
      );
    }

    return enhancedText;
  } catch (error) {
    // 如果已经是 AppError，直接抛出
    if (error instanceof AppError) {
      throw error;
    }

    // 处理网络错误或其他异常
    console.error('DeepSeek API 调用异常:', error);
    throw new AppError(
      'DEEPSEEK_REQUEST_FAILED',
      'DeepSeek API 调用失败，请稍后重试',
      500
    );
  }
}
