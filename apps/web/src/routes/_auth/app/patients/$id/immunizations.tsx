import { createFileRoute } from "@tanstack/react-router";

import { ImmunizationsTable } from "@/components/table/modules/ImmunizationsTable";

export const Route = createFileRoute("/_auth/app/patients/$id/immunizations")({
	component: PatientImmunizationsPage,
});

function PatientImmunizationsPage() {
	const { id } = Route.useParams();
	const patientId = id as string;

	return <ImmunizationsTable patientId={patientId} />;
}
