import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleRequest, __resetRateLimiter, type Env } from './index';

const ORIGIN = 'https://student.github.io';
const baseEnv: Env = { GEMINI_API_KEY: 'test-key', ALLOWED_ORIGINS: `${ORIGIN},http://localhost:5173`, RATE_LIMIT_PER_MIN: '3' };
const PROBLEM = 'A 1200 kg car moving at 20 m/s brakes to a stop over 40 m. Find the friction force.';

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`https://api.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'CF-Connecting-IP': '1.2.3.4', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const geminiOk = (payload: unknown) =>
  vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: typeof payload === 'string' ? payload : JSON.stringify(payload) }] } }] }), { status: 200 }));

const goodSolution = { problemSummary: 's', category: 'Force', givens: [], unknowns: [], principlesUsed: [], keyFormulasLatex: [], steps: [{ stepNumber: 1 }], finalAnswers: [], sanityCheck: 'ok', commonPitfalls: [] };

const env = baseEnv;

describe('worker', () => {
  let logs: Record<string, unknown>[];
  const log = (l: Record<string, unknown>) => logs.push(l);
  beforeEach(() => {
    logs = [];
    __resetRateLimiter();
  });

  it('health works and sends CORS only to allowed origins', async () => {
    const ok = await handleRequest(new Request('https://api.test/api/health', { headers: { Origin: ORIGIN } }), env, { log });
    expect(ok.status).toBe(200);
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    const evil = await handleRequest(new Request('https://api.test/api/health', { headers: { Origin: 'https://evil.example' } }), env, { log });
    expect(evil.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('answers preflight only for allowed origins', async () => {
    const ok = await handleRequest(new Request('https://api.test/api/ai/solve-physics', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env, { log });
    expect(ok.status).toBe(204);
    const bad = await handleRequest(new Request('https://api.test/api/ai/solve-physics', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }), env, { log });
    expect(bad.status).toBe(403);
  });

  it('rejects POST without an allowed Origin (fail closed)', async () => {
    const noOrigin = new Request('https://api.test/api/ai/solve-physics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    expect((await handleRequest(noOrigin, env, { log })).status).toBe(403);
    expect((await handleRequest(post('/api/ai/solve-physics', {}, { Origin: 'https://evil.example' }), env, { log })).status).toBe(403);
  });

  it('validates input', async () => {
    const env = { ...baseEnv, RATE_LIMIT_PER_MIN: '100' };
    expect((await handleRequest(post('/api/ai/solve-physics', {}), env, { log })).status).toBe(400);
    expect((await handleRequest(post('/api/ai/solve-physics', { problemText: 'x'.repeat(2001) }), env, { log })).status).toBe(400);
    expect((await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM, gravityValue: 'abc' }), env, { log })).status).toBe(400);
    expect((await handleRequest(post('/api/ai/solve-physics', '{not json'), env, { log })).status).toBe(400);
    expect((await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM }, { 'Content-Type': 'text/plain' }), env, { log })).status).toBe(415);
    expect((await handleRequest(post('/api/ai/solve-physics', { problemText: 'x'.repeat(9000) }), env, { log })).status).toBe(413);
    expect((await handleRequest(post('/api/ai/ask-tutor', {}), env, { log })).status).toBe(400);
  });

  it('returns 404/405 for unknown routes and methods', async () => {
    expect((await handleRequest(new Request('https://api.test/nope', { headers: { Origin: ORIGIN } }), env, { log })).status).toBe(404);
    expect((await handleRequest(new Request('https://api.test/api/ai/solve-physics', { headers: { Origin: ORIGIN } }), env, { log })).status).toBe(405);
  });

  it('rate limits per IP', async () => {
    const fetchImpl = geminiOk(goodSolution);
    for (let i = 0; i < 3; i++) expect((await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM }), env, { log, fetchImpl })).status).toBe(200);
    const res = await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM }), env, { log, fetchImpl });
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
  });

  it('uses Gemini when available, keeps the key out of the body and sends the problem as delimited data', async () => {
    const fetchImpl = geminiOk(goodSolution);
    const res = await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM }), env, { log, fetchImpl });
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.isFallback).toBeUndefined();
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain('test-key');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('test-key');
    expect(String(init.body)).toContain('<problem>');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('falls back to the offline engine when Gemini fails, and does not leak upstream details', async () => {
    const fetchImpl = vi.fn(async () => new Response('secret upstream detail', { status: 503 }));
    const res = await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM }), env, { log, fetchImpl });
    const json = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(json.isFallback).toBe(true);
    expect(JSON.stringify(json)).not.toContain('secret upstream detail');
  });

  it('falls back when no API key is configured and when the model returns junk', async () => {
    const r1 = await handleRequest(post('/api/ai/ask-tutor', { question: 'What is momentum?' }), { ...env, GEMINI_API_KEY: undefined }, { log });
    expect(((await r1.json()) as any).isFallback).toBe(true);
    const r2 = await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM }), env, { log, fetchImpl: geminiOk('{"nope":1}') });
    expect(((await r2.json()) as any).isFallback).toBe(true);
  });

  it('logs structured request lines without user text, keys or IPs', async () => {
    await handleRequest(post('/api/ai/solve-physics', { problemText: PROBLEM }), env, { log, fetchImpl: geminiOk(goodSolution) });
    const line = logs.find((l) => l.event === 'request')!;
    expect(line).toMatchObject({ method: 'POST', path: '/api/ai/solve-physics', status: 200, route: 'solve' });
    const all = JSON.stringify(logs);
    expect(all).not.toContain('1200 kg');
    expect(all).not.toContain('test-key');
    expect(all).not.toContain('1.2.3.4');
  });
});
