import "@tanstack/react-start/server-only";

import type { Context as ApiContext } from "@smart/api/context";
import { auth } from "@smart/auth";
import { db } from "@smart/db";

export async function createContext({
	req,
}: {
	req: Request;
}): Promise<ApiContext> {
	const session = await auth.api.getSession({ headers: req.headers });
	return {
		db,
		session,
		user: session?.user || null,
		request: req,
		clinicId: session?.user.clinicId ?? "",
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
