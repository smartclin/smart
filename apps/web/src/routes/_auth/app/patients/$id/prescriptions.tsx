import { createFileRoute } from "@tanstack/react-router";
import { PrescriptionTable } from "@/components/table/modules/PrescriptionTable";

export const Route = createFileRoute("/_auth/app/patients/$id/prescriptions")({
	component: PatientPrescriptionsPage,
});

function PatientPrescriptionsPage() {
	return <PrescriptionTable />;
}
