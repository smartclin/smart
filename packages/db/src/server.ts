import { env } from "@smart/env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";
import { authRelations } from "./schema";

// Initialize standard PostgreSQL connection client
// `prepare: false` is recommended for compatibility with connection poolers or standard drivers
const connectionString = env.DATABASE_URL;
export const client = postgres(connectionString, { prepare: false });

export function createDb() {
	return drizzle({ client, relations: { ...relations, ...authRelations } });
}

export type Database = ReturnType<typeof createDb>;
let dbInstance: Database | null = null;

function getDbInstance(): Database {
	dbInstance ??= createDb();
	return dbInstance;
}

export const db = new Proxy({} as Database, {
	get(_target, prop) {
		const instance = getDbInstance();
		const value = Reflect.get(instance, prop);
		return typeof value === "function" ? value.bind(instance) : value;
	},
});

// ─── Types ───────────────────────────────────────────────────────────────────
export type DB = typeof db;
export type Transaction = Parameters<Parameters<DB["transaction"]>[0]>[0];
export type DBorTx = DB | Transaction;

// ─── Transactions ────────────────────────────────────────────────────────────
type QueryOptions = {
	accessMode?: "read only" | "read write";
	isolationLevel?:
		| "read uncommitted"
		| "read committed"
		| "repeatable read"
		| "serializable";
	maxRetries?: number;
};

const RETRYABLE_PG_CODES = new Set(["40001", "40P01", "55P03"]);

function isRetryableTxError(error: unknown): boolean {
	if (typeof error !== "object" || error === null) return false;
	const { code } = error as { code?: unknown };
	return typeof code === "string" && RETRYABLE_PG_CODES.has(code);
}

export async function withTransaction<T>(
	fn: (tx: Transaction) => Promise<T>,
	options: QueryOptions = {}
): Promise<T> {
	const { maxRetries = 2, ...txOptions } = options;

	const run = () => {
		const hasTxOptions =
			txOptions.isolationLevel !== undefined ||
			txOptions.accessMode !== undefined;
		return hasTxOptions
			? db.transaction(fn, txOptions)
			: db.transaction(fn);
	};

	for (let attempt = 0; ; attempt += 1) {
		try {
			return await run();
		} catch (error) {
			if (attempt >= maxRetries || !isRetryableTxError(error))
				throw error;
			const delay = 50 * 2 ** attempt + Math.random() * 50;
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
}

export async function runWithDb<T>(
	fn: (executor: DBorTx) => Promise<T>,
	options?: QueryOptions
): Promise<T> {
	const hasTxOptions =
		options?.isolationLevel !== undefined ||
		options?.accessMode !== undefined;

	if (hasTxOptions) {
		return withTransaction(async (tx) => fn(tx), options);
	}
	return fn(db);
}
export { and, asc, count, desc, eq, inArray, or, sql } from "drizzle-orm";
