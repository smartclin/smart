// packages/tanstack/src/query/hooks/immunization.ts

import type { ImmunizationStatus } from "@smart/db/zod";
import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";

export const immunizationQueryOptions = {
	// ── getById ─────────────────────────────────────────────
	// If server input is z.string()       → input: id
	// If server input is z.object({ id }) → input: { id }
	detail: (id: string) =>
		orpc.immunization.getById.queryOptions({
			input: id, // ← change to `{ id }` if server takes an object
			enabled: Boolean(id),
		}),

	// ── getByPatientId ──────────────────────────────────────
	// Almost always an object — two params.
	list: (patientId: string, status?: ImmunizationStatus) =>
		orpc.immunization.getByPatientId.queryOptions({
			input: { patientId, status },
			enabled: Boolean(patientId),
		}),

	// ── getCount ────────────────────────────────────────────
	// Object (filters), optional. Keep as object.
	count: (filters?: { patientId?: string; status?: ImmunizationStatus }) =>
		orpc.immunization.getCount.queryOptions({
			input: filters ?? {},
		}),

	// ── getOverdue ──────────────────────────────────────────
	// If server input is z.string()          → input: patientId
	// If server input is z.object({...})     → input: { patientId }
	overdue: (patientId: string) =>
		orpc.immunization.getOverdue.queryOptions({
			input: patientId, // ← change to `{ patientId }` if server takes an object
			enabled: Boolean(patientId),
		}),

	// ── getUpcoming ─────────────────────────────────────────
	// Two params → object.
	upcoming: (patientId: string, daysAhead = 30) =>
		orpc.immunization.getUpcoming.queryOptions({
			input: { patientId, daysAhead },
			enabled: Boolean(patientId),
		}),

	// ── getComplianceRate ───────────────────────────────────
	// If server input is z.string()       → input: patientId
	// If server input is z.object({...})  → input: { patientId }
	compliance: (patientId: string) =>
		orpc.immunization.getComplianceRate.queryOptions({
			input: patientId, // ← change to `{ patientId }` if server takes an object
			enabled: Boolean(patientId),
		}),

	// ── getAllOverdue ───────────────────────────────────────
	// No input at all → omit the `input` key entirely.
	allOverdue: () => orpc.immunization.getAllOverdue.queryOptions(),
};

// ============================================================
// Hooks
// ============================================================

export function useImmunizations(
	patientId: string,
	status?: ImmunizationStatus
) {
	return useQuery(immunizationQueryOptions.list(patientId, status));
}

export function useImmunization(id: string) {
	return useQuery(immunizationQueryOptions.detail(id));
}

export function useOverdueImmunizations(patientId: string) {
	return useQuery(immunizationQueryOptions.overdue(patientId));
}

export function useAllOverdueImmunizations() {
	return useQuery(immunizationQueryOptions.allOverdue());
}

export function useUpcomingImmunizations(patientId: string, daysAhead = 30) {
	return useQuery(immunizationQueryOptions.upcoming(patientId, daysAhead));
}

export function useImmunizationCompliance(patientId: string) {
	return useQuery(immunizationQueryOptions.compliance(patientId));
}

export function useImmunizationCount(filters?: {
	patientId?: string;
	status?: ImmunizationStatus;
}) {
	return useQuery(immunizationQueryOptions.count(filters));
}
