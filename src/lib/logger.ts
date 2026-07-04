import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

const pinoLogger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    base: {
        env: process.env.NODE_ENV,
    },
});

export const logger = {
    ...pinoLogger,
    // Provide type-safe wrappers for common methods to ease IDE usage
    info: pinoLogger.info.bind(pinoLogger) as typeof pinoLogger.info,
    warn: pinoLogger.warn.bind(pinoLogger) as typeof pinoLogger.warn,
    debug: pinoLogger.debug.bind(pinoLogger) as typeof pinoLogger.debug,
    fatal: pinoLogger.fatal.bind(pinoLogger) as typeof pinoLogger.fatal,
    trace: pinoLogger.trace.bind(pinoLogger) as typeof pinoLogger.trace,
    error: (obj: unknown, msg?: string, ...args: unknown[]) => {
        // Log to stdout via pino as usual
        pinoLogger.error(obj, msg, ...args);

        // Forward to Sentry
        if (typeof obj === "object" && obj !== null && "error" in obj) {
            const errDetails = obj as { error: Error | unknown };
            Sentry.captureException(errDetails.error, { extra: { msg, ...args } });
        } else if (obj instanceof Error) {
            Sentry.captureException(obj, { extra: { msg, ...args } });
        } else {
            // It's a string or other primitive
            Sentry.captureMessage(msg || String(obj), "error");
        }
    }
};
