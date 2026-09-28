import { createFileRoute } from "@tanstack/react-router";
import { LabsTable } from "@/components/table/modules/LabsTable";

export const Route = createFileRoute("/_auth/app/patients/$id/labs")({
	component: PatientLabsPage,
});

function PatientLabsPage() {
	const { id } = Route.useParams();
	const patientId = id as string;
	return <LabsTable patientId={patientId} />;
}
