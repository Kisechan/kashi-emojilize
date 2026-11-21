import type { Env } from '../types/index';
import { verifyTurnstileToken } from './turnstile';

const sessionLifetime = 2 * 60 * 60 * 1000;
const encoder = new TextEncoder();
const productionOrigin = 'https://kashi.kscn.uk';
const testSecret = '1x0000000000000000000000000000000AA';

async function signingKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createSession(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  const localTest = env.TURNSTILE_LOCAL_TEST === 'true' &&
    env.TURNSTILE_SECRET_KEY === testSecret &&
    (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173');

  if (!origin || (env.TURNSTILE_SECRET_KEY === testSecret ? !localTest : origin !== productionOrigin)) {
    return Response.json({ error: '此网站无法发起验证' }, { status: 403 });
  }
  if (!env.TURNSTILE_SECRET_KEY || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    return Response.json({ error: '验证服务尚未配置' }, { status: 503 });
  }

  const ip = request.headers.get('CF-Connecting-IP') || undefined;
  if (!(await env.RATE_LIMITER.limit({ key: 'session:' + (ip || 'unknown') })).success) {
    return Response.json({ error: '验证过于频繁，请稍后重试' }, { status: 429 });
  }

  const body = await request.json<{ token?: unknown }>().catch(() => null);
  const token = body?.token;
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    return Response.json({ error: '缺少有效的人机验证凭证' }, { status: 400 });
  }

  const result = await verifyTurnstileToken(token, env.TURNSTILE_SECRET_KEY, ip);
  const matches = localTest
    ? result.hostname === 'example.com' && !result.action
    : result.hostname === new URL(origin).hostname && result.action === 'site-entry';
  if (!result.success || !matches) {
    return Response.json({ error: '人机验证失败，请重试' }, { status: 403 });
  }

  const payload = `${Date.now() + sessionLifetime}.${crypto.randomUUID()}`;
  const signature = await crypto.subtle.sign('HMAC', await signingKey(env.SESSION_SECRET), encoder.encode(payload));
  return Response.json({ session: `${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}` });
}

export async function hasSession(request: Request, env: Env): Promise<boolean> {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return false;
  const match = request.headers.get('Authorization')?.match(/^Bearer (\d{13}\.[a-f0-9-]{36})\.([A-Za-z0-9+/]{43}=)$/);
  if (!match || Number(match[1].split('.')[0]) <= Date.now()) return false;
  const signature = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
  return crypto.subtle.verify('HMAC', await signingKey(env.SESSION_SECRET), signature, encoder.encode(match[1]));
}
