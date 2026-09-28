import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin } from "@orpc/client/plugins";
import type { TanstackQueryOperationContext } from "@orpc/tanstack-query";

export interface ClientContext extends TanstackQueryOperationContext {}

/**
 * Resolve the RPC base URL for both browser and SSR.
 *
 * oRPC's StandardRPCLinkCodec requires an ABSOLUTE URL — a relative path
 * like "/api/rpc" causes `new URL()` to throw.
 *
 * On the server, `createRouterClient` (client.ts) bypasses the network
 * entirely, so this only matters for browser calls.
 */
export function getBaseUrl(): string {
	if (typeof window !== "undefined") return window.location.origin;
	return process.env.APP_URL ?? "http://localhost:3001";
}

export const link = new RPCLink<ClientContext>({
	url: `${getBaseUrl()}/api/rpc`,
	fetch(_url, options) {
		return fetch(_url, {
			...options,
			credentials: "include",
		});
	},
	headers: async () => ({}),
	plugins: [
		new BatchLinkPlugin({
			groups: [{ condition: () => true, context: {} }],
		}),
	],
});
