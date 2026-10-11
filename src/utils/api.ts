import { solvePhysicsFallback, FallbackPhysicsResult } from '../engine/fallbackPhysicsSolver';
import { tutorFallbackAnswer } from '../engine/tutorFallback';
import { logger } from './logger';

/**
 * Base URL of the optional AI proxy (Cloudflare Worker). Set at build time via VITE_API_URL.
 * When empty, the app runs 100% offline with the built-in deterministic physics engine.
 * The Gemini key NEVER ships to the browser — it lives only as a Worker secret.
 */
const API_URL = ((import.meta.env?.VITE_API_URL as string | undefined) ?? '').trim().replace(/\/+$/, '');
const TIMEOUT_MS = 25_000;

export const aiProxyConfigured = API_URL.length > 0;

export interface SolveResult {
  data: FallbackPhysicsResult;
  modelUsed: string;
  isFallback: boolean;
}

export interface TutorResult {
  answer: string;
  modelUsed: string;
  isFallback: boolean;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = performance.now();
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer-when-downgrade',
    });
    const json = await res.json().catch(() => ({}));
    logger.info('api.response', { path, status: res.status, ms: Math.round(performance.now() - started) });
    if (!res.ok || !json?.success) throw new Error(json?.error || `Request failed (${res.status})`);
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function solvePhysics(problemText: string, gravityValue: number, language: string): Promise<SolveResult> {
  if (aiProxyConfigured) {
    try {
      const json = await postJson<{ data: FallbackPhysicsResult; modelUsed: string; isFallback?: boolean }>(
        '/api/ai/solve-physics',
        { problemText, gravityValue, language }
      );
      return { data: json.data, modelUsed: json.modelUsed, isFallback: !!json.isFallback };
    } catch (err) {
      logger.warn('api.solve.failed_using_local_engine', { error: err instanceof Error ? err : String(err) });
    }
  }
  const data = solvePhysicsFallback(problemText, gravityValue, language);
  return { data, modelUsed: 'PhysiStep Offline Physics Engine', isFallback: true };
}

export async function askTutor(question: string, contextProblem: string, language: string): Promise<TutorResult> {
  if (aiProxyConfigured) {
    try {
      const json = await postJson<{ answer: string; modelUsed: string; isFallback?: boolean }>('/api/ai/ask-tutor', {
        question,
        contextProblem,
        language,
      });
      return { answer: json.answer, modelUsed: json.modelUsed, isFallback: !!json.isFallback };
    } catch (err) {
      logger.warn('api.tutor.failed_using_local_answer', { error: err instanceof Error ? err : String(err) });
    }
  }
  return { answer: tutorFallbackAnswer(question, language), modelUsed: 'PhysiStep Tutor Knowledge Base', isFallback: true };
}
