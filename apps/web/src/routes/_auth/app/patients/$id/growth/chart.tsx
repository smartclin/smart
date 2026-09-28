// src/routes/app/patients/$patientId/growth/chart.tsx

import type { MetricType } from "@smart/db/schema";
import { Tabs, TabsList, TabsTrigger } from "@smart/ui/components/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GrowthChart, METRIC_TABS } from "@/components/growth";
import { GrowthPageSkeleton } from "@/components/skeletons";
import { useGrowthMeasurementsByPatient } from "@/hooks/use-growth";
import { usePatientById } from "@/hooks/use-patients";

export const Route = createFileRoute("/_auth/app/patients/$id/growth/chart")({
	component: PatientGrowthChartPage,
});

function PatientGrowthChartPage() {
	const { id: patientId } = Route.useParams();
	const [selectedMetric, setSelectedMetric] = useState<MetricType>("weight");

	const { data: patient, isLoading: patientLoading } =
		usePatientById(patientId);
	const { data: measurementsResult, isLoading: measurementsLoading } =
		useGrowthMeasurementsByPatient(patientId);

	const measurements = measurementsResult?.data ?? [];

	if (patientLoading || measurementsLoading) return <GrowthPageSkeleton />;
	if (!patient) return <p>Patient not found.</p>;

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
			{/* … header … */}

			{/* Metric selector — this is what was missing before */}
			<Tabs
				onValueChange={(v) => setSelectedMetric(v as MetricType)}
				value={selectedMetric}
			>
				<TabsList>
					{METRIC_TABS.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<GrowthChart
				gender={patient.gender}
				height={500}
				measurements={measurements}
				metric={selectedMetric}
			/>
		</div>
	);
}
