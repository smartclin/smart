import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "./client";

/**
 * Central oRPC ↔ TanStack Query bridge.
 *
 * Usage:
 *   orpc.patient.list.queryOptions({ input: { limit: 20, offset: 0 } })
 *   orpc.patient.list.infiniteOptions({ ... })
 *   orpc.patient.create.mutationOptions()
 *   orpc.patient.key()               → partial match (for invalidation)
 *   orpc.patient.list.queryKey(...)  → full match
 */
export const orpc = createTanstackQueryUtils(client, {
	path: ["orpc"], // stable base namespace — prevents key collisions
});
