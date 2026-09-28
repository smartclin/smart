// src/hooks/use-dashboard.ts

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import {
	dashboardAlertsQueryOptions,
	dashboardQueryOptions,
	dashboardRecentActivityQueryOptions,
	dashboardStatsLiteQueryOptions,
	dashboardStatsQueryOptions,
	dashboardTodayScheduleQueryOptions,
} from "./query-options.ts";

export function useDashboardStats(cacheBust = false) {
	return useQuery(dashboardStatsQueryOptions(cacheBust));
}

export function useDashboardStatsLite() {
	return useQuery(dashboardStatsLiteQueryOptions());
}

export function useDashboardTodaySchedule(params: {
	date?: Date;
	includeCompleted?: boolean;
	limit?: number;
}) {
	return useQuery(dashboardTodayScheduleQueryOptions(params));
}

export function useDashboardRecentActivity(params: {
	limit?: number;
	offset?: number;
}) {
	return useQuery(dashboardRecentActivityQueryOptions(params));
}

export function useDashboardAlerts(params: {
	limit?: number;
	severity?: "info" | "warning" | "critical";
	includeResolved?: boolean;
}) {
	return useQuery(dashboardAlertsQueryOptions(params));
}

export function useDashboard(params: {
	date?: Date;
	includeAlerts?: boolean;
	includeActivity?: boolean;
	includeSchedule?: boolean;
}) {
	return useQuery(dashboardQueryOptions(params));
}

export function useDashboardSuspense(params: {
	date?: Date;
	includeAlerts?: boolean;
	includeActivity?: boolean;
	includeSchedule?: boolean;
}) {
	return useSuspenseQuery(dashboardQueryOptions(params));
}
