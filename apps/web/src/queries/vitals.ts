// packages/tanstack/src/query/hooks/vital.ts

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";

// ------------------------------------------------------------
// Shared types
// ------------------------------------------------------------

export interface VitalListFilters {
	encounterId?: string;
	endDate?: Date;
	limit?: number;
	offset?: number;
	patientId?: string;
	startDate?: Date;
}

export interface VitalCountFilters {
	endDate?: Date;
	patientId?: string;
	startDate?: Date;
}

// ------------------------------------------------------------
// Query option factories
// ------------------------------------------------------------

export const vitalQueryOptions = {
	list: (filters?: VitalListFilters) =>
		orpc.vitals.findAll.queryOptions({
			input: filters ?? {},
		}),

	detail: (id: string) =>
		orpc.vitals.getById.queryOptions({
			input: id, // Pass string directly
			enabled: Boolean(id),
		}),

	encounter: (encounterId: string) =>
		orpc.vitals.getByEncounterId.queryOptions({
			input: encounterId,
			enabled: Boolean(encounterId),
		}),

	patient: (patientId: string, options?: VitalListFilters) =>
		orpc.vitals.getByPatientId.queryOptions({
			input: { patientId, ...options },
			enabled: Boolean(patientId),
		}),

	latest: (patientId: string) =>
		orpc.vitals.getLatest.queryOptions({
			input: patientId,
			enabled: Boolean(patientId),
		}),

	abnormal: (patientId: string, limit = 20) =>
		orpc.vitals.getAbnormal.queryOptions({
			input: { patientId, limit }, // ← limit is now part of the key
			enabled: Boolean(patientId),
		}),

	dateRange: (
		patientId: string,
		startDate: Date,
		endDate: Date,
		options?: { limit?: number }
	) =>
		orpc.vitals.getByDateRange.queryOptions({
			input: { patientId, startDate, endDate, ...options },
			enabled: Boolean(patientId),
		}),

	count: (filters?: VitalCountFilters) =>
		orpc.vitals.getCount.queryOptions({
			input: filters ?? {},
		}),
};

// ============================================================
// Hooks — list / detail
// ============================================================

export function useVitals(filters?: VitalListFilters) {
	return useQuery(vitalQueryOptions.list(filters));
}

export function useVitalsSuspense(filters?: VitalListFilters) {
	return useSuspenseQuery(vitalQueryOptions.list(filters));
}

export function useVital(id: string) {
	return useQuery(vitalQueryOptions.detail(id));
}

export function useVitalSuspense(id: string) {
	return useSuspenseQuery(vitalQueryOptions.detail(id));
}

// ============================================================
// Hooks — patient-scoped
// ============================================================

export function useVitalsForPatient(
	patientId: string,
	options?: VitalListFilters
) {
	return useQuery(vitalQueryOptions.patient(patientId, options));
}

export function usePatientVitalsSuspense(
	patientId: string,
	options?: VitalListFilters
) {
	return useSuspenseQuery(vitalQueryOptions.patient(patientId, options));
}

export function useLatestVitals(patientId: string) {
	return useQuery(vitalQueryOptions.latest(patientId));
}

export function useLatestVitalsSuspense(patientId: string) {
	return useSuspenseQuery(vitalQueryOptions.latest(patientId));
}

export function useAbnormalVitals(patientId: string, limit = 20) {
	return useQuery(vitalQueryOptions.abnormal(patientId, limit));
}

export function useAbnormalVitalsSuspense(patientId: string, limit = 20) {
	return useSuspenseQuery(vitalQueryOptions.abnormal(patientId, limit));
}

export function useVitalsByDateRange(
	patientId: string,
	startDate: Date,
	endDate: Date,
	options?: { limit?: number }
) {
	return useQuery(
		vitalQueryOptions.dateRange(patientId, startDate, endDate, options)
	);
}

export function useVitalsByDateRangeSuspense(
	patientId: string,
	startDate: Date,
	endDate: Date,
	options?: { limit?: number }
) {
	return useSuspenseQuery(
		vitalQueryOptions.dateRange(patientId, startDate, endDate, options)
	);
}

// ============================================================
// Hooks — encounter-scoped
// ============================================================

export function useVitalsByEncounter(encounterId: string) {
	return useQuery(vitalQueryOptions.encounter(encounterId));
}

export function useVitalsByEncounterSuspense(encounterId: string) {
	return useSuspenseQuery(vitalQueryOptions.encounter(encounterId));
}

// ============================================================
// Hooks — aggregates
// ============================================================

export function useVitalCount(filters?: VitalCountFilters) {
	return useQuery(vitalQueryOptions.count(filters));
}

/**
 * Convenience composition for a patient vitals panel.
 *
 * NOTE: `useVitalDataSuspense` below uses suspense queries for every leg
 * so the boundary actually waits for all four. Prefer that one inside
 * `<Suspense>` boundaries.
 */
export function useVitalData(patientId: string) {
	const latest = useLatestVitals(patientId);
	const vitals = useVitalsForPatient(patientId);
	const count = useVitalCount({ patientId });
	const abnormal = useAbnormalVitals(patientId);

	return {
		latest: latest.data,
		vitals: vitals.data,
		total: vitals.data?.total ?? 0,
		count: count.data,
		abnormal: abnormal.data,
		isLoading:
			latest.isPending ||
			vitals.isPending ||
			count.isPending ||
			abnormal.isPending,
		isError:
			latest.isError ||
			vitals.isError ||
			count.isError ||
			abnormal.isError,
		refetch: async () => {
			await Promise.all([
				latest.refetch(),
				vitals.refetch(),
				count.refetch(),
				abnormal.refetch(),
			]);
		},
	};
}

export function useVitalDataSuspense(patientId: string) {
	const latest = useLatestVitalsSuspense(patientId);
	const vitals = usePatientVitalsSuspense(patientId);
	const abnormal = useAbnormalVitalsSuspense(patientId);
	// Count is small and fast; a suspense variant keeps the composition clean.
	const count = useVitalCountSuspense({ patientId });

	return {
		latest: latest.data,
		vitals: vitals.data,
		total: vitals.data?.total ?? 0,
		count: count.data,
		abnormal: abnormal.data,
	};
}

/**
 * Suspense variant of `useVitalCount` — needed for `useVitalDataSuspense`.
 */
export function useVitalCountSuspense(filters?: VitalCountFilters) {
	return useSuspenseQuery(vitalQueryOptions.count(filters));
}
