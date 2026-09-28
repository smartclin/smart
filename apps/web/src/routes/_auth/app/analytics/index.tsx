import { createFileRoute } from "@tanstack/react-router";

import ClinicAnalytics from "@/components/analytics/ClinicAnalytics";

export const Route = createFileRoute("/_auth/app/analytics/")({
	component: AnalyticsPage,
});

function AnalyticsPage() {
	return <ClinicAnalytics />;
}
