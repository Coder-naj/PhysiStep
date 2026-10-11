import { beforeEach, describe, expect, it } from 'vitest';
import { logger, getLogs, clearLogs, formatLogFile, __resetLoggerForTests } from './logger';

describe('logger', () => {
  beforeEach(() => {
    __resetLoggerForTests();
  });

  it('records structured entries and survives missing localStorage', () => {
    logger.info('hello', { a: 1 });
    logger.error('boom', { error: new Error('x') });
    const logs = getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({ level: 'info', msg: 'hello', ctx: { a: 1 } });
    expect(logs[1].ctx?.error).toMatchObject({ name: 'Error', message: 'x' });
  });

  it('truncates long strings and caps the ring buffer', () => {
    logger.info('x', { big: 'y'.repeat(5000) });
    expect(String(getLogs()[0].ctx?.big).length).toBeLessThan(600);
    for (let i = 0; i < 700; i++) logger.info(`m${i}`);
    expect(getLogs().length).toBe(500);
    expect(getLogs().at(-1)?.msg).toBe('m699');
  });

  it('formats a JSON-lines log file', () => {
    logger.warn('w');
    const lines = formatLogFile().trim().split('\n');
    expect(lines[0]).toMatch(/^# PhysiStep log/);
    expect(JSON.parse(lines[1]).msg).toBe('w');
    clearLogs();
    expect(getLogs()).toHaveLength(0);
  });
});
