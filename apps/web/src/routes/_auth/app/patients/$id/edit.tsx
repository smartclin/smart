import { createFileRoute, redirect } from "@tanstack/react-router";
import { EditPatientForm } from "@/components/patient/edit-form";
import { EditPatientSkeleton } from "@/components/skeletons/edit-skeletons";
import { requireRole } from "@/functions/get-user";
import { useUpdatePatient } from "@/hooks/use-mutations";
import { usePatientById } from "@/hooks/use-patients";

// ─── Route ─────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_auth/app/patients/$id/edit")({
	component: EditPatientPage,
	pendingComponent: EditPatientSkeleton,
	beforeLoad: async () => {
		const user = await requireRole({ data: ["admin", "doctor"] });
		if (!user) {
			throw redirect({ to: "/login" });
		}
		return { role: user.role };
	},
});

// ─── Page ──────────────────────────────────────────────────────────────────

function EditPatientPage() {
	const { id: patientId } = Route.useParams();
	const { data: patient, isLoading } = usePatientById(patientId);
	const updatePatient = useUpdatePatient();

	// Wait for data before rendering the form. The skeleton stays mounted
	// the whole time `patient` is undefined, so `useAppForm` below always
	// receives real defaults — this is the fix for the "empty edit form" bug.
	if (isLoading || !patient) {
		return <EditPatientSkeleton />;
	}

	return (
		<EditPatientForm
			onSave={async (value) => {
				await updatePatient.mutateAsync(value);
			}}
			patient={patient}
			patientId={patientId}
		/>
	);
}
