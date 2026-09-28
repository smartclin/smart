export type AgeGroup =
	| "Newborn"
	| "Infant"
	| "Toddler"
	| "Preschool"
	| "School-Age"
	| "Adolescent";

/**
 * Age ranges are half-open: `[min, max)` in months.
 * WHO uses 0–60 months for the "under-5" charts; older charts go to 228.
 */
export const AGE_GROUP_RANGES = {
	Newborn: [0, 1],
	Infant: [1, 12],
	Toddler: [12, 36],
	Preschool: [36, 72],
	"School-Age": [72, 144],
	Adolescent: [144, 240],
} as const satisfies Record<AgeGroup, readonly [number, number]>;

export type PercentileBand =
	| "severeLow"
	| "low"
	| "normal"
	| "high"
	| "severeHigh";

/**
 * WHO percentile bands for flagging clinical outliers. These match the
 * WHO/CDC convention: 3rd/15th/85th/97th are the practical cut-points.
 */
export function classifyPercentile(percentile: number): PercentileBand {
	if (percentile < 3) return "severeLow";
	if (percentile < 15) return "low";
	if (percentile <= 85) return "normal";
	if (percentile <= 97) return "high";
	return "severeHigh";
}

/** "5m", "18m", "2y 3m", "5y" */
export function formatAge(months: number): string {
	if (!Number.isFinite(months) || months < 0) return "—";
	if (months < 1) return "0m";

	const wholeMonths = Math.floor(months);

	if (wholeMonths < 24) return `${wholeMonths}m`;

	const years = Math.floor(wholeMonths / 12);
	const remainder = wholeMonths % 12;
	return remainder === 0 ? `${years}y` : `${years}y ${remainder}m`;
}

/** "3rd", "15th", "50th", "97th", "99th" — ordinal suffix without locale surprises. */
export function formatPercentileOrdinal(percentile: number): string {
	const rounded = Math.round(percentile);
	const mod10 = rounded % 10;
	const mod100 = rounded % 100;

	if (mod10 === 1 && mod100 !== 11) return `${rounded}st`;
	if (mod10 === 2 && mod100 !== 12) return `${rounded}nd`;
	if (mod10 === 3 && mod100 !== 13) return `${rounded}rd`;
	return `${rounded}th`;
}
export interface PercentileBandConfig {
	className: string;
	/** Half-open range `[min, max)` unless `upperInclusive` is true. */
	range: readonly [number, number];
	/** When true, the upper bound is inclusive: `[min, max]`. */
	upperInclusive?: boolean;
	variant: "default" | "secondary" | "destructive" | "outline";
}

export const PERCENTILE_BAND_RANGES: Record<
	PercentileBand,
	PercentileBandConfig
> = {
	severeLow: {
		range: [0, 3],
		className: "bg-red-100 text-red-800",
		variant: "destructive",
	},
	low: {
		range: [3, 15],
		className: "bg-amber-100 text-amber-800",
		variant: "secondary",
	},
	normal: {
		range: [15, 85],
		className: "bg-green-100 text-green-800",
		variant: "default",
	},
	high: {
		range: [85, 97],
		className: "bg-amber-100 text-amber-800",
		variant: "secondary",
	},
	severeHigh: {
		range: [97, 100],
		className: "bg-red-100 text-red-800",
		variant: "destructive",
		upperInclusive: true, // ← [97, 100], not [97, 100)
	},
};
