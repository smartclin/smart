import { count, sql } from "drizzle-orm";
import { preparedQueries, queryCache } from "./cache";
import {
	account,
	appointments,
	auditLogs,
	clinics,
	encounters,
	growthMeasurements,
	guardians,
	immunizations,
	labOrders,
	medicalRecords,
	patientAllergies,
	patientChronicConditions,
	patients,
	prescriptions,
	session,
	staff,
	twoFactor,
	user,
	verification,
	vitals,
	whoGrowthData,
} from "./schema";
import { client, createDb, type Database, db, withTransaction } from "./server";

export {
	and,
	between,
	count,
	eq,
	gt,
	gte,
	lt,
	lte,
	not,
	type SQL,
} from "drizzle-orm";
export * from "./server";

let cachedDb: Database | null = null;

export function getDb() {
	cachedDb ??= createDb();
	return cachedDb;
}

// ─── Readiness ───────────────────────────────────────────────────────────────
export async function checkIsDbReady(): Promise<boolean> {
	try {
		await db.execute(sql`SELECT 1`);
		return true;
	} catch (error) {
		console.error({ err: error }, "❌ Database readiness check failed");
		return false;
	}
}

// ─── Shutdown ────────────────────────────────────────────────────────────────
let isClosed = false;
export async function closeConnection(): Promise<void> {
	if (isClosed) return;
	isClosed = true;

	try {
		await client.end(); // Close the postgres-js client
		queryCache.clear();
		preparedQueries.clear();
		console.warn("✅ PostgreSQL connection closed");
	} catch (error) {
		console.error({ error }, "❌ Error closing PostgreSQL");
		throw error;
	}
}

export const dbTableMap = {
	user,
	session,
	account,
	verification,
	twoFactor,
	clinics,
	staff,
	patients,
	guardians,
	patientAllergies,
	patientChronicConditions,
	encounters,
	vitals,
	growthMeasurements,
	immunizations,
	prescriptions,
	appointments,
	labOrders,
	medicalRecords,
	auditLogs,
	whoGrowthData,
} as const;

export const TABLES = Object.keys(dbTableMap) as Array<keyof typeof dbTableMap>;
export type TableName = keyof typeof dbTableMap;
// Re-export common Drizzle utilities for convenience
export { asc, desc, inArray, or, sql } from "drizzle-orm";

export async function getTableCounts(): Promise<Record<TableName, number>> {
	const out: Partial<Record<TableName, number>> = {};
	for (const table of TABLES) {
		// ← TABLES not imported or defined
		const [row] = await db
			.select({ count: count() })
			.from(dbTableMap[table]); // ← dbTableMap not imported or defined
		out[table] = row?.count ?? 0;
	}
	return out as Record<TableName, number>;
}

export async function exportTable(table: TableName): Promise<unknown[]> {
	return await db.select().from(dbTableMap[table]);
}
export async function exportAllTables() {
	const out: Partial<Record<TableName, unknown[]>> = {};
	for (const table of TABLES) {
		out[table] = await exportTable(table);
	}
	return out;
}
export async function importAllTables(
	tables: Partial<Record<TableName, unknown[]>>
): Promise<void> {
	await withTransaction(async (tx) => {
		for (const table of TABLES) {
			const rows = tables[table];
			if (rows === undefined) continue;
			const tableDef = dbTableMap[table];
			// Cast once at the boundary; drizzle's `.values()` accepts unknown[] at runtime
			// but wants the inferred insert type. The cast documents that we trust the
			// backup file (validated earlier by `validateBackupFile` in DatabaseSettings).
			await tx.delete(tableDef);
			if (rows.length > 0) {
				const CHUNK = 500;
				for (let i = 0; i < rows.length; i += CHUNK) {
					// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- validated by caller
					await tx
						.insert(tableDef)
						.values(rows.slice(i, i + CHUNK) as never);
				}
			}
		}
	});
}

export async function clearAllTables(): Promise<void> {
	await db.transaction(async (tx) => {
		for (const table of TABLES) {
			await tx.delete(dbTableMap[table]);
		}
	});
}
