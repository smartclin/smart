// src/hooks/use-mutations.ts
//
// oRPC-native mutation hooks.
//
// The old `useServerMutation` wrapper (with its `{ data }` envelope and
// `ServerFnInput<TFn>` gymnastics) is gone. oRPC's `mutationOptions()`
// already gives us:
//   - End-to-end type inference from the router (input + output + errors)
//   - Partial-match invalidation via `orpc.<ns>.key()`
//   - The same serializer/SSR pipeline as queries
//
// `useMutationWithToasts` is generic over the four TanStack Query mutation
// type parameters (TData, TError, TVariables, TContext). This is what makes
// it accept `orpc.auth.login.mutationOptions()`,
// `orpc.patient.create.mutationOptions()`, etc. without falling back to
// `any` or a single concrete type.

import {
	type MutationOptions,
	type UseMutationResult,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc/utils";
import { useOptimisticMutation } from "./use-optimistic-mutation";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Extract a user-facing message from an oRPC error.
 *
 * `isDefinedError` narrows to the procedure's declared error union — but
 * only when the error type parameter is known. At runtime, oRPC errors are
 * plain objects with `code` and `message`. We read them structurally.
 */
// Define the shape of your custom error if you haven't already
type CustomErrorShape = {
	message?: string;
	code?: string;
};

// 1. Properly type the guard using the "is" keyword
function isDefinedError(error: unknown): error is CustomErrorShape {
	return (
		typeof error === "object" &&
		error !== null &&
		("message" in error || "code" in error)
	);
}

// 2. Your function will now compile cleanly
function messageFromError(error: unknown): string {
	if (isDefinedError(error)) {
		return error.message || String(error.code);
	}
	if (error instanceof Error) return error.message;
	return "Something went wrong.";
}

// ---------------------------------------------------------------------------
// Generic wrapper
// ---------------------------------------------------------------------------

/**
 * The wrapper every mutation hook in this file is built on.
 *
 * We accept the full `MutationOptions` object (rather than a single concrete
 * `ReturnType<typeof ...>`) and parameterize over TData/TError/TVariables/
 * TContext. This is what lets the same wrapper serve every procedure.
 *
 * We deliberately do NOT use `NoInfer` on `mutationOptions` — the inference
 * must flow *from* the caller's `mutationOptions` argument *into* the
 * wrapper's generics, otherwise the parameters collapse to `never`.
 */
function useMutationWithToasts<
	TData,
	TError,
	TVariables,
	TContext = unknown,
>(opts: {
	/** The `orpc.<ns>.<fn>.mutationOptions()` object. */
	mutationOptions: MutationOptions<TData, TError, TVariables, TContext>;
	/** Toast on success. */
	successMessage: string;
	/** Keys to invalidate on success. */
	invalidateKeys: ReadonlyArray<readonly unknown[]>;
	/** Optional extra `onSuccess` — runs after invalidation + toast. */
	onSuccess?: (
		data: TData,
		vars: TVariables,
		ctx: TContext | undefined
	) => void;
	/** Optional extra `onError` — runs after the error toast. */
	onError?: (
		error: TError,
		vars: TVariables,
		ctx: TContext | undefined
	) => void;
}): UseMutationResult<TData, TError, TVariables, TContext> {
	const queryClient = useQueryClient();

	return useMutation<TData, TError, TVariables, TContext>({
		...opts.mutationOptions,
		onSuccess: (data, vars, ctx) => {
			for (const key of opts.invalidateKeys) {
				void queryClient.invalidateQueries({ queryKey: key });
			}
			toast.success(opts.successMessage);
			opts.onSuccess?.(data, vars, ctx);
		},
		onError: (error, vars, ctx) => {
			toast.error(messageFromError(error));
			opts.onError?.(error, vars, ctx);
		},
	});
}

// ===========================================================================
// Auth mutations
// ===========================================================================

export function useLogin() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.login.mutationOptions(),
		successMessage: "Signed in.",
		invalidateKeys: [orpc.auth.key()],
	});
}

export function useRegister() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.register.mutationOptions(),
		successMessage: "Account created.",
		invalidateKeys: [orpc.auth.key(), orpc.staff.key()],
	});
}

export function useLogout() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.logout.mutationOptions(),
		successMessage: "Signed out.",
		invalidateKeys: [orpc.auth.key()],
	});
}

export function useUpdateUser() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.updateUser.mutationOptions(),
		successMessage: "Profile updated.",
		invalidateKeys: [orpc.auth.key(), orpc.staff.key()],
	});
}

export function useUpdateUserRole() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.updateUserRole.mutationOptions(),
		successMessage: "User role updated.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

export function useSuspendUser() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.suspendUser.mutationOptions(),
		successMessage: "User suspended.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

export function useActivateUser() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.activateUser.mutationOptions(),
		successMessage: "User activated.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

export function useDeleteUser() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.deleteUser.mutationOptions(),
		successMessage: "User deleted.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

export function useResetPassword() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.resetPassword.mutationOptions(),
		successMessage: "If an account exists, a reset link was sent.",
		invalidateKeys: [],
	});
}

export function useConfirmResetPassword() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.confirmResetPassword.mutationOptions(),
		successMessage: "Password reset.",
		invalidateKeys: [orpc.auth.key()],
	});
}

export function useVerifyEmail() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.verifyEmail.mutationOptions(),
		successMessage: "Email verified.",
		invalidateKeys: [orpc.auth.key()],
	});
}

export function useChangePassword() {
	return useMutationWithToasts({
		mutationOptions: orpc.auth.changePassword.mutationOptions(),
		successMessage: "Password changed.",
		invalidateKeys: [orpc.auth.key()],
	});
}

// ===========================================================================
// Patient mutations
// ===========================================================================

export function useCreatePatient() {
	return useMutationWithToasts({
		mutationOptions: orpc.patient.create.mutationOptions(),
		successMessage: "Patient created.",
		invalidateKeys: [orpc.patient.key(), orpc.dashboard.key()],
	});
}

export function useUpdatePatient() {
	return useMutationWithToasts({
		mutationOptions: orpc.patient.update.mutationOptions(),
		successMessage: "Patient updated.",
		invalidateKeys: [orpc.patient.key()],
	});
}

export function useDeletePatient() {
	return useMutationWithToasts({
		mutationOptions: orpc.patient.delete.mutationOptions(),
		successMessage: "Patient deleted.",
		invalidateKeys: [orpc.patient.key(), orpc.dashboard.key()],
	});
}

export function useMergePatients() {
	return useMutationWithToasts({
		mutationOptions: orpc.patient.merge.mutationOptions(),
		successMessage: "Patients merged.",
		invalidateKeys: [orpc.patient.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Appointment mutations
// ===========================================================================

export function useCreateAppointment() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.create.mutationOptions(),
		successMessage: "Appointment created.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

export function useCreateAppointmentsBatch() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.createBatch.mutationOptions(),
		successMessage: "Appointments created.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

export function useUpdateAppointment() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.update.mutationOptions(),
		successMessage: "Appointment updated.",
		invalidateKeys: [orpc.appointment.key()],
	});
}

export function useCheckInAppointment() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.checkIn.mutationOptions(),
		successMessage: "Patient checked in.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

export function useStartAppointment() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.start.mutationOptions(),
		successMessage: "Appointment started.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

export function useCompleteAppointment() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.complete.mutationOptions(),
		successMessage: "Appointment completed.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

export function useCancelAppointment() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.cancel.mutationOptions(),
		successMessage: "Appointment cancelled.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

export function useMarkAppointmentNoShow() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.markNoShow.mutationOptions(),
		successMessage: "Appointment marked no-show.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

export function useDeleteAppointment() {
	return useMutationWithToasts({
		mutationOptions: orpc.appointment.delete.mutationOptions(),
		successMessage: "Appointment deleted.",
		invalidateKeys: [orpc.appointment.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Encounter mutations
// ===========================================================================

export function useCreateEncounter() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.create.mutationOptions(),
		successMessage: "Encounter created.",
		invalidateKeys: [
			orpc.encounter.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useCreateEncountersBatch() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.createBatch.mutationOptions(),
		successMessage: "Encounters created.",
		invalidateKeys: [
			orpc.encounter.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useUpdateEncounter() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.update.mutationOptions(),
		successMessage: "Encounter updated.",
		invalidateKeys: [orpc.encounter.key(), orpc.patient.key()],
	});
}

export function useAddEncounterVitals() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.addVitals.mutationOptions(),
		successMessage: "Vitals recorded.",
		invalidateKeys: [
			orpc.encounter.key(),
			orpc.vitals.key(),
			orpc.patient.key(),
		],
	});
}

export function useAddEncounterDiagnosis() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.addDiagnosis.mutationOptions(),
		successMessage: "Diagnosis added.",
		invalidateKeys: [orpc.encounter.key()],
	});
}

export function useAddEncounterTreatmentPlan() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.addTreatmentPlan.mutationOptions(),
		successMessage: "Treatment plan added.",
		invalidateKeys: [orpc.encounter.key()],
	});
}

export function useSignEncounter() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.sign.mutationOptions(),
		successMessage: "Encounter signed.",
		invalidateKeys: [orpc.encounter.key(), orpc.patient.key()],
	});
}

export function useDeleteEncounter() {
	return useMutationWithToasts({
		mutationOptions: orpc.encounter.delete.mutationOptions(),
		successMessage: "Encounter deleted.",
		invalidateKeys: [orpc.encounter.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Immunization mutations
// ===========================================================================

export function useCreateImmunization() {
	return useMutationWithToasts({
		mutationOptions: orpc.immunization.create.mutationOptions(),
		successMessage: "Immunization created.",
		invalidateKeys: [
			orpc.immunization.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useCreateImmunizationsBatch() {
	return useMutationWithToasts({
		mutationOptions: orpc.immunization.createBatch.mutationOptions(),
		successMessage: "Immunizations created.",
		invalidateKeys: [
			orpc.immunization.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useUpdateImmunization() {
	return useMutationWithToasts({
		mutationOptions: orpc.immunization.update.mutationOptions(),
		successMessage: "Immunization updated.",
		invalidateKeys: [orpc.immunization.key(), orpc.patient.key()],
	});
}

export function useAdministerImmunization() {
	return useMutationWithToasts({
		mutationOptions: orpc.immunization.administer.mutationOptions(),
		successMessage: "Immunization administered.",
		invalidateKeys: [
			orpc.immunization.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useDeferImmunization() {
	return useMutationWithToasts({
		mutationOptions: orpc.immunization.defer.mutationOptions(),
		successMessage: "Immunization deferred.",
		invalidateKeys: [orpc.immunization.key(), orpc.patient.key()],
	});
}

export function useRefuseImmunization() {
	return useMutationWithToasts({
		mutationOptions: orpc.immunization.refuse.mutationOptions(),
		successMessage: "Immunization refused.",
		invalidateKeys: [orpc.immunization.key(), orpc.patient.key()],
	});
}

export function useRecordAdverseReaction() {
	return useMutationWithToasts({
		mutationOptions:
			orpc.immunization.recordAdverseReaction.mutationOptions(),
		successMessage: "Adverse reaction recorded.",
		invalidateKeys: [orpc.immunization.key(), orpc.patient.key()],
	});
}

export function useDeleteImmunization() {
	return useMutationWithToasts({
		mutationOptions: orpc.immunization.delete.mutationOptions(),
		successMessage: "Immunization deleted.",
		invalidateKeys: [orpc.immunization.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Lab mutations
// ===========================================================================

export function useCreateLabOrder() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.create.mutationOptions(),
		successMessage: "Lab order created.",
		invalidateKeys: [
			orpc.lab.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useCreateLabOrdersBatch() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.createBatch.mutationOptions(),
		successMessage: "Lab orders created.",
		invalidateKeys: [
			orpc.lab.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useUpdateLabOrder() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.update.mutationOptions(),
		successMessage: "Lab order updated.",
		invalidateKeys: [orpc.lab.key(), orpc.patient.key()],
	});
}

export function useUpdateLabOrderStatus() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.updateStatus.mutationOptions(),
		successMessage: "Lab order status updated.",
		invalidateKeys: [
			orpc.lab.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useAddLabResults() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.addResults.mutationOptions(),
		successMessage: "Lab results added.",
		invalidateKeys: [
			orpc.lab.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useSubmitLabResults() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.submitResults.mutationOptions(),
		successMessage: "Lab results submitted.",
		invalidateKeys: [
			orpc.lab.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useCollectLabSample() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.collectSample.mutationOptions(),
		successMessage: "Sample collected.",
		invalidateKeys: [
			orpc.lab.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useCancelLabOrder() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.cancel.mutationOptions(),
		successMessage: "Lab order cancelled.",
		invalidateKeys: [
			orpc.lab.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useDeleteLabOrder() {
	return useMutationWithToasts({
		mutationOptions: orpc.lab.delete.mutationOptions(),
		successMessage: "Lab order deleted.",
		invalidateKeys: [orpc.lab.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Prescription mutations
// ===========================================================================

export function useCreatePrescription() {
	return useMutationWithToasts({
		mutationOptions: orpc.prescription.create.mutationOptions(),
		successMessage: "Prescription created.",
		invalidateKeys: [
			orpc.prescription.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useCreatePrescriptionsBatch() {
	return useMutationWithToasts({
		mutationOptions: orpc.prescription.createBatch.mutationOptions(),
		successMessage: "Prescriptions created.",
		invalidateKeys: [
			orpc.prescription.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useUpdatePrescription() {
	return useMutationWithToasts({
		mutationOptions: orpc.prescription.update.mutationOptions(),
		successMessage: "Prescription updated.",
		invalidateKeys: [orpc.prescription.key(), orpc.patient.key()],
	});
}

export function useRefillPrescription() {
	return useMutationWithToasts({
		mutationOptions: orpc.prescription.renew.mutationOptions(),
		successMessage: "Prescription refilled.",
		invalidateKeys: [
			orpc.prescription.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useDiscontinuePrescription() {
	return useMutationWithToasts({
		mutationOptions: orpc.prescription.discontinue.mutationOptions(),
		successMessage: "Prescription discontinued.",
		invalidateKeys: [
			orpc.prescription.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useDeletePrescription() {
	return useMutationWithToasts({
		mutationOptions: orpc.prescription.delete.mutationOptions(),
		successMessage: "Prescription deleted.",
		invalidateKeys: [orpc.prescription.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Growth mutations
// ===========================================================================

export function useCreateGrowthMeasurement() {
	return useMutationWithToasts({
		mutationOptions: orpc.growth.create.mutationOptions(),
		successMessage: "Growth measurement recorded.",
		invalidateKeys: [
			orpc.growth.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useCreateGrowthMeasurementsBatch() {
	return useMutationWithToasts({
		mutationOptions: orpc.growth.createBatch.mutationOptions(),
		successMessage: "Growth measurements recorded.",
		invalidateKeys: [
			orpc.growth.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useUpdateGrowthMeasurement() {
	return useMutationWithToasts({
		mutationOptions: orpc.growth.update.mutationOptions(),
		successMessage: "Growth measurement updated.",
		invalidateKeys: [orpc.growth.key(), orpc.patient.key()],
	});
}

export function useDeleteGrowthMeasurement() {
	return useMutationWithToasts({
		mutationOptions: orpc.growth.delete.mutationOptions(),
		successMessage: "Growth measurement deleted.",
		invalidateKeys: [orpc.growth.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Staff mutations
// ===========================================================================

export function useCreateStaff() {
	return useMutationWithToasts({
		mutationOptions: orpc.staff.create.mutationOptions(),
		successMessage: "Staff member created.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

export function useCreateStaffBatch() {
	return useMutationWithToasts({
		mutationOptions: orpc.staff.createBatch.mutationOptions(),
		successMessage: "Staff members created.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

export function useUpdateStaff() {
	return useMutationWithToasts({
		mutationOptions: orpc.staff.update.mutationOptions(),
		successMessage: "Staff member updated.",
		invalidateKeys: [orpc.staff.key()],
	});
}

export function useToggleStaffActive() {
	return useMutationWithToasts({
		mutationOptions: orpc.staff.toggleActive.mutationOptions(),
		successMessage: "Staff status toggled.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

export function useDeleteStaff() {
	return useMutationWithToasts({
		mutationOptions: orpc.staff.delete.mutationOptions(),
		successMessage: "Staff member deleted.",
		invalidateKeys: [orpc.staff.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Vitals mutations
// ===========================================================================

export function useCreateVitals() {
	return useMutationWithToasts({
		mutationOptions: orpc.vitals.create.mutationOptions(),
		successMessage: "Vitals recorded.",
		invalidateKeys: [
			orpc.vitals.key(),
			orpc.patient.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useDeleteVitals() {
	return useMutationWithToasts({
		mutationOptions: orpc.vitals.delete.mutationOptions(),
		successMessage: "Vitals deleted.",
		invalidateKeys: [orpc.vitals.key(), orpc.dashboard.key()],
	});
}

// ===========================================================================
// Template mutations
// ===========================================================================

export function useCreateTemplate() {
	return useMutationWithToasts({
		mutationOptions: orpc.templates.create.mutationOptions(),
		successMessage: "Template created successfully.",
		invalidateKeys: [orpc.templates.key()],
	});
}

export function useUpdateTemplate() {
	return useMutationWithToasts({
		mutationOptions: orpc.templates.update.mutationOptions(),
		successMessage: "Template updated successfully.",
		invalidateKeys: [orpc.templates.key()],
	});
}

export function useDeleteTemplate() {
	return useMutationWithToasts({
		mutationOptions: orpc.templates.delete.mutationOptions(),
		successMessage: "Template deleted successfully.",
		invalidateKeys: [orpc.templates.key()],
	});
}

// ===========================================================================
// Optimistic mutations
//
// `useOptimisticMutation` is a *client-side* helper: it doesn't wrap
// `mutationOptions()`. We pass the oRPC client's `.call()` method directly,
// and we let TypeScript infer TVariables from the procedure's input schema.
// ===========================================================================

export function useUpdateAppointmentStatus() {
	type Vars = { id: string; status: string };

	return useOptimisticMutation<unknown, Vars>({
		mutationFn: (vars) => orpc.appointment.updateStatus.call(vars as never),
		queryKey: (vars) =>
			orpc.appointment.getById.queryKey({ input: vars.id }),
		optimisticUpdate: (previous, vars) => {
			if (!previous || typeof previous !== "object") return previous;
			return {
				...(previous as object),
				status: vars.status,
			} as typeof previous;
		},
		invalidateKeys: (detailKey) => [
			detailKey,
			orpc.appointment.key(),
			orpc.dashboard.key(),
		],
	});
}

export function useUpdateVitals() {
	type Vars = { id?: string } & Record<string, unknown>;

	return useOptimisticMutation<unknown, Vars>({
		mutationFn: (vars) => orpc.vitals.update.call(vars as never),
		queryKey: (vars) =>
			orpc.vitals.getById.queryKey({ input: vars.id ?? "" }),
		optimisticUpdate: (previous, vars) => {
			if (!previous || typeof previous !== "object") return previous;
			return { ...(previous as object), ...vars } as typeof previous;
		},
		invalidateKeys: (detailKey) => [detailKey, orpc.vitals.key()],
	});
}

export function useUpdatePrescriptionStatus() {
	type Vars = { id: string; status: string };

	return useOptimisticMutation<unknown, Vars>({
		mutationFn: (vars) =>
			orpc.prescription.updateStatus.call(vars as never),
		queryKey: (vars) =>
			orpc.prescription.getById.queryKey({ input: vars.id }),
		optimisticUpdate: (previous, vars) => {
			if (!previous || typeof previous !== "object") return previous;
			return {
				...(previous as object),
				status: vars.status,
			} as typeof previous;
		},
		invalidateKeys: (detailKey) => [
			detailKey,
			orpc.prescription.key(),
			orpc.dashboard.key(),
		],
	});
}
