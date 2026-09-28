// apps/web/src/functions/get-user.server.ts
import "@tanstack/react-start/server-only";

import { auth } from "@smart/auth";
import type { Role } from "@smart/auth/roles";
import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

interface GetUserServerQuery {
	disableCookieCache?: boolean;
	disableRefresh?: boolean;
}

/** Returns the current user, or null. Forwards refreshed cookies. */
export const getUserImpl = createServerOnlyFn(
	async (query?: GetUserServerQuery) => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
			query,
			returnHeaders: true,
		});
		const cookies = session.headers?.getSetCookie();
		if (cookies?.length) setResponseHeader("Set-Cookie", cookies);
		return session.response?.user ?? null;
	}
);

/** Returns the full session (user + session record), or null. */
export const getSessionImpl = createServerOnlyFn(
	async (query?: GetUserServerQuery) => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
			query,
			returnHeaders: true,
		});
		const cookies = session.headers?.getSetCookie();
		if (cookies?.length) setResponseHeader("Set-Cookie", cookies);
		return session.response ?? null;
	}
);

/** Returns the user if they have one of `allowedRoles`, otherwise null. */
export const requireRoleImpl = createServerOnlyFn(
	async (allowedRoles: Role | Role[]) => {
		const user = await getUserImpl();
		if (!user) return null;
		const roles = Array.isArray(allowedRoles)
			? allowedRoles
			: [allowedRoles];
		const userRole = user.role as Role | undefined;
		if (!(userRole && roles.includes(userRole))) return null;
		return user;
	}
);

export type AuthUser = Awaited<ReturnType<typeof getUserImpl>>;
export type SessionResult = Awaited<ReturnType<typeof getSessionImpl>>;
