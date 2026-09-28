// packages/db/src/migrate.ts

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "@smart/env/server";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { createDb } from "./index";

const HERE = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
	console.info("🐘 Applying migrations to PostgreSQL...");

	// Create a dedicated migration client
	const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
	const db = createDb();

	try {
		await migrate(db, {
			migrationsFolder: resolve(HERE, "migrations"),
		});
		console.info("✅ PostgreSQL migrations completed successfully!");
	} finally {
		await migrationClient.end();
	}
}

runMigrations()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	});
