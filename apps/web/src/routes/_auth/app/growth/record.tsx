// src/routes/_auth/app/growth/record.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy route kept for backwards-compatible bookmarks.
 * Canonical "record a measurement" flow lives at `/app/growth/new`.
 */
export const Route = createFileRoute("/_auth/app/growth/record")({
	validateSearch: (
		search: Record<string, unknown>
	): { patientId?: string } => ({
		patientId:
			typeof search.patientId === "string" ? search.patientId : undefined,
	}),
	beforeLoad: ({ search }) => {
		throw redirect({
			to: "/app/growth/new",
			search: search.patientId ? { patientId: search.patientId } : {},
		});
	},
});
