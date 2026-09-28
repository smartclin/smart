// src/routes/_auth/app/patients/$patientId/growth/history.tsx

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { GrowthHistoryTable } from "@/components/growth/growth-history-table";
import { orpc } from "@/lib/orpc/utils";
import { usePatient } from "@/queries/patients";

export const Route = createFileRoute("/_auth/app/patients/$id/growth/history")({
	component: PatientGrowthHistoryPage,
});

function PatientGrowthHistoryPage() {
	const { id: patientId } = Route.useParams();

	const { data: patient } = usePatient(patientId);

	const { isLoading } = useQuery(
		orpc.growth.getByPatientId.queryOptions({
			input: { patientId, limit: 100 },
			enabled: Boolean(patientId),
		})
	);

	if (isLoading) {
		return <GrowthHistorySkeleton />;
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="font-bold text-2xl">
					Growth History: {patient?.firstName} {patient?.lastName}
				</h1>
				<p className="text-muted-foreground text-sm">
					Every recorded measurement, newest first.
				</p>
			</div>

			<GrowthHistoryTable
				compact
				patientId={patientId}
			/>
		</div>
	);
}
function GrowthHistorySkeleton() {
	return (
		<div className="flex h-48 items-center justify-center">
			<div className="text-center">
				<div className="mx-auto h-8 w-8 animate-spin rounded-full border-teal-600 border-b-2" />
				<p className="mt-3 text-slate-500 text-sm">
					Loading growth history...
				</p>
			</div>
		</div>
	);
}
