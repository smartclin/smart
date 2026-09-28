// packages/db/src/reset.ts

import { env } from "@smart/env/server";
import { db, sql } from "./index";

interface ResetOptions {
	closeAfter?: boolean;
	force?: boolean;
}

export async function resetDatabase(options: ResetOptions = {}): Promise<void> {
	const { force = false } = options;

	if (env.NODE_ENV === "production" && !force) {
		throw new Error(
			"❌ Refusing to reset database in production without { force: true }."
		);
	}

	console.warn("⚠️  Resetting PostgreSQL database schema...");

	try {
		// Drop and recreate the public schema to completely clear all tables and relations
		await db.execute(sql`DROP SCHEMA public CASCADE;`);
		await db.execute(sql`CREATE SCHEMA public;`);

		// Re-enable required extensions like pgcrypto
		await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

		console.info("✅ PostgreSQL database schema reset successful.");
	} catch (error) {
		console.error("❌ Critical error during database reset:", error);
		throw error;
	}
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
if (import.meta.main) {
	const force =
		process.argv.includes("--force") || process.argv.includes("-f");

	resetDatabase({ force })
		.then(() => {
			console.log("✅ Done!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Reset failed:", error);
			process.exit(1);
		});
}
