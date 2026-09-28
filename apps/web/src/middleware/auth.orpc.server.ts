// apps/web/src/middleware/auth.orpc.server.ts
import "@tanstack/react-start/server-only";

import { ORPCError } from "@orpc/server";
import { o } from "@smart/api";
import { auth } from "@smart/auth";

/** oRPC middleware. Do NOT use with `createServerFn`. */
export const authMiddleware = o.middleware(async ({ context, next }) => {
	const sessionData = await auth.api.getSession({
		headers: context.request.headers,
	});

	if (!(sessionData?.session && sessionData?.user)) {
		throw new ORPCError("UNAUTHORIZED");
	}

	return next({
		context: {
			session: {
				user: sessionData.user,
				session: sessionData.session,
			},
			user: sessionData.user,
		},
	});
});
