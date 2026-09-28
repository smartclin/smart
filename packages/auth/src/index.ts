import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "@smart/db";
import * as schema from "@smart/db/schema/index";
import { env } from "@smart/env/server";
import { createId } from "@smart/utils/id";
import { APIError, betterAuth } from "better-auth";
import {
	admin,
	customSession,
	genericOAuth,
	magicLink,
	openAPI,
	organization,
	twoFactor,
} from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm"; // Added missing Drizzle operator
import { ac, roles } from "./roles";
import { EMAIL_REGEX, oidcConfigured, sendPasswordResetEmail } from "./utils";

// Placeholder implementations for your role caching layer
function sweepRoleCache() {}
function getCachedRole(
	_userId: string
): { role: string; clinicId: string | null } | undefined {
	return undefined;
}
function setCachedRole(
	_userId: string,
	_role: string,
	_clinicId: string | null
) {}

export type AuthConfig = {
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	OIDC_CLIENT_ID?: string;
	OIDC_CLIENT_SECRET?: string;
	GITHUB_CLIENT_ID?: string;
	GITHUB_CLIENT_SECRET?: string;
	OIDC_PROVIDER_URL?: string;
	OIDC_AUTHORIZATION_URL?: string;
	OIDC_TOKEN_URL?: string;
	OIDC_USERINFO_URL?: string;
};

export function createAuth() {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}),
		trustedOrigins: [env.BETTER_AUTH_URL],
		secret: env.BETTER_AUTH_SECRET,

		telemetry: {
			enabled: false,
		},
		rateLimit: {
			storage: "database",
			modelName: "rateLimit",
		},
		baseURL: env.BETTER_AUTH_URL,
		plugins: [
			admin({
				ac,
				roles,
				adminRoles: ["admin"],
			}),
			openAPI({
				theme: "deepSpace",
			}),
			twoFactor(),

			customSession(async ({ user, session }) => {
				sweepRoleCache();

				let dbUser = getCachedRole(user.id);

				if (!dbUser) {
					const result = await db // Fixed: reference database argument instead of global `db`
						.select({
							role: schema.user.role,
							clinicId: schema.user.clinicId,
						})
						.from(schema.user)
						.where(eq(schema.user.id, user.id))
						.limit(1);

					const [row] = result;

					if (row) {
						dbUser = {
							role: row.role ?? "doctor",
							clinicId: row.clinicId ?? null,
						};
						setCachedRole(user.id, dbUser.role, dbUser.clinicId);
					}
				}

				const role = dbUser?.role ?? "patient";

				return {
					user: {
						...user,
						role,
						clinicId: dbUser?.clinicId ?? null,
					},
					session,
				};
			}),
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					console.info({
						msg: "Magic link dispatched",
						email,
					});

					if (env.NODE_ENV !== "production") {
						console.debug({
							msg: "Dev-mode magic link available",
							urlLength: url.length,
						});
					}
				},
			}),
			organization({
				ac,
				roles,
				dynamicAccessControl: {
					enabled: true,
				},
			}),
			...(oidcConfigured
				? [
						genericOAuth({
							config: [
								{
									providerId: "oidc",
									clientId: env.OIDC_CLIENT_ID as string,
									clientSecret:
										env.OIDC_CLIENT_SECRET as string,
									scopes: ["openid", "profile", "email"],
									...(env.OIDC_PROVIDER_URL
										? {
												discoveryUrl: `${env.OIDC_PROVIDER_URL}/.well-known/openid-configuration`,
											}
										: {
												authorizationUrl:
													env.OIDC_AUTHORIZATION_URL as string,
												tokenUrl:
													env.OIDC_TOKEN_URL as string,
												userinfoUrl:
													env.OIDC_USERINFO_URL as string,
											}),
								},
							],
						}),
					]
				: []),
			tanstackStartCookies(),
		],
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
			storeSessionInDatabase: true,
			cookieCache: {
				enabled: true,
				maxAge: 60,
			},
		},
		account: {
			encryptOAuthTokens: true,
			accountLinking: {
				enabled: true,
			},
		},

		// https://better-auth.com/docs/concepts/oauth
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID as string,
				clientSecret: env.GITHUB_CLIENT_SECRET as string,
			},
			google: {
				clientId: env.GOOGLE_CLIENT_ID as string,
				clientSecret: env.GOOGLE_CLIENT_SECRET as string,
			},
		},

		advanced: {
			database: {
				joins: true,
				generateId: () => createId(),
				defaultFindManyLimit: 50,
			},
			useSecureCookies: env.NODE_ENV === "production",
			cookiePrefix: "auth",
			crossSubDomainCookies: {
				enabled: true,
				domain:
					env.NODE_ENV === "production" ? ".clinic.com" : "localhost",
			},
		},
		logger: {
			level: env.NODE_ENV === "production" ? "error" : "info",
			disabled: false,
		},
		user: {
			additionalFields: {
				role: {
					type: ["doctor", "staff", "patient", "admin"],
					required: false,
					input: false,
				},
				clinicId: {
					type: "string",
					required: false,
					input: false,
				},
				apiKey: { type: "string", required: false, input: false },
				address: { type: "string", required: false, input: true },
				phone: { type: "string", required: false, input: true },
			},
			deleteUser: {
				enabled: true,
				beforeDelete: async (user) => {
					const result = await db
						.select({ role: schema.user.role })
						.from(schema.user)
						.where(eq(schema.user.id, user.id))
						.limit(1);
					const [fullUser] = result;

					if (fullUser?.role?.toLowerCase() === "doctor") {
						const patientCount = await db
							.select({ count: schema.patients.id })
							.from(schema.patients)
							.where(eq(schema.patients.userId, user.id))
							.limit(1);

						if (patientCount.length > 0) {
							throw new APIError("BAD_REQUEST", {
								message:
									"Doctor has active patients and cannot be deleted",
							});
						}
					}
				},
			},
			changeEmail: {
				enabled: true,
			},
		},
		updateUser: {
			enabled: true,
		},
		databaseHooks: {
			user: {
				create: {
					before: async (user) => {
						const email = user.email?.trim().toLowerCase();
						if (!(email && EMAIL_REGEX.test(email))) {
							throw new APIError("BAD_REQUEST", {
								message: "Invalid email format",
							});
						}
						return {
							data: {
								...user,
								email,
								name: user.name?.trim() || "Unnamed User",
								role: "patient",
								isAdmin: false,
							},
						};
					},
				},
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			minPasswordLength: 8,
			resetPassword: {
				enabled: true,
				expiresIn: 60 * 60,
			},
		},
		email: {
			from: "Pediatric Care <noreply@pediatriccare.com>",
			sendResetPassword: async ({
				email,
				url,
			}: {
				email: string;
				url: string;
				_token: string;
			}) => {
				await sendPasswordResetEmail(email, url);
			},
		},
	});
}
export const auth = createAuth();
export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
export type User = ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
