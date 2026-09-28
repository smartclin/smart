import { createFileRoute } from "@tanstack/react-router";
import { LabsTable } from "@/components/table/modules/LabsTable";

export const Route = createFileRoute("/_auth/app/labs/")({
	component: LabsPage,
});

function LabsPage() {
	return <LabsTable />;
}
