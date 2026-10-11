/**
 * Lightweight client-side logger.
 *
 * - Structured entries kept in a ring buffer (last MAX_ENTRIES) and persisted to
 *   localStorage so a crash/reload doesn't lose the trail.
 * - "Log file" for a static PWA = a downloadable .log file (one JSON object per line).
 * - Privacy: never pass user-entered problem text or personal data in `ctx`.
 *   Values are truncated and the buffer never leaves the device unless the
 *   user downloads it.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  t: string; // ISO timestamp
  level: LogLevel;
  msg: string;
  ctx?: Record<string, unknown>;
}

const STORAGE_KEY = 'physistep:logs:v1';
const MAX_ENTRIES = 500;
const MAX_STR = 500;
const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

let buffer: LogEntry[] = [];
let loaded = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let minLevel: LogLevel = import.meta.env?.DEV ? 'debug' : 'info';

const truncate = (s: string) => (s.length > MAX_STR ? s.slice(0, MAX_STR) + '…' : s);

function sanitize(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === 'string') return truncate(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Error) return { name: value.name, message: truncate(value.message), stack: truncate(value.stack ?? '') };
  if (depth >= 3) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => sanitize(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, 30)) out[k] = sanitize(v, depth + 1);
    return out;
  }
  return String(value);
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) buffer = parsed.slice(-MAX_ENTRIES);
    }
  } catch {
    buffer = [];
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 1000);
}

export function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
  } catch {
    // Storage full or blocked (private mode): logging must never break the app.
  }
}

function write(level: LogLevel, msg: string, ctx?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;
  load();
  const entry: LogEntry = { t: new Date().toISOString(), level, msg: truncate(msg) };
  if (ctx) entry.ctx = sanitize(ctx) as Record<string, unknown>;
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer = buffer.slice(-MAX_ENTRIES);
  if (import.meta.env?.DEV && import.meta.env?.MODE !== 'test') {
    // eslint-disable-next-line no-console
    (console[level === 'debug' ? 'log' : level] as (...a: unknown[]) => void)(`[${level}] ${msg}`, ctx ?? '');
  }
  scheduleFlush();
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => write('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => write('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => write('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => write('error', msg, ctx),
};

export function setLogLevel(level: LogLevel) {
  minLevel = level;
}

export function getLogs(): LogEntry[] {
  load();
  return [...buffer];
}

export function clearLogs() {
  buffer = [];
  loaded = true;
  flush();
}

/** Serialise as a plain-text log file: one JSON object per line. */
export function formatLogFile(entries: LogEntry[] = getLogs()): string {
  const header = `# PhysiStep log — generated ${new Date().toISOString()} — ${entries.length} entries`;
  return [header, ...entries.map((e) => JSON.stringify(e))].join('\n') + '\n';
}

export function downloadLogFile(): void {
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const blob = new Blob([formatLogFile()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `physistep-${stamp}.log`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let handlersInstalled = false;

/** Capture uncaught errors and rejected promises. Call once at startup. */
export function installGlobalErrorHandlers() {
  if (handlersInstalled || typeof window === 'undefined') return;
  handlersInstalled = true;
  window.addEventListener('error', (e) => {
    logger.error('window.error', { message: e.message, source: e.filename, line: e.lineno, col: e.colno });
  });
  window.addEventListener('unhandledrejection', (e) => {
    logger.error('unhandledrejection', { reason: e.reason instanceof Error ? e.reason : String(e.reason) });
  });
  window.addEventListener('pagehide', flush);
  logger.info('app.start', { ua: navigator.userAgent, standalone: window.matchMedia?.('(display-mode: standalone)').matches ?? false });
}

/** Test helper. */
export function __resetLoggerForTests() {
  buffer = [];
  loaded = false;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
}
