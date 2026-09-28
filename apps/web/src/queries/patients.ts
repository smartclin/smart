// packages/tanstack/src/query/hooks/patient.ts

import type { LabStatus } from "@smart/db/zod";
import { skipToken, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/utils";

// ------------------------------------------------------------
// Shared types
// ------------------------------------------------------------

export type PatientActiveStatus = "Active" | "Inactive" | "Archived";

export type PrescriptionStatus =
	| "Active"
	| "Cancelled"
	| "Completed"
	| "Discontinued";

export interface PatientListFilters {
	activeStatus?: PatientActiveStatus;
	limit?: number;
	offset?: number;
	query?: string;
}

export interface PageFilters {
	limit: number;
	offset: number;
}

// ------------------------------------------------------------
// Query option factories
// ------------------------------------------------------------

export const patientQueryOptions = {
	// ---- Core patient CRUD ----
	list: (filters?: PatientListFilters) =>
		orpc.patient.list.queryOptions({
			input: filters ?? {},
		}),

	search: (query: string, filters: PageFilters) =>
		orpc.patient.search.queryOptions({
			input: { query, ...filters },
		}),

	// getFullData → input: string (probably)
	detail: (id: string) =>
		orpc.patient.getFullData.queryOptions({
			input: id,
			enabled: Boolean(id),
		}),

	count: (filters?: { activeStatus?: PatientActiveStatus }) =>
		orpc.patient.count.queryOptions({
			input: filters ?? {},
		}),

	stats: () => orpc.patient.getStats.queryOptions(),

	// ---- Sub-resources ----
	// getEncounters → input: string (probably; verify — might be { patientId, limit, offset })
	encounters: (
		patientId: string,
		options?: { patientId?: string; limit?: number; offset?: number }
	) =>
		orpc.patient.getEncounters.queryOptions({
			input: { patientId, ...options },
			enabled: Boolean(patientId),
		}),

	// getGrowthData → input: string (probably)
	growth: (id: string) =>
		orpc.patient.getGrowthData.queryOptions({
			input: id,
			enabled: Boolean(id),
		}),

	// getImmunizations → input: string (probably)
	immunizations: (id: string) =>
		orpc.patient.getImmunizations.queryOptions({
			input: id,
			enabled: Boolean(id),
		}),

	// getPrescriptions → input: { patientId, status? } (two args → object)
	prescriptions: (id: string, status?: PrescriptionStatus) =>
		orpc.patient.getPrescriptions.queryOptions({
			input: { patientId: id, status },
			enabled: Boolean(id),
		}),

	// getLabOrders → input: { patientId, status? } (two args → object)
	labOrders: (id: string, status?: LabStatus) =>
		orpc.patient.getLabOrders.queryOptions({
			input: { patientId: id, status },
			enabled: Boolean(id),
		}),

	// getVitals → input: { patientId, limit } (two args → object)
	vitals: (id: string, limit = 10) =>
		orpc.patient.getVitals.queryOptions({
			input: { patientId: id, limit },
			enabled: Boolean(id),
		}),
};

// ============================================================
// Hooks
// ============================================================

export function usePatients(filters?: PatientListFilters) {
	return useQuery(patientQueryOptions.list(filters));
}

export function usePatientsSuspense(filters?: PatientListFilters) {
	return useSuspenseQuery(patientQueryOptions.list(filters));
}

export function usePatient(id: string) {
	return useQuery(patientQueryOptions.detail(id));
}

export function usePatientSuspense(id: string) {
	return useSuspenseQuery(patientQueryOptions.detail(id));
}

/** @deprecated use `usePatient` directly */
export const useFullPatientData = usePatient;

/** @deprecated use `usePatientSuspense` directly */
export const useFullPatientDataSuspense = usePatientSuspense;

export function useSearchPatients(query: string, filters: PageFilters) {
	return useQuery(
		orpc.patient.search.queryOptions({
			input: query.length > 0 ? { query, ...filters } : skipToken,
		})
	);
}

export function usePatientCount(filters?: {
	activeStatus?: PatientActiveStatus;
}) {
	return useQuery(patientQueryOptions.count(filters));
}

// ============================================================
// Sub-resource hooks
// ============================================================

export function usePatientEncounters(id: string) {
	return useQuery(patientQueryOptions.encounters(id));
}

export function usePatientGrowthData(id: string) {
	return useQuery(patientQueryOptions.growth(id));
}

export function usePatientGrowthDataSuspense(id: string) {
	return useSuspenseQuery(patientQueryOptions.growth(id));
}

export function usePatientImmunizations(id: string) {
	return useQuery(patientQueryOptions.immunizations(id));
}

export function usePatientPrescriptions(
	id: string,
	status?: PrescriptionStatus
) {
	return useQuery(patientQueryOptions.prescriptions(id, status));
}

export function usePatientLabOrders(id: string, status?: LabStatus) {
	return useQuery(patientQueryOptions.labOrders(id, status));
}

export function usePatientVitals(id: string, limit = 10) {
	return useQuery(patientQueryOptions.vitals(id, limit));
}
