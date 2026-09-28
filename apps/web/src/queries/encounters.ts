// packages/tanstack/src/query/hooks/encounter.ts

import type { VisitType } from "@smart/db/zod";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";

export type EncounterStatus = "Draft" | "Completed" | "Signed" | "Amended";

/** Matches the server's `encounter.search` input schema. */
export interface EncounterSearchInput {
	endDate?: Date;
	limit?: number;
	offset?: number;
	patientId?: string;
	providerId?: string;
	query?: string;
	startDate?: Date;
	status: EncounterStatus;
	visitType: VisitType;
}

/** Matches the server's `encounter.findByPatientId` input schema. */
export interface EncounterPatientInput {
	limit?: number;
	offset?: number;
	patientId: string;
	status?: EncounterStatus;
	visitType?: VisitType;
}

export const encounterQueryOptions = {
	search: (input: EncounterSearchInput) =>
		orpc.encounter.search.queryOptions({ input }),

	detail: (id: string) =>
		orpc.encounter.getById.queryOptions({
			input: id, // ← primitive, not { id }
			enabled: Boolean(id),
		}),

	patient: (input: EncounterPatientInput) =>
		orpc.encounter.findByPatientId.queryOptions({
			input,
			enabled: Boolean(input.patientId),
		}),

	recent: (limit = 10) =>
		orpc.encounter.getRecent.queryOptions({
			input: limit, // ← primitive, not { limit }
		}),

	stats: () =>
		orpc.encounter.getStats.queryOptions({
			input: undefined,
		}),
};

// ============================================================
// Hooks
// ============================================================

export function useEncounters(input: EncounterSearchInput) {
	return useQuery(encounterQueryOptions.search(input));
}

export function useEncountersSuspense(input: EncounterSearchInput) {
	return useSuspenseQuery(encounterQueryOptions.search(input));
}

export function useEncounter(id: string) {
	return useQuery(encounterQueryOptions.detail(id));
}

export function useEncounterSuspense(id: string) {
	return useSuspenseQuery(encounterQueryOptions.detail(id));
}

export function useEncountersForPatient(input: EncounterPatientInput) {
	return useQuery(encounterQueryOptions.patient(input));
}

export function useEncountersForPatientSuspense(input: EncounterPatientInput) {
	return useSuspenseQuery(encounterQueryOptions.patient(input));
}

export function useRecentEncounters(limit = 10) {
	return useQuery(encounterQueryOptions.recent(limit));
}

export function useEncounterStats() {
	return useQuery(encounterQueryOptions.stats());
}

/** @deprecated use `useEncounters` directly */
export const useSearchEncounters = useEncounters;
