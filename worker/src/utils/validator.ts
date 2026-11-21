/**
 * 输入数据校验工具
 */

import { AppError } from '../types/index';

const MAX_TEXT_LENGTH = 5000;
const MIN_TEXT_LENGTH = 1;

export interface ValidationResult {
  isValid: boolean;
  error?: AppError;
}

/**
 * 校验请求体是否为有效的 JSON
 */
export function validateRequestBody(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return {
      isValid: false,
      error: new AppError('INVALID_REQUEST', '请求体必须是有效的 JSON 对象', 400),
    };
  }

  return { isValid: true };
}

/**
 * 校验增强文本请求
 */
export function validateEnhanceRequest(data: unknown): ValidationResult {
  // 检查是否为对象
  if (typeof data !== 'object' || data === null) {
    return {
      isValid: false,
      error: new AppError('INVALID_REQUEST', '请求体必须是有效的 JSON 对象', 400),
    };
  }

  const obj = data as Record<string, unknown>;

  // 检查是否有 text 字段
  if (!('text' in obj)) {
    return {
      isValid: false,
      error: new AppError('MISSING_TEXT', '缺少必需字段：text', 400),
    };
  }

  const text = obj.text;

  // 检查 text 是否为字符串
  if (typeof text !== 'string') {
    return {
      isValid: false,
      error: new AppError('INVALID_TEXT_TYPE', 'text 字段必须是字符串', 400),
    };
  }

  // 检查文本是否为空
  if (text.trim().length === 0) {
    return {
      isValid: false,
      error: new AppError('EMPTY_TEXT', '文本不能为空', 400),
    };
  }

  // 检查文本长度
  if (text.length < MIN_TEXT_LENGTH) {
    return {
      isValid: false,
      error: new AppError('TEXT_TOO_SHORT', '文本过短', 400),
    };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      error: new AppError(
        'TEXT_TOO_LONG',
        `文本长度超过限制 (最大 ${MAX_TEXT_LENGTH} 字符)`,
        400
      ),
    };
  }

  return { isValid: true };
}
