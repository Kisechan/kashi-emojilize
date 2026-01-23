/**
 * Emoji 增强业务处理器
 *
 * 负责协调校验、Prompt 构建和 API 调用等业务逻辑
 */

import { EnhanceRequest, EnhanceResponse, AppError, Env } from '../types/index';
import { validateEnhanceRequest } from '../utils/validator';
import { buildMessages } from '../prompt/base';
import { callDeepSeekAPI } from '../llm/deepseek';

/**
 * 处理文本 emoji 增强请求
 */
export async function handleEnhanceRequest(
  data: unknown,
  env: Env
): Promise<EnhanceResponse> {
  try {
    // 1. 校验请求数据
    const validation = validateEnhanceRequest(data);
    if (!validation.isValid && validation.error) {
      return {
        success: false,
        error: validation.error.message,
        code: validation.error.code,
      };
    }

    const request = data as EnhanceRequest;
    const text = request.text.trim();

    // 2. 检查 API Key 是否配置
    if (!env.DEEPSEEK_API_KEY) {
      console.error('缺少必需的环境变量：DEEPSEEK_API_KEY');
      return {
        success: false,
        error: '服务器配置错误',
        code: 'MISSING_API_KEY',
      };
    }

    // 3. 构建 Prompt 消息
    const messages = buildMessages(text);

    // 4. 调用 DeepSeek API
    const enhancedText = await callDeepSeekAPI(messages, env.DEEPSEEK_API_KEY);

    // 5. 返回结果
    return {
      success: true,
      data: enhancedText,
    };
  } catch (error) {
    // 处理已知的 AppError
    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    // 处理未知错误
    console.error('未知错误:', error);
    return {
      success: false,
      error: '处理请求时发生错误，请稍后重试',
      code: 'INTERNAL_ERROR',
    };
  }
}
