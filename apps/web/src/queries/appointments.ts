// packages/tanstack/src/query/hooks/appointment.ts

import type { AppointmentListFilters } from "@smart/api/keys";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/utils";
export const appointmentQueryOptions = {
	list: (filters?: AppointmentListFilters) =>
		orpc.appointment.findAll.queryOptions({ input: filters ?? {} }),

	detail: (id: string) =>
		orpc.appointment.getById.queryOptions({
			input: id, // Pass the string directly
			enabled: Boolean(id),
		}),
	patient: (patientId: string, options?: Record<string, unknown>) =>
		orpc.appointment.findByPatientId.queryOptions({
			input: { patientId, ...options },
			enabled: Boolean(patientId),
		}),

	staff: (staffId: string, options?: Record<string, unknown>) =>
		orpc.appointment.findByStaffId.queryOptions({
			input: { staffId, ...options },
			enabled: Boolean(staffId),
		}),

	date: (date: Date, options?: { limit?: number; offset?: number }) =>
		orpc.appointment.findByDate.queryOptions({
			input: { date, ...options },
		}),

	upcoming: (patientId: string, limit = 10) =>
		orpc.appointment.getUpcoming.queryOptions({
			input: { patientId, limit },
			enabled: Boolean(patientId),
		}),

	stats: () => orpc.appointment.getStats.queryOptions(),
};

// Hooks — public API unchanged
export function useAppointments(filters?: AppointmentListFilters) {
	return useQuery(appointmentQueryOptions.list(filters));
}

export function useAppointment(id: string) {
	return useQuery(appointmentQueryOptions.detail(id));
}

export function usePatientAppointments(
	patientId: string,
	options?: Record<string, unknown>
) {
	return useQuery(appointmentQueryOptions.patient(patientId, options));
}

export function useStaffAppointments(
	staffId: string,
	options?: Record<string, unknown>
) {
	return useQuery(appointmentQueryOptions.staff(staffId, options));
}

export function useAppointmentStats() {
	return useQuery(appointmentQueryOptions.stats());
}

export function useUpcomingAppointments(patientId: string, limit = 10) {
	return useQuery(appointmentQueryOptions.upcoming(patientId, limit));
}

// Bonus: infinite hook that oRPC gives you for free
export function useInfiniteAppointments(pageSize = 20) {
	return useInfiniteQuery(
		orpc.appointment.findAll.infiniteOptions({
			input: (offset: number | undefined) => ({
				limit: pageSize,
				offset: offset ?? 0,
			}),
			initialPageParam: 0,
			getNextPageParam: (last) => (last.total ? last.total : undefined),
		})
	);
}
