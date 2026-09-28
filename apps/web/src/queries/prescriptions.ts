// packages/tanstack/src/query/hooks/prescription.ts

import type { PrescriptionStatus } from "@smart/db/schema/types";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/utils";

// ------------------------------------------------------------
// Shared types
// ------------------------------------------------------------

// export type PrescriptionStatus =
// 	| "Active"
// 	| "Completed"
// 	| "Discontinued"
// 	| "Cancelled";

export interface PrescriptionListFilters {
	endDate?: Date;
	limit?: number;
	medicationId?: string;
	offset?: number;
	patientId?: string;
	prescriberId?: string;
	startDate?: Date;
	status?: PrescriptionStatus;
}

// ------------------------------------------------------------
// Query option factories
// ------------------------------------------------------------

export const prescriptionQueryOptions = {
	list: (filters?: PrescriptionListFilters) =>
		orpc.prescription.findAll.queryOptions({
			input: filters ?? {},
		}),

	detail: (id: string) =>
		orpc.prescription.getById.queryOptions({
			input: id,
			enabled: Boolean(id),
		}),

	patient: (patientId: string, options?: PrescriptionListFilters) =>
		orpc.prescription.getByPatientId.queryOptions({
			input: { patientId, ...options },
			enabled: Boolean(patientId),
		}),

	active: (patientId: string) =>
		orpc.prescription.getActive.queryOptions({
			input: patientId, // was: input: id
			enabled: Boolean(patientId),
		}),

	stats: () =>
		orpc.prescription.getStats.queryOptions({
			input: undefined,
		}),
};

// ============================================================
// Hooks
// ============================================================

export function usePrescriptions(filters?: PrescriptionListFilters) {
	return useQuery(prescriptionQueryOptions.list(filters));
}

export function usePrescriptionsSuspense(filters?: PrescriptionListFilters) {
	return useSuspenseQuery(prescriptionQueryOptions.list(filters));
}

export function usePrescription(id: string) {
	return useQuery(prescriptionQueryOptions.detail(id));
}

export function usePrescriptionSuspense(id: string) {
	return useSuspenseQuery(prescriptionQueryOptions.detail(id));
}

export function usePrescriptionsForPatient(
	patientId: string,
	options?: PrescriptionListFilters
) {
	return useQuery(prescriptionQueryOptions.patient(patientId, options));
}

export function usePrescriptionsForPatientSuspense(
	patientId: string,
	options?: PrescriptionListFilters
) {
	return useSuspenseQuery(
		prescriptionQueryOptions.patient(patientId, options)
	);
}

export function useActivePrescriptions(patientId: string) {
	return useQuery(prescriptionQueryOptions.active(patientId));
}

export function usePrescriptionStats() {
	return useQuery(prescriptionQueryOptions.stats());
}
