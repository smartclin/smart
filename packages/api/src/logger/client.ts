// src/lib/logger/client.ts
import { ORPCError } from "@orpc/client";
import pino, { type Logger, type LoggerOptions } from "pino";

export const LOG_SERVICES = Object.freeze({
	DEFAULT: "default",
	SERVER: "server",
	WEB_CLIENT: "web__client",
	WEB_SERVER: "web__server",
});

export type LogService = (typeof LOG_SERVICES)[keyof typeof LOG_SERVICES];
// src/lib/logger/server.ts

// Add this function after the imports
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

	// Check for specific error types
	if (error instanceof Error) {
		if (error.name === "ValidationError") {
			return "warn";
		}
		if (error.name === "DatabaseError") {
			return "error";
		}
	}

	return "error";
}
export type HttpLogDrainOptions = {
	drain?: {
		endpoint: string;
		credentials?: "omit" | "same-origin" | "include";
		[key: string]: unknown; // Index signature with proper type
	};
	[key: string]: unknown; // Index signature with proper type
};

type ClientLoggerConfig = {
	batchedTransport?: HttpLogDrainOptions;
	console?: boolean;
	enabled?: boolean;
	minLevel?: LoggerOptions["level"];
	pretty?: boolean;
	service?: string;
};

type LogEvent = Record<string, unknown>;
type LogMethod = Logger["info"];

const DEFAULT_CLIENT_LOGGER_CONFIG = {
	service: LOG_SERVICES.DEFAULT,
} satisfies ClientLoggerConfig;

let isInitialized = false;
let identityContext: LogEvent = {};
let loggerInstance: Logger | null = null;

function isBrowserRuntime() {
	return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Initialize browser logging with Pino.
 */
export function initLog(config: ClientLoggerConfig = {}) {
	if (!isBrowserRuntime()) {
		return;
	}

	if (isInitialized) {
		return;
	}

	const enabled = config.enabled ?? true;
	const minLevel = config.minLevel ?? "info";

	const browserConfig: LoggerOptions["browser"] = {
		asObject: true,
	};

	if (config.console === false) {
		browserConfig.transmit = {
			level: minLevel,
			send: (_level: string, _logEvent: unknown) => {
				// Suppress console output if console === false
			},
		};
	}

	if (config.batchedTransport?.drain?.endpoint) {
		const { endpoint, credentials } = config.batchedTransport?.drain ?? {};
		browserConfig.transmit = {
			level: minLevel,
			send: (level: string, logEvent: unknown) => {
				if (!enabled) return;

				const body = JSON.stringify({
					level,
					time: (logEvent as { ts?: number }).ts ?? Date.now(),
					messages: (logEvent as { messages?: unknown[] }).messages,
				});

				if (navigator.sendBeacon) {
					navigator.sendBeacon(endpoint, body);
				} else {
					fetch(endpoint, {
						method: "POST",
						body,
						credentials,
						headers: { "Content-Type": "application/json" },
						keepalive: true,
					}).catch(() => {
						// Fallback error handling for network errors
					});
				}
			},
		};
	}

	loggerInstance = pino({
		enabled,
		level: minLevel,
		base: {
			service: config.service ?? DEFAULT_CLIENT_LOGGER_CONFIG.service,
		},
		browser: browserConfig,
	});

	isInitialized = true;
}

function getLogger(): Logger {
	if (!loggerInstance) {
		loggerInstance = pino({
			enabled: false,
			browser: { asObject: true },
		});
	}
	return loggerInstance;
}

// Type for log method arguments
type LogArg = LogEvent | Error | string;

const debugLogMethod: LogMethod = (
	obj: LogArg,
	msg?: string,
	...args: unknown[]
) => {
	getLogger().debug(obj as LogEvent, msg, ...args);
};

const errorLogMethod: LogMethod = (
	obj: LogArg,
	msg?: string,
	...args: unknown[]
) => {
	getLogger().error(obj as LogEvent, msg, ...args);
};

const infoLogMethod: LogMethod = (
	obj: LogArg,
	msg?: string,
	...args: unknown[]
) => {
	getLogger().info(obj as LogEvent, msg, ...args);
};

const warnLogMethod: LogMethod = (
	obj: LogArg,
	msg?: string,
	...args: unknown[]
) => {
	getLogger().warn(obj as LogEvent, msg, ...args);
};

/**
 * Simple browser logging API.
 */
export const log = {
	debug: withIdentity(debugLogMethod),
	error: withIdentity(errorLogMethod),
	info: withIdentity(infoLogMethod),
	warn: withIdentity(warnLogMethod),
} as {
	debug: typeof debugLogMethod;
	error: typeof errorLogMethod;
	info: typeof infoLogMethod;
	warn: typeof warnLogMethod;
};

/**
 * Attach user/session context to future browser log events.
 */
export function setIdentity(identity: LogEvent) {
	if (!isBrowserRuntime()) {
		return;
	}
	identityContext = { ...identity };
}

/**
 * Clear browser identity context.
 */
export function clearIdentity() {
	if (!isBrowserRuntime()) {
		return;
	}
	identityContext = {};
}

function withIdentity(method: LogMethod): LogMethod {
	function logWithIdentity(
		arg: LogEvent | Error | string,
		message?: string,
		...args: unknown[]
	): void {
		if (!isBrowserRuntime()) {
			return;
		}

		// Handle Error case
		if (arg instanceof Error) {
			method({ err: arg, ...identityContext });
			return;
		}

		// Handle Record<string, unknown> case
		if (isRecord(arg)) {
			method({
				...identityContext,
				...arg,
			});
			return;
		}

		// Handle string case
		if (typeof arg === "string") {
			if (message === undefined) {
				method(identityContext, arg);
			} else {
				method(identityContext, arg, message, ...args);
			}
			return;
		}

		// Fallback
		method({
			...identityContext,
			...(arg as LogEvent),
		});
	}

	return logWithIdentity as LogMethod;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
