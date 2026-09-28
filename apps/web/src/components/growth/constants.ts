// apps/web/src/components/growth/constants.ts

import type { GrowthMeasurement, MetricType } from "@smart/db/schema";
import type { ChartPositionScaleOptions } from "@tanstack/charts";
import { scaleLinear, scalePoint } from "d3-scale";

// ─── Metric configuration ──────────────────────────────────────────────────

export type MetricConfig = {
	label: string;
	unit: string;
	valueKey: keyof GrowthMeasurement;
	zKey: keyof GrowthMeasurement;
	pctKey: keyof GrowthMeasurement;
	whoMetric: MetricType;
	yPadding: number;
	/** Decimal places used when rendering the value in the table. */
	precision: 1 | 2;
};

export const METRIC_CONFIG: Record<MetricType, MetricConfig> = {
	weight: {
		label: "Weight-for-Age",
		unit: "kg",
		valueKey: "weightKg",
		zKey: "weightForAgeZScore",
		pctKey: "weightForAgePercentile",
		whoMetric: "weight",
		yPadding: 2,
		precision: 2,
	},
	height: {
		label: "Length/Height-for-Age",
		unit: "cm",
		valueKey: "heightCm",
		zKey: "heightForAgeZScore",
		pctKey: "heightForAgePercentile",
		whoMetric: "height",
		yPadding: 5,
		precision: 1,
	},
	head_circumference: {
		label: "Head Circumference-for-Age",
		unit: "cm",
		valueKey: "headCircumferenceCm",
		zKey: "headCircumferenceZScore",
		pctKey: "headCircumferencePercentile",
		whoMetric: "head_circumference",
		yPadding: 2,
		precision: 1,
	},
	bmi: {
		label: "BMI-for-Age",
		unit: "kg/m²",
		valueKey: "bmi",
		zKey: "bmiForAgeZScore",
		pctKey: "bmiForAgePercentile",
		whoMetric: "bmi",
		yPadding: 3,
		precision: 1,
	},
} as const;

export const METRIC_TABS: ReadonlyArray<{
	value: MetricType;
	label: string;
}> = [
	{ value: "weight", label: "Weight" },
	{ value: "height", label: "Height" },
	{ value: "head_circumference", label: "Head" },
	{ value: "bmi", label: "BMI" },
] as const;

// ─── SD curve definition ───────────────────────────────────────────────────
//
// One SD curve set, used by both the chart marks and the legend. Colors
// follow the pediatric convention: green median, amber ±1–2 SD, red ±3 SD.

export type SdKey =
	| "sd3neg"
	| "sd2neg"
	| "sd1neg"
	| "sd0"
	| "sd1"
	| "sd2"
	| "sd3";

export type SdCurve = {
	key: SdKey;
	label: string;
	stroke: string;
	dash: string;
	width: number;
};

export const SD_CURVES: readonly SdCurve[] = [
	{
		key: "sd3neg",
		label: "−3 SD",
		stroke: "#ef4444",
		dash: "4 3",
		width: 1.2,
	},
	{
		key: "sd2neg",
		label: "−2 SD",
		stroke: "#f97316",
		dash: "6 3",
		width: 1.5,
	},
	{ key: "sd1neg", label: "−1 SD", stroke: "#ca8a04", dash: "3 2", width: 1 },
	{ key: "sd0", label: "Median", stroke: "#059669", dash: "", width: 2.5 },
	{ key: "sd1", label: "+1 SD", stroke: "#ca8a04", dash: "3 2", width: 1 },
	{ key: "sd2", label: "+2 SD", stroke: "#f97316", dash: "6 3", width: 1.5 },
	{ key: "sd3", label: "+3 SD", stroke: "#ef4444", dash: "4 3", width: 1.2 },
] as const;

export const PATIENT_LINE_COLOR = "#e11d48";

// ─── Chart layout ──────────────────────────────────────────────────────────

export const CHART_PAD = { top: 24, right: 56, bottom: 40, left: 48 };
export const DEFAULT_CHART_WIDTH = 720;
export const DEFAULT_CHART_HEIGHT = 380;

// ─── Scale + theme config (module-level for stable identity) ───────────────

export const X_SCALE: ChartPositionScaleOptions = {
	scale: scalePoint,
	axis: { line: false, ticks: { size: 0, padding: 10 } },
};

export const Y_SCALE: ChartPositionScaleOptions = {
	scale: scaleLinear,
	grid: true,
	axis: { line: false, ticks: false, tickLabels: false },
};

export const CHART_THEME = {
	foreground: "var(--muted-foreground)",
	grid: "var(--border)",
	background: "transparent",
} as const;

// ─── Staleness ─────────────────────────────────────────────────────────────
// WHO reference data is static; 24h is effectively "forever" for a session.

export const WHO_REFERENCE_STALE_TIME_MS = 24 * 60 * 60 * 1000;
