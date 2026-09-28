// apps/web/src/components/growth/legend.tsx

import { PATIENT_LINE_COLOR, SD_CURVES } from "./constants";

/**
 * Legend for the growth chart.
 *
 * Renders the seven SD bands plus the patient line. The band swatches use
 * the SD curve stroke color at 20% opacity so the legend and the chart read
 * as the same visual system — this is why the swatch colors are derived from
 * SD_CURVES rather than hardcoded.
 */
export function GrowthChartLegend() {
	return (
		<ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground text-xs">
			{SD_CURVES.map((curve) => (
				<li
					className="flex items-center gap-1.5"
					key={curve.key}
				>
					<span
						aria-hidden="true"
						className="inline-block h-2.5 w-4 rounded-sm"
						style={{
							background: curve.stroke,
							opacity: curve.key === "sd0" ? 1 : 0.55,
						}}
					/>
					<span>{curve.label}</span>
				</li>
			))}
			<li className="flex items-center gap-1.5">
				<span
					aria-hidden="true"
					className="inline-block h-0.5 w-4"
					style={{ background: PATIENT_LINE_COLOR }}
				/>
				<span>Patient</span>
			</li>
		</ul>
	);
}
