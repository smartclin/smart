// apps/web/src/components/growth/utils.ts

/**
 * Color by z-score, matching the SD curve bands.
 *
 * The bands are the standard pediatric convention:
 *   ≤ −3 : severe deficit
 *   ≤ −2 : moderate deficit
 *   ≤ −1 : mild deficit
 *   ≤ +1 : normal range
 *   ≤ +2 : at risk of overweight
 *   ≤ +3 : overweight
 *   >  +3 : obese
 *
 * Colours are literal strings, not Tailwind classes, because they are used
 * inline on SVG marks and on canvas-rendered tooltips where Tailwind can't
 * reach them. They are the SAME palette as SD_CURVES so the chart and the
 * table agree visually.
 */
export function colorForZScore(z: number | null | undefined): string {
	if (z === null || z === undefined) return "#6366f1";
	if (z <= -3) return "#dc2626";
	if (z <= -2) return "#ea580c";
	if (z <= -1) return "#ca8a04";
	if (z <= 1) return "#059669";
	if (z <= 2) return "#ca8a04";
	if (z <= 3) return "#ea580c";
	return "#dc2626";
}

/**
 * Human-readable WHO status label for a z-score.
 *
 * Symmetric for the negative and positive sides so a +4 and a −4 both read
 * as "Severe", and a missing z-score returns the em-dash placeholder used
 * throughout the app.
 */
export function labelForZScore(z: number | null | undefined): string {
	if (z === null || z === undefined) return "—";
	if (z <= -3) return "Severe ↓";
	if (z <= -2) return "Moderate ↓";
	if (z <= -1) return "Mild ↓";
	if (z <= 1) return "Normal";
	if (z <= 2) return "At risk ↑";
	if (z <= 3) return "Overweight";
	return "Obese";
}
