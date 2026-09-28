//apps/web/src/lib/auth-client.ts
import type { auth } from "@smart/auth";
import { ac, roles } from "@smart/auth/roles";
import { env } from "@smart/env/web";
import {
	adminClient,
	customSessionClient,
	emailOTPClient,
	inferAdditionalFields,
	lastLoginMethodClient,
	magicLinkClient,
	organizationClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_BASE_URL,

	plugins: [
		magicLinkClient(),
		customSessionClient<typeof auth>(),
		adminClient({
			ac,
			roles,
		} as Parameters<typeof adminClient>[0]),
		organizationClient({
			ac,
			roles,
			dynamicAccessControl: { enabled: true },
		} as Parameters<typeof organizationClient>[0]),
		emailOTPClient(),
		twoFactorClient(),
		lastLoginMethodClient(),
		inferAdditionalFields<typeof auth>(),
	],
});

export const { useSession, signIn, signUp, signOut } = authClient;

export type AuthSession = Awaited<ReturnType<typeof authClient.getSession>>;
export type AuthUser = NonNullable<AuthSession["data"]>["user"];
export type Role = AuthUser["role"];
