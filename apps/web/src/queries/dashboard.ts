import { useSuspenseQuery } from "@tanstack/react-query";
import { appointmentQueryOptions } from "./appointments";
import { encounterQueryOptions } from "./encounters";
import { patientQueryOptions } from "./patients";

export async function useDashSuspense() {
	const [_patientsResult, _appointmentsResult, _recentEncountersResult] =
		await Promise.all([
			useSuspenseQuery(
				patientQueryOptions.list({
					// Reduced from 1000 — dashboard only shows recent items
					limit: 25,
					activeStatus: "Active",
				})
			),
			useSuspenseQuery(
				appointmentQueryOptions.list({
					// Reduced from 1000 — only today + upcoming matter here
					limit: 25,
				})
			),
			useSuspenseQuery(encounterQueryOptions.recent(5)),
		]);
}
