/**
 * Cloudflare Turnstile 人机验证
 *
 * 调用 Cloudflare Siteverify API 验证前端传来的 Turnstile token
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  success: boolean;
  errorCode?: string;
}

/**
 * 向 Cloudflare 验证 Turnstile token
 *
 * @param token 前端传来的 cf-turnstile-response token
 * @param secretKey Turnstile Secret Key（来自环境变量）
 * @param clientIp 可选：用户 IP，用于增强安全性
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  clientIp?: string
): Promise<TurnstileVerifyResult> {
  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (clientIp) {
    formData.append('remoteip', clientIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return { success: false, errorCode: 'VERIFICATION_REQUEST_FAILED' };
    }

    const result = await response.json<{
      success: boolean;
      'error-codes'?: string[];
    }>();

    return {
      success: result.success,
      errorCode: result['error-codes']?.[0],
    };
  } catch {
    return { success: false, errorCode: 'VERIFICATION_NETWORK_ERROR' };
  }
}
