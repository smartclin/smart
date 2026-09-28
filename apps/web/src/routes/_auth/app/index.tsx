import { createFileRoute } from "@tanstack/react-router";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const Route = createFileRoute("/_auth/app/")({
	component: DashboardPage,
});

function DashboardPage() {
	return <DashboardShell />;
}
