// src/components/growth/growth-chart-with-tabs.tsx

import type { Gender, GrowthMeasurement, MetricType } from "@smart/db/schema";
import { Tabs, TabsList, TabsTrigger } from "@smart/ui/components/tabs";
import { cn } from "@smart/ui/lib/utils";
import { useState } from "react";

import { useGrowthMeasurementsByPatient } from "@/hooks/use-growth";
import { usePatient } from "@/queries/patients";
import { METRIC_TABS } from "./constants";
import { GrowthChart } from "./growth-chart";

// ─────────────────────────────────────────────────────────────────────────────
// Public API — two components, no unions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch mode. Given a `patientId`, loads the patient's gender and all
 * measurements, then renders the chart. Use this on a patient's growth
 * page.
 */
export function GrowthChartWithTabs({
	patientId,
	defaultMetric,
	className,
	gender,
}: {
	patientId: string;
	defaultMetric?: MetricType;
	gender?: Gender;
	className?: string;
}) {
	const {
		data: patient,
		isLoading: patientLoading,
		isError: patientError,
	} = usePatient(patientId);

	const {
		data: growthResult,
		isLoading: growthLoading,
		isError: growthError,
	} = useGrowthMeasurementsByPatient(patientId, { limit: 200 });

	if (patientLoading || growthLoading) {
		return <ChartSkeleton className={className} />;
	}

	const hasValidGender = gender === "male" || gender === "female";

	if (patientError || growthError || !patient || !hasValidGender) {
		return (
			<ChartError
				className={className}
				message={
					patient && !hasValidGender
						? "Patient gender is missing — cannot render growth chart."
						: undefined
				}
			/>
		);
	}

	return (
		<GrowthChartBody
			className={className}
			defaultMetric={defaultMetric}
			gender={gender}
			measurements={growthResult?.data ?? []}
		/>
	);
}

/**
 * Presentational mode. Use when you already have the data (tests, stories,
 * embedded charts inside a larger computed view).
 */
export function GrowthChartBody({
	measurements,
	gender,
	defaultMetric = "weight",
	className,
}: {
	measurements: GrowthMeasurement[];
	gender: "male" | "female";
	defaultMetric?: MetricType;
	className?: string;
}) {
	const [metric, setMetric] = useState<MetricType>(defaultMetric);

	return (
		<div className={cn("space-y-4", className)}>
			<Tabs
				onValueChange={(v) => setMetric(v as MetricType)}
				value={metric}
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
				gender={gender}
				measurements={measurements}
				metric={metric}
			/>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// States
// ─────────────────────────────────────────────────────────────────────────────

function ChartSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("space-y-4", className)}>
			<div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
			<div className="h-80 w-full animate-pulse rounded-2xl bg-muted" />
		</div>
	);
}

function ChartError({
	message,
	className,
}: {
	message?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-dashed p-8 text-center",
				className
			)}
		>
			<p className="font-medium text-destructive">
				Could not load growth data
			</p>
			<p className="mt-1 text-muted-foreground text-sm">
				{message ?? "Try refreshing the page."}
			</p>
		</div>
	);
}
