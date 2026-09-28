import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: "../../apps/web/.env",
});
export default defineConfig({
	schema: "./src/schema/index.ts",
	out: "./src/migrations",
	dialect: "postgresql",
	breakpoints: true,
	verbose: true,
	tablesFilter: ["!*_migrations", "!*_meta"],
	// For better performance on large schemas
	introspect: {
		casing: "preserve",
	},
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
});
