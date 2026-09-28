import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// env/src/server.ts
export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url().optional(),
		PGLITE_ENABLE_VECTOR: z.string().default("true"),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		CONNECTION_POOL_MAX: z.string().optional(),
		CLINIC_NAME: z.string().optional(),
		CLINIC_TIMEZONE: z.string().optional(),
		CLINIC_CURRENCY: z.string().optional(),
		OIDC_CLIENT_ID: z.string().optional(),
		OIDC_CLIENT_SECRET: z.string().optional(),
		OIDC_PROVIDER_URL: z.url().optional(),
		OIDC_AUTHORIZATION_URL: z.url().optional(),
		OIDC_TOKEN_URL: z.url().optional(),
		OIDC_USERINFO_URL: z.url().optional(),
		LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
		GITHUB_CLIENT_ID: z.string().optional(),
		GITHUB_CLIENT_SECRET: z.string().optional(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),

		// Vector search (packages/db/src/vector)
		EMBEDDING_PROVIDER: z.enum(["openai", "lmstudio", "none"]).optional(),
		EMBEDDING_DIMENSION: z.string().optional(),
		OPENAI_API_KEY: z.string().optional(),
		OPENAI_EMBEDDING_MODEL: z.string().optional(),
		LM_STUDIO_BASE_URL: z.url().optional(),
		LM_STUDIO_EMBEDDING_MODEL: z.url().optional(),

		// Full-text search (packages/db/repositories)
		USE_FTS: z.string().optional(),

		// Seed configuration environment variables
		SEED_ADMIN_EMAIL: z.string().email().optional(),
		SEED_ADMIN_PASSWORD: z.string().optional(),
		SEED_ADMIN_NAME: z.string().optional(),
		SEED_ADMIN_ADDRESS: z.string().optional(),
		SEED_ADMIN_PHONE: z.string().optional(),
		SEED_STAFF_PIN: z.string().optional(),
		SEED_CLINIC_ID: z.string().optional(),
		SEED_CLINIC_NAME: z.string().optional(),
		SEED_CLINIC_ADDRESS: z.string().optional(),
		SEED_CLINIC_PHONE: z.string().optional(),
		SEED_CLINIC_EMAIL: z.string().email().optional(),
		SEED_CLINIC_TIMEZONE: z.string().optional(),
		SEED_CLINIC_CURRENCY: z.string().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});

// Seed configuration object ready for use in your scripts:
export const seedConfig = {
	admin: {
		email: (env.SEED_ADMIN_EMAIL ?? "hazem032012@gmail.com")
			.trim()
			.toLowerCase(),
		password: (env.SEED_ADMIN_PASSWORD ?? "HealthF26").trim(),
		name: (env.SEED_ADMIN_NAME ?? "Dr. Hazem").trim(),
		address: env.SEED_ADMIN_ADDRESS ?? "Hurghada",
		phone: env.SEED_ADMIN_PHONE ?? "+1000000000",
		pin: env.SEED_STAFF_PIN ?? "1234",
	},
	clinic: {
		id: env.SEED_CLINIC_ID ?? "clinic-main",
		name: env.SEED_CLINIC_NAME ?? "Smart Clinic",
		address: env.SEED_CLINIC_ADDRESS ?? "Local",
		phone: env.SEED_CLINIC_PHONE ?? "+1000000000",
		email: env.SEED_CLINIC_EMAIL ?? "clinysmar@gmail.com",
		timezone: env.SEED_CLINIC_TIMEZONE ?? "Africa/Cairo",
		currency: env.SEED_CLINIC_CURRENCY ?? "EGP",
	},
};
