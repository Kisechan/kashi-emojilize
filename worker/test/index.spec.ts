import { createExecutionContext, env, fetchMock } from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index';

const testEnv = {
  ...env,
  SESSION_SECRET: 'independent-session-key-for-unit-tests',
  TURNSTILE_SECRET_KEY: 'mock-turnstile-key',
};
const origin = 'https://kashi.kscn.uk';

function request(path: string, init?: RequestInit) {
  return worker.fetch(new Request('https://kashi-emojilize-api.kscn.uk' + path, init), testEnv, createExecutionContext());
}

function siteverify(result: object) {
  fetchMock.get('https://challenges.cloudflare.com')
    .intercept({ path: '/turnstile/v0/siteverify', method: 'POST' })
    .reply(200, JSON.stringify(result));
}

function exchange() {
  return request('/session', { method: 'POST', headers: { Origin: origin }, body: JSON.stringify({ token: 'example-token' }) });
}

describe('entry verification', () => {
  beforeEach(() => {
    fetchMock.activate();
    fetchMock.disableNetConnect();
  });
  afterEach(() => {
    fetchMock.assertNoPendingInterceptors();
    fetchMock.deactivate();
  });

  it('serves the health endpoint', async () => {
    expect(await (await request('/health')).json()).toMatchObject({ status: 'ok' });
  });

  it('uses one verified token to authorize multiple requests and rejects tampered sessions', async () => {
    siteverify({ success: true, hostname: 'kashi.kscn.uk', action: 'site-entry' });
    const exchangeResponse = await exchange();
    expect(exchangeResponse.status).toBe(200);
    const { session } = await exchangeResponse.json<{ session: string }>();
    const headers = { Authorization: 'Bearer ' + session };
    expect((await request('/session', { headers })).status).toBe(204);
    for (let i = 0; i < 2; i++) {
      const response = await request('/enhance', { method: 'POST', headers, body: '{}' });
      expect(await response.json()).toMatchObject({ code: 'MISSING_TEXT' });
    }
    expect((await request('/enhance', { method: 'POST' })).status).toBe(401);
    const [, nonce, signature] = session.split('.');
    const altered = `${Date.now() + 10_000_000}.${nonce}.${signature}`;
    expect((await request('/session', { headers: { Authorization: 'Bearer ' + altered } })).status).toBe(401);
    const clock = vi.spyOn(Date, 'now').mockReturnValue(Number(session.split('.')[0]) + 1);
    try {
      expect((await request('/session', { headers })).status).toBe(401);
    } finally {
      clock.mockRestore();
    }
    siteverify({ success: false, 'error-codes': ['timeout-or-duplicate'] });
    expect((await exchange()).status).toBe(403);
  });

  it.each([
    { success: true, hostname: 'example.com', action: 'site-entry' },
    { success: true, hostname: 'kashi.kscn.uk', action: 'other-action' },
  ])('rejects mismatched Turnstile claims: %j', async (claims) => {
    siteverify(claims);
    expect((await exchange()).status).toBe(403);
  });
});
