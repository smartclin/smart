import { Skeleton } from "@smart/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { GrowthChartWithTabs } from "@/components/growth";
import { useGrowthMeasurementsByPatient } from "@/hooks/use-growth";

export const Route = createFileRoute("/_auth/app/patients/$id/growth/")({
	component: PatientGrowthDashboard,
});

function PatientGrowthDashboard() {
	const { id: patientId } = Route.useParams();
	const { data: measurementsResult, isLoading } =
		useGrowthMeasurementsByPatient(patientId);

	const measurementCount = measurementsResult?.data?.length ?? 0;

	if (isLoading) return <Skeleton className="h-[500px] w-full rounded-2xl" />;

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-sm">
				{measurementCount} measurement
				{measurementCount === 1 ? "" : "s"}
			</p>
			<GrowthChartWithTabs patientId={patientId} />
		</div>
	);
}
