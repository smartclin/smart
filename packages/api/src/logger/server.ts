// src/lib/logger/server.ts

import fs from "node:fs/promises";

import { ORPCError } from "@orpc/server";
import pino, { type Level, type Logger } from "pino";
export type LogFields = Record<string, unknown>;

export interface StructuredLogger {
	debug: (message: string, fields?: LogFields) => void;
	error: (message: string, error?: Error, fields?: LogFields) => void;
	info: (message: string, fields?: LogFields) => void;
	warn: (message: string, fields?: LogFields) => void;
}

// --- NEW FUNCTION: Get error log level ---
export function getErrorLogLevel(
	error: unknown
): "debug" | "info" | "warn" | "error" {
	if (error instanceof ORPCError) {
		switch (error.code) {
			case "UNAUTHORIZED":
			case "FORBIDDEN":
				return "warn";
			case "BAD_REQUEST":
			case "NOT_FOUND":
			case "CONFLICT":
				return "info";
			case "INTERNAL_SERVER_ERROR":
				return "error";
			default:
				return "error";
		}
	}

	if (error instanceof Error) {
		if (error.name === "ValidationError") {
			return "warn";
		}
		if (
			error.name === "DatabaseError" ||
			error.name === "PrismaClientKnownRequestError"
		) {
			return "error";
		}
	}

	return "error";
}

export function createStructuredLogger(logger: Logger): StructuredLogger {
	return {
		info: (message: string, fields?: LogFields) =>
			logger.info({ ...fields, msg: message }),
		error: (message: string, error?: Error, fields?: LogFields) =>
			logger.error({ ...fields, err: error, msg: message }),
		warn: (message: string, fields?: LogFields) =>
			logger.warn({ ...fields, msg: message }),
		debug: (message: string, fields?: LogFields) =>
			logger.debug({ ...fields, msg: message }),
	};
}

export function logPerformance(
	logger: Logger,
	operation: string,
	startTime: number,
	metadata?: Record<string, unknown>
) {
	const duration = performance.now() - startTime;
	logger.info({
		event: "performance",
		operation,
		durationMs: duration,
		...metadata,
	});

	if (duration > 1000) {
		logger.warn({
			event: "slow_operation",
			operation,
			durationMs: duration,
			...metadata,
		});
	}
}

export const createLogger = (name: string, level: Level = "info") =>
	pino({
		name,
		level,
		redact: {
			paths: ["password", "token", "authorization", "*.email"],
			censor: "[REDACTED]",
		},
		formatters: {
			level: (label: string) => ({ level: label }),
			bindings: (bindings: pino.Bindings) => ({
				pid: bindings.pid,
				host: bindings.hostname,
				env: process.env.NODE_ENV,
				service: name,
			}),
		},
		timestamp: pino.stdTimeFunctions.isoTime,
	});

export class LoggerManager {
	private static instance: LoggerManager | undefined;
	private readonly loggers: Map<string, Logger> = new Map();
	private readonly logLevelFile = "./log-level.json";

	private constructor() {}

	static getInstance(): LoggerManager {
		if (!LoggerManager.instance) {
			LoggerManager.instance = new LoggerManager();
		}
		return LoggerManager.instance;
	}

	getLogger(name: string): Logger {
		if (!this.loggers.has(name)) {
			const logger = createLogger(name, "info");
			this.loggers.set(name, logger);

			this.getLogLevel(name).then((level) => {
				logger.level = level;
			});
		}
		return this.loggers.get(name) as Logger;
	}
	async setLogLevel(name: string, level: Level) {
		const logger = this.loggers.get(name);
		if (logger) {
			logger.level = level;
		}
		const levels = await this.getAllLogLevels();
		levels[name] = level;
		await fs.writeFile(
			this.logLevelFile,
			JSON.stringify(levels, null, 2),
			"utf-8"
		);
	}

	private async getLogLevel(name: string): Promise<Level> {
		try {
			const levels = await this.getAllLogLevels();
			return (levels[name] as Level) || "info";
		} catch {
			return "info";
		}
	}

	private async getAllLogLevels(): Promise<Record<string, string>> {
		try {
			const text = await fs.readFile(this.logLevelFile, "utf-8");
			return JSON.parse(text || "{}");
		} catch {
			return {};
		}
	}
}

export type TraceContext = {
	traceId: string;
	requestId: string;
	userId?: string;
};

export function createTraceLogger(
	logger: Logger,
	context: TraceContext
): Logger {
	return logger.child({
		traceId: context.traceId,
		requestId: context.requestId,
		userId: context.userId,
	});
}

export function attachTraceContext(
	req: Request,
	logger: Logger
): { logger: Logger; traceId: string } {
	const traceId = req.headers.get("x-trace-id") || crypto.randomUUID();
	const requestId = crypto.randomUUID();

	const traceLogger = createTraceLogger(logger, {
		traceId,
		requestId,
	});

	return { logger: traceLogger, traceId };
}

const SENSITIVE_PATHS = [
	"password",
	"token",
	"authorization",
	"api_key",
	"secret",
	"credit_card",
	"ssn",
	"*.password",
	"*.token",
	"*.authorization",
	"headers.authorization",
	"*.email",
	"*.phone",
	"*.address",
	"body.password",
	"body.token",
];

export function redactSensitiveData(data: unknown): unknown {
	if (typeof data !== "object" || data === null) {
		return data;
	}

	const result = { ...(data as Record<string, unknown>) };

	for (const [key, value] of Object.entries(result)) {
		if (
			SENSITIVE_PATHS.some((pattern: string) => {
				const regex = new RegExp(pattern.replace(/\*/g, ".*"));
				return regex.test(key);
			})
		) {
			result[key] = "[REDACTED]";
		} else if (typeof value === "object" && value !== null) {
			result[key] = redactSensitiveData(value);
		}
	}

	return result;
}

// Singleton exports
export const loggerManager = LoggerManager.getInstance();
export const rootLogger = loggerManager.getLogger("app");

// Enhanced logger with child support
export const logger = {
	child: (bindings: Record<string, unknown>) => rootLogger.child(bindings),
	info: (message: string | Record<string, unknown>, fields?: LogFields) => {
		if (typeof message === "string") {
			rootLogger.info({ ...fields, msg: message });
		} else {
			rootLogger.info({ ...message, ...fields });
		}
	},
	error: (
		message: string | Record<string, unknown>,
		error?: Error,
		fields?: LogFields
	) => {
		if (typeof message === "string") {
			rootLogger.error({ ...fields, err: error, msg: message });
		} else {
			rootLogger.error({ ...message, err: error, ...fields });
		}
	},
	warn: (message: string | Record<string, unknown>, fields?: LogFields) => {
		if (typeof message === "string") {
			rootLogger.warn({ ...fields, msg: message });
		} else {
			rootLogger.warn({ ...message, ...fields });
		}
	},
	debug: (message: string | Record<string, unknown>, fields?: LogFields) => {
		if (typeof message === "string") {
			rootLogger.debug({ ...fields, msg: message });
		} else {
			rootLogger.debug({ ...message, ...fields });
		}
	},
};
