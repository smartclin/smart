import { createFileRoute } from "@tanstack/react-router";

import { AppointmentsTable } from "@/components/table/modules/AppointmentsTable";

export const Route = createFileRoute("/_auth/app/appointments/")({
	component: AppointmentsPage,
});

function AppointmentsPage() {
	return <AppointmentsTable />;
}
