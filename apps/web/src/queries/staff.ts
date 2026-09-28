// packages/tanstack/src/query/hooks/staff.ts

import type { Role } from "@smart/auth/roles";
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";

// ------------------------------------------------------------
// Shared types
// ------------------------------------------------------------

export type StaffRole = Exclude<Role, "patient">;

export interface StaffListFilters {
	isActive?: boolean;
	limit?: number;
	offset?: number;
	orderBy?: "name" | "createdAt";
	orderDirection?: "asc" | "desc";
	role?: StaffRole;
	search?: string;
}

export interface StaffCountFilters {
	isActive?: boolean;
	role?: StaffRole;
}

// ------------------------------------------------------------
// Query option factories
// ------------------------------------------------------------

export const staffQueryOptions = {
	list: (filters?: StaffListFilters) =>
		orpc.staff.findAll.queryOptions({
			input: filters ?? {},
		}),

	// ✅ FIX: getById takes z.string()
	detail: (id: string) =>
		orpc.staff.getById.queryOptions({
			input: id, // was: { id }
			enabled: Boolean(id),
		}),

	// ✅ FIX: getByEmail takes z.string()
	email: (email: string) =>
		orpc.staff.getByEmail.queryOptions({
			input: email, // was: { email }
			enabled: Boolean(email),
		}),

	active: () => orpc.staff.getActive.queryOptions(),

	// ✅ FIX: getByRole takes z.enum(["admin","doctor","patient","staff"])
	byRole: (role: StaffRole) =>
		orpc.staff.getByRole.queryOptions({
			input: role, // was: { role }
		}),

	// ✅ FIX: getWithPatients takes z.string()
	withPatients: (id: string) =>
		orpc.staff.getWithPatients.queryOptions({
			input: id, // was: { id }
			enabled: Boolean(id),
		}),

	// ✅ FIX: getWithEncounters takes z.string()
	withEncounters: (id: string) =>
		orpc.staff.getWithEncounters.queryOptions({
			input: id, // was: { id }
			enabled: Boolean(id),
		}),

	// ✅ FIX: getWithPrescriptions takes z.string()
	withPrescriptions: (id: string) =>
		orpc.staff.getWithPrescriptions.queryOptions({
			input: id, // was: { id }
			enabled: Boolean(id),
		}),

	count: (filters?: StaffCountFilters) =>
		orpc.staff.getCount.queryOptions({
			input: filters ?? {},
		}),

	stats: () => orpc.staff.getStats.queryOptions(),
};

// ... query hooks unchanged ...

// ============================================================
// Hooks — queries
// ============================================================

export function useStaff(filters?: StaffListFilters) {
	return useQuery(staffQueryOptions.list(filters));
}

export function useStaffSuspense(filters?: StaffListFilters) {
	return useSuspenseQuery(staffQueryOptions.list(filters));
}

export function useStaffMember(id: string) {
	return useQuery(staffQueryOptions.detail(id));
}

export function useStaffMemberSuspense(id: string) {
	return useSuspenseQuery(staffQueryOptions.detail(id));
}

export function useStaffByEmail(email: string) {
	return useQuery(staffQueryOptions.email(email));
}

export function useStaffByEmailSuspense(email: string) {
	return useSuspenseQuery(staffQueryOptions.email(email));
}

export function useActiveStaff() {
	return useQuery(staffQueryOptions.active());
}

export function useActiveStaffSuspense() {
	return useSuspenseQuery(staffQueryOptions.active());
}

export function useStaffByRole(role: StaffRole) {
	return useQuery(staffQueryOptions.byRole(role));
}

export function useStaffByRoleSuspense(role: StaffRole) {
	return useSuspenseQuery(staffQueryOptions.byRole(role));
}

export function useStaffWithPatients(id: string) {
	return useQuery(staffQueryOptions.withPatients(id));
}

export function useStaffWithPatientsSuspense(id: string) {
	return useSuspenseQuery(staffQueryOptions.withPatients(id));
}

export function useStaffWithEncounters(id: string) {
	return useQuery(staffQueryOptions.withEncounters(id));
}

export function useStaffWithEncountersSuspense(id: string) {
	return useSuspenseQuery(staffQueryOptions.withEncounters(id));
}

export function useStaffWithPrescriptions(id: string) {
	return useQuery(staffQueryOptions.withPrescriptions(id));
}

export function useStaffWithPrescriptionsSuspense(id: string) {
	return useSuspenseQuery(staffQueryOptions.withPrescriptions(id));
}

export function useStaffCount(filters?: StaffCountFilters) {
	return useQuery(staffQueryOptions.count(filters));
}

export function useStaffStats() {
	return useQuery(staffQueryOptions.stats());
}

// ============================================================
// Mutation hooks
// ============================================================

export function useCreateStaff() {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.staff.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.staff.key() });
			},
		})
	);
}

export function useUpdateStaff() {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.staff.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.staff.key() });
			},
		})
	);
}

export function useDeleteStaff() {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.staff.delete.mutationOptions({
			// ✅ FIX: `variables` is the input — a bare string, not `{ id }`
			onSuccess: (_data, id) => {
				// `id` is now a string directly
				queryClient.removeQueries({
					queryKey: orpc.staff.getById.key({ input: id }),
				});
				queryClient.removeQueries({
					queryKey: orpc.staff.getWithPatients.key({ input: id }),
				});
				queryClient.removeQueries({
					queryKey: orpc.staff.getWithEncounters.key({ input: id }),
				});
				queryClient.removeQueries({
					queryKey: orpc.staff.getWithPrescriptions.key({
						input: id,
					}),
				});
				queryClient.invalidateQueries({ queryKey: orpc.staff.key() });
			},
		})
	);
}

export function useToggleStaffActive() {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.staff.toggleActive.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.staff.key() });
			},
		})
	);
}

export function useBulkCreateStaff() {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.staff.createBatch.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.staff.key() });
			},
		})
	);
}

// ============================================================
// Combined hooks
// ============================================================

/**
 * Aggregate a staff member's profile plus their related entities
 * in a single hook. Each sub-query is independently cached, so
 * components can also fetch them individually.
 */
export function useStaffData(id: string) {
	const staff = useStaffMember(id);
	const withPatients = useStaffWithPatients(id);
	const withEncounters = useStaffWithEncounters(id);
	const withPrescriptions = useStaffWithPrescriptions(id);

	return {
		staff: staff.data,
		patients: withPatients.data,
		encounters: withEncounters.data,
		prescriptions: withPrescriptions.data,
		queries: { staff, withPatients, withEncounters, withPrescriptions },
		isLoading:
			staff.isLoading ||
			withPatients.isLoading ||
			withEncounters.isLoading ||
			withPrescriptions.isLoading,
		isError:
			staff.isError ||
			withPatients.isError ||
			withEncounters.isError ||
			withPrescriptions.isError,
		refetch: () =>
			Promise.all([
				staff.refetch(),
				withPatients.refetch(),
				withEncounters.refetch(),
				withPrescriptions.refetch(),
			]),
	};
}

export function useStaffDataSuspense(id: string) {
	const staff = useStaffMemberSuspense(id);
	const withPatients = useStaffWithPatientsSuspense(id);
	const withEncounters = useStaffWithEncountersSuspense(id);
	const withPrescriptions = useStaffWithPrescriptionsSuspense(id);

	return {
		staff: staff.data,
		patients: withPatients.data,
		encounters: withEncounters.data,
		prescriptions: withPrescriptions.data,
	};
}
