// packages/api/src/serializer.ts
import { StandardRPCJsonSerializer } from "@orpc/client/standard";

/**
 * Single serializer instance shared between the HTTP link, the QueryClient,
 * and the SSR dehydrate/hydrate pipeline.
 *
 * `StandardRPCJsonSerializer` already handles Date, undefined, bigint, URL,
 * RegExp, Map, Set, and Infinity. Only add `customJsonSerializers` here if
 * your procedures return exotic types (Temporal, Decimal, etc.).
 */

export const serializer = new StandardRPCJsonSerializer({
	customJsonSerializers: [],
});
