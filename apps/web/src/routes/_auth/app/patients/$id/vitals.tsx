import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { VitalsList } from "@/components/table/modules/VitalsTable";

export const Route = createFileRoute("/_auth/app/patients/$id/vitals")({
	component: PatientVitalsPage,
});

function PatientVitalsPage() {
	const { id } = Route.useParams();
	const patientId = id as string;
	const navigate = useNavigate();

	const handleAddVitals = useCallback(() => {
		void navigate({
			to: "/app/vitals/new",
			search: { patientId },
		});
	}, [navigate, patientId]);

	return (
		<VitalsList
			onAddVitals={handleAddVitals}
			patientId={patientId}
		/>
	);
}
