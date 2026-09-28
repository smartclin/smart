import { createORPCClient, createSafeClient } from "@orpc/client";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { appRouter } from "@smart/api/routers/index";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createContext } from "../../context";
import { link } from "./link";

const getORPCClient = createIsomorphicFn()
	.server(() =>
		createRouterClient(appRouter, {
			context: async () => createContext({ req: getRequest() }),
		})
	)
	.client((): RouterClient<typeof appRouter> => createORPCClient(link));

export const client: RouterClient<typeof appRouter> = getORPCClient();

/** Safe client — returns `{ data, error }` instead of throwing. */
export const api = createSafeClient(client);
