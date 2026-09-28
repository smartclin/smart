// apps/web/src/functions/get-user.ts
import type { Role } from "@smart/auth/roles";
import { createServerFn } from "@tanstack/react-start";
import {
	getSessionImpl,
	getUserImpl,
	requireRoleImpl,
} from "./get-user.server";

export const getUser = createServerFn({ method: "GET" }).handler(async () =>
	getUserImpl()
);

export const getSession = createServerFn({ method: "GET" }).handler(async () =>
	getSessionImpl()
);

export const requireRole = createServerFn({ method: "GET" })
	.validator((roles: Role | Role[]) => roles)
	.handler(async ({ data }) => requireRoleImpl(data));
