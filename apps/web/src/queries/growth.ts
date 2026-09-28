// packages/tanstack/src/query/hooks/growth.ts

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";

// ------------------------------------------------------------
// Shared types — mirror the server's actual enum values.
// ------------------------------------------------------------

/**
 * Metric names accepted by every growth procedure.
 *
 * NOTE: the server uses `"head_circumference"`, not `"head"`.
 * The shorthand I previously invented caused a type error — gone.
 */
export type GrowthMetric = "weight" | "height" | "head_circumference" | "bmi";

export type Gender = "male" | "female";

/** WHO reference data is static — cache it aggressively. */
const WHO_STALE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

// ------------------------------------------------------------
// Query option factories
// ------------------------------------------------------------

export const growthQueryOptions = {
	// `getChartData` takes an object: { patientId, metric? }
	chart: (patientId: string, metric: GrowthMetric = "weight") =>
		orpc.growth.getChartData.queryOptions({
			input: { patientId, metric },
			enabled: Boolean(patientId),
		}),

	// `getLatest`, `getStats`, `getPercentiles` take a bare string.
	latest: (patientId: string) =>
		orpc.growth.getLatest.queryOptions({
			input: patientId,
			enabled: Boolean(patientId),
		}),

	stats: (patientId: string) =>
		orpc.growth.getStats.queryOptions({
			input: patientId,
			enabled: Boolean(patientId),
		}),

	percentiles: (patientId: string) =>
		orpc.growth.getPercentiles.queryOptions({
			input: patientId,
			enabled: Boolean(patientId),
		}),

	// ---- WHO reference data (static) ----
	whoCurve: (gender: Gender, metricType: GrowthMetric, ageMonths: number[]) =>
		orpc.growth.getWHOPercentileCurve.queryOptions({
			input: { gender, metricType, ageMonths },
			staleTime: WHO_STALE_TIME,
		}),

	whoData: (gender: Gender, metricType: GrowthMetric) =>
		orpc.growth.getWHOData.queryOptions({
			input: { gender, metricType },
			staleTime: WHO_STALE_TIME,
		}),

	whoAgeRange: (gender: Gender, metricType: GrowthMetric) =>
		orpc.growth.getWHOAgeRange.queryOptions({
			input: { gender, metricType },
			staleTime: WHO_STALE_TIME,
		}),
};

// ============================================================
// Hooks
// ============================================================

export function useGrowthChart(
	patientId: string,
	metric: GrowthMetric = "weight"
) {
	return useQuery(growthQueryOptions.chart(patientId, metric));
}

export function useGrowthStats(patientId: string) {
	return useQuery(growthQueryOptions.stats(patientId));
}

export function useGrowthPercentiles(patientId: string) {
	return useQuery(growthQueryOptions.percentiles(patientId));
}

export function useLatestGrowthMeasurement(patientId: string) {
	return useQuery(growthQueryOptions.latest(patientId));
}

export function useLatestGrowthMeasurementSuspense(patientId: string) {
	return useSuspenseQuery(growthQueryOptions.latest(patientId));
}

/** @deprecated use `useLatestGrowthMeasurement` directly */
export function useMeasurementsForPatient(patientId: string) {
	const query = useLatestGrowthMeasurement(patientId);
	return {
		growthData: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}

export function useWhoData(gender: Gender, metricType: GrowthMetric) {
	return useQuery(growthQueryOptions.whoData(gender, metricType));
}

export function useWhoPercentileCurve(
	gender: Gender,
	metricType: GrowthMetric,
	ageMonths: number[]
) {
	return useQuery(growthQueryOptions.whoCurve(gender, metricType, ageMonths));
}

export function useWhoAgeRange(gender: Gender, metricType: GrowthMetric) {
	return useQuery(growthQueryOptions.whoAgeRange(gender, metricType));
}
