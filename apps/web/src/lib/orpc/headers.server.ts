// apps/web/src/lib/orpc/headers.server.ts
// ⚠️ Server-only. Never import this from client code.
// TanStack Start will refuse to bundle it into a client chunk.

import { getRequestHeaders } from "@tanstack/react-start/server";

/**
 * Forward the incoming request's headers (including cookies) so
 * Better Auth can read the session during SSR.
 */
export function getForwardedHeaders(): Headers {
	return getRequestHeaders();
}
