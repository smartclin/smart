// apps/web/src/middleware/auth.ts
import type { Role } from "@smart/auth/roles";
import { createMiddleware } from "@tanstack/react-start";
import { getSessionImpl, getUserImpl } from "@/functions/get-user.server";

// ============================================================================
// TanStack Start middleware — for `createServerFn` and routes
// ============================================================================

export const sessionMiddleware = createMiddleware().server(async ({ next }) => {
	const session = await getSessionImpl();
	return next({
		context: {
			session: session?.session ?? null,
			user: session?.user ?? null,
		},
	});
});

export const freshAuthMiddleware = createMiddleware().server(
	async ({ next }) => {
		const user = await getUserImpl({ disableCookieCache: true });
		return next({ context: { user: user ?? null } });
	}
);

export const requireRoleMiddleware = (allowedRoles: Role | Role[]) =>
	createMiddleware().server(async ({ next }) => {
		const user = await getUserImpl();
		const roles = Array.isArray(allowedRoles)
			? allowedRoles
			: [allowedRoles];
		const ok = !!user?.role && roles.includes(user.role as Role);
		return next({ context: { user: ok ? user : null } });
	});
