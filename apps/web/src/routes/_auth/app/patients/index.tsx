import { createFileRoute } from "@tanstack/react-router";
import { PatientsTable } from "@/components/table/modules/PatientsTable";
import { immunizationQueryOptions } from "@/queries/immunizations";
import { patientQueryOptions } from "@/queries/patients";

export const Route = createFileRoute("/_auth/app/patients/")({
	beforeLoad: ({ context }) => {
		const { queryClient } = context;

		void queryClient.query(
			patientQueryOptions.list({ limit: 100, activeStatus: "Active" })
		);
		void queryClient.query(immunizationQueryOptions.allOverdue());
	},
	component: PatientsPage,
});

function PatientsPage() {
	return <PatientsTable />;
}
