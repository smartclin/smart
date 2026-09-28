// packages/tanstack/src/query/hooks/lab.ts

import type { LabPriority, LabStatus } from "@smart/db/zod";
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//  prefer importing from the shared schema, not redefining

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";

// ------------------------------------------------------------
// Shared types
// ------------------------------------------------------------

export interface LabListFilters {
	endDate?: Date;
	limit?: number;
	offset?: number;
	patientId?: string;
	priority?: LabPriority; // ← server value: "Routine" | "Stat" | "Urgent"
	query?: string;
	startDate?: Date;
	status?: LabStatus; // ← server value: "Ordered" | "Sample Collected" | ...
}

// ------------------------------------------------------------
// Query option factories
// ------------------------------------------------------------

export const labQueryOptions = {
	list: (filters?: LabListFilters) =>
		orpc.lab.findAll.queryOptions({
			input: filters ?? {},
		}),

	detail: (id: string) =>
		orpc.lab.getById.queryOptions({
			input: id,
			enabled: Boolean(id),
		}),

	patient: (patientId: string, options?: Omit<LabListFilters, "patientId">) =>
		orpc.lab.getByPatientId.queryOptions({
			input: { ...options, patientId },
			enabled: Boolean(patientId),
		}),

	pending: (patientId?: string) =>
		orpc.lab.getPending.queryOptions({
			input: patientId,
			refetchInterval: 30_000,
		}),

	abnormal: (patientId: string) =>
		orpc.lab.getAbnormalResults.queryOptions({
			input: patientId,
			enabled: Boolean(patientId),
		}),

	stats: () => orpc.lab.getStats.queryOptions(),
};

// ============================================================
// Hooks (unchanged)
// ============================================================

export function useLabs(filters?: LabListFilters) {
	return useQuery(labQueryOptions.list(filters));
}

export function useLabsSuspense(filters?: LabListFilters) {
	return useSuspenseQuery(labQueryOptions.list(filters));
}

export function useLab(id: string) {
	return useQuery(labQueryOptions.detail(id));
}

export function useLabSuspense(id: string) {
	return useSuspenseQuery(labQueryOptions.detail(id));
}

export function usePatientLabs(
	patientId: string,
	options?: Omit<LabListFilters, "patientId">
) {
	return useQuery(labQueryOptions.patient(patientId, options));
}

export function usePatientLabsSuspense(
	patientId: string,
	options?: Omit<LabListFilters, "patientId">
) {
	return useSuspenseQuery(labQueryOptions.patient(patientId, options));
}

export function usePendingLabs(patientId?: string) {
	return useQuery(labQueryOptions.pending(patientId));
}

export function useAbnormalLabs(patientId: string) {
	return useQuery(labQueryOptions.abnormal(patientId));
}

export function useLabStats() {
	return useQuery(labQueryOptions.stats());
}
