// src/hooks/use-patient-activity.ts
import { useQuery } from "@tanstack/react-query";

import {
	patientActivityTodayQueryOptions,
	todayScheduleQueryOptions,
} from "./query-options";

export function usePatientActivityToday(
	params: { date?: Date; limit?: number; offset?: number } = {}
) {
	return useQuery(patientActivityTodayQueryOptions(params));
}

export function useTodaySchedule(params: { date?: Date; limit?: number } = {}) {
	return useQuery(todayScheduleQueryOptions(params));
}
