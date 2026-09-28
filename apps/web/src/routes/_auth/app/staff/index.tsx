import { createFileRoute } from "@tanstack/react-router";

import { StaffTable } from "@/components/table/modules/StaffTable";

export const Route = createFileRoute("/_auth/app/staff/")({
	component: StaffPage,
});

function StaffPage() {
	return <StaffTable />;
}
