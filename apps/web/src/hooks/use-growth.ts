// src/hooks/use-growth.ts

import type { MetricType } from "@smart/db/schema/index";
import type { AgeGroup, PercentileBand } from "@smart/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/utils";
import type { GrowthSearchParams } from "./query-keys";
import {
	growthChartDataQueryOptions,
	growthMeasurementByIdQueryOptions,
	growthMeasurementsByPatientQueryOptions,
	growthPercentilesQueryOptions,
	growthStatsQueryOptions,
	latestGrowthMeasurementQueryOptions,
	whoAgeRangeQueryOptions,
	whoGrowthDataQueryOptions,
	whoLmsParametersQueryOptions,
	whoPercentileCurveQueryOptions,
} from "./query-options";

export function useGrowthMeasurementById(id: string) {
	return useQuery(growthMeasurementByIdQueryOptions(id));
}

export function useGrowthMeasurementsByPatient(
	patientId: string,
	params: Omit<GrowthSearchParams, "patientId"> = {}
) {
	return useQuery(growthMeasurementsByPatientQueryOptions(patientId, params));
}

export function useLatestGrowthMeasurement(patientId: string) {
	return useQuery(latestGrowthMeasurementQueryOptions(patientId));
}

export function useGrowthChartData(
	patientId: string,
	metric: MetricType = "weight"
) {
	return useQuery(growthChartDataQueryOptions(patientId, metric));
}

export function useGrowthStats(patientId: string) {
	return useQuery(growthStatsQueryOptions(patientId));
}

export function useGrowthPercentiles(patientId: string) {
	return useQuery(growthPercentilesQueryOptions(patientId));
}

export function useWhoGrowthData(
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi"
) {
	return useQuery(whoGrowthDataQueryOptions(gender, metricType));
}

export function useWhoPercentileCurve(
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi",
	ageMonths: number[]
) {
	return useQuery(
		whoPercentileCurveQueryOptions(gender, metricType, ageMonths)
	);
}

export function useWhoLmsParameters(
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi",
	ageMonths: number
) {
	return useQuery(
		whoLmsParametersQueryOptions(gender, metricType, ageMonths)
	);
}

export function useWhoAgeRange(
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi"
) {
	return useQuery(whoAgeRangeQueryOptions(gender, metricType));
}

// ─────────────────────────────────────────────────────────────────────────────
// List — the ONLY hook in this file that takes an object of options
// ─────────────────────────────────────────────────────────────────────────────
//
// This one is fine: it takes all inputs and calls `useQuery` once,
// unconditionally. No early return, no union prop, no mode switch.

// export interface GrowthMeasurementListOptions {
// 	ageGroup?: AgeGroup;
// 	limit?: number;
// 	offset?: number;
// 	orderBy?: "ageMonths";
// 	orderDirection?: "asc" | "desc";
// 	patientId?: string;
// 	percentileBand?: PercentileBand;
// 	query?: string;
// }// src/hooks/use-growth.ts

export interface GrowthMeasurementListOptions {
	ageGroup?: AgeGroup;
	limit?: number;
	offset?: number;
	orderBy?: "ageMonths" | "recordedAt";
	orderDirection?: "asc" | "desc";
	patientId?: string;
	percentileBand?: PercentileBand;
	query?: string;
}

export function useGrowthMeasurementList({
	patientId,
	limit = 20,
	offset = 0,
	orderBy = "ageMonths",
	orderDirection = "desc",
	query,
	ageGroup,
	percentileBand,
}: GrowthMeasurementListOptions = {}) {
	// Without a patientId, there's nothing to fetch — skip the query.
	// (If you want a global list, the endpoint must be `orpc.growth.findAll`.)
	return useQuery({
		...orpc.growth.getByPatientId.queryOptions({
			input: {
				patientId: patientId ?? "",
				limit,
				offset,
				orderBy,
				orderDirection,
				query,
				ageGroup,
				percentileBand,
			},
			enabled: Boolean(patientId),
		}),
		placeholderData: keepPreviousData,
	});
}
