// packages/api/src/routers/database.ts

import { ORPCError } from "@orpc/server";
import {
	clearAllTables,
	exportAllTables,
	exportTable,
	getTableCounts,
	importAllTables,
	TABLES,
	type TableName,
} from "@smart/db";
import { z } from "zod";

import { adminProcedure } from "../index";
import { logger } from "../logger/server";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const tableNameSchema = z.enum(TABLES as [TableName, ...TableName[]]);
/** Every table name the database router knows about. */
export type DatabaseTableName = z.infer<typeof tableNameSchema>;

/** Row counts keyed by table name. */
export type DatabaseTableCounts = Record<DatabaseTableName, number>;

/** A single row from a backup — untyped at this layer, validated per-table. */
const backupRowSchema = z.record(z.string(), z.unknown());

const importSchema = z.object({
	// ✅ No `.optional()` on the value — partialRecord makes keys optional,
	// and every present value is guaranteed to be an array.
	tables: z.partialRecord(tableNameSchema, z.array(backupRowSchema)),
	transactional: z.boolean().optional().default(true),
});

const exportSchema = z.object({
	/** Omit to export all tables. */
	table: tableNameSchema.optional(),
});

export interface DatabaseBackup {
	clinicId?: string;
	createdAt: string;
	tables: Partial<Record<DatabaseTableName, Record<string, unknown>[]>>;
	version: 1;
}
// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export const databaseRouter = {
	/** Row counts for every table, used by the Storage overview card. */
	getTableCounts: adminProcedure.handler(async ({ context }) => {
		logger.info({
			msg: "Database: getTableCounts",
			userId: context.user?.id,
		});
		return getTableCounts();
	}),

	/** Export one table or all tables as a JSON-safe payload. */
	export: adminProcedure
		.input(exportSchema)
		.handler(async ({ input, context }) => {
			logger.info({
				msg: "Database: export",
				userId: context.user?.id,
				table: input.table ?? "all",
			});

			if (input.table) {
				return {
					version: 1 as const,
					createdAt: new Date().toISOString(),
					clinicId: context.clinicId,
					tables: { [input.table]: await exportTable(input.table) },
				};
			}

			return {
				version: 1 as const,
				createdAt: new Date().toISOString(),
				clinicId: context.clinicId,
				tables: await exportAllTables(),
			};
		}),

	/**
	 * Replace the contents of every table present in the payload.
	 *
	 * DESTRUCTIVE — the router enforces `adminProcedure`, and this logs
	 * a structured audit event on success and failure.
	 */
	import: adminProcedure
		.input(importSchema)
		.handler(async ({ input, context }) => {
			const tableCount = Object.keys(input.tables).length;
			const rowCount = Object.values(input.tables).reduce(
				(sum, rows) => sum + rows.length,
				0
			);

			logger.warn({
				msg: "Database: import starting",
				userId: context.user?.id,
				clinicId: context.clinicId,
				tableCount,
				rowCount,
			});

			try {
				await importAllTables(input.tables);
				logger.warn({
					msg: "Database: import complete",
					userId: context.user?.id,
					tableCount,
					rowCount,
				});
				return { success: true, tableCount, rowCount };
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				logger.error({
					msg: "Database: import failed",
					userId: context.user?.id,
					error: message,
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: `Import failed: ${message}`,
					cause: error,
				});
			}
		}),

	/**
	 * Wipe every table. The client is responsible for downloading a
	 * backup first — the router does not do it, to keep the mutation
	 * side-effect-free from the client's perspective.
	 */
	clear: adminProcedure.handler(async ({ context }) => {
		logger.warn({
			msg: "Database: clear all tables",
			userId: context.user?.id,
			clinicId: context.clinicId,
		});

		try {
			await clearAllTables();
			return { success: true };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown error";
			logger.error({
				msg: "Database: clear failed",
				userId: context.user?.id,
				error: message,
			});
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: `Clear failed: ${message}`,
				cause: error,
			});
		}
	}),
};

export type DatabaseRouter = typeof databaseRouter;
