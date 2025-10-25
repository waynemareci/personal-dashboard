import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pino before importing logger
vi.mock('pino', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    level: 'info'
  }))
}));

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.LOG_LEVEL;
  });

  it('should create logger with default info level', async () => {
    const pino = await import('pino');
    const { logger } = await import('./logger');

    expect(pino.default).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info'
      })
    );
    expect(logger).toBeDefined();
  });

  it('should use LOG_LEVEL environment variable', async () => {
    process.env.LOG_LEVEL = 'debug';
    
    // Clear module cache to force re-import
    vi.resetModules();
    
    const pino = await import('pino');
    await import('./logger');

    expect(pino.default).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'debug'
      })
    );
  });

  it('should configure pretty transport in development', async () => {
    process.env.NODE_ENV = 'development';
    
    // Clear module cache to force re-import
    vi.resetModules();
    
    const pino = await import('pino');
    await import('./logger');

    expect(pino.default).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({
          target: 'pino-pretty',
          options: expect.objectContaining({
            colorize: true,
            translateTime: true,
            ignore: 'pid,hostname'
          })
        })
      })
    );
  });

  it('should not configure transport in production', async () => {
    process.env.NODE_ENV = 'production';
    
    // Clear module cache to force re-import
    vi.resetModules();
    
    const pino = await import('pino');
    await import('./logger');

    const config = (pino.default as any).mock.calls[0][0];
    expect(config.transport).toBeUndefined();
  });
});