// src/hooks/use-analytics.ts

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/utils";

// ─── Query options ──────────────────────────────────────────────────────────

export type ClinicInsightsParams = {
	from?: string;
	to?: string;
	clinicId?: string;
	weeks?: number;
};

export const clinicInsightsQueryOptions = (params: ClinicInsightsParams = {}) =>
	orpc.analytics.insights.queryOptions({ input: params });

export const clinicOverviewQueryOptions = (params: ClinicInsightsParams = {}) =>
	orpc.analytics.overview.queryOptions({ input: params });

export const appointmentsAnalyticsQueryOptions = (
	params: ClinicInsightsParams = {}
) => orpc.analytics.appointments.queryOptions({ input: params });

export const demographicsAnalyticsQueryOptions = (
	params: { clinicId?: string } = {}
) => orpc.analytics.demographics.queryOptions({ input: params });

export const encountersAnalyticsQueryOptions = (
	params: ClinicInsightsParams = {}
) => orpc.analytics.encounters.queryOptions({ input: params });

export const immunizationsAnalyticsQueryOptions = (
	params: ClinicInsightsParams = {}
) => orpc.analytics.immunizations.queryOptions({ input: params });

export const revenueAnalyticsQueryOptions = (
	params: ClinicInsightsParams = {}
) => orpc.analytics.revenue.queryOptions({ input: params });

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useClinicInsights(params: ClinicInsightsParams = {}) {
	return useQuery(clinicInsightsQueryOptions(params));
}

export function useClinicOverview(params: ClinicInsightsParams = {}) {
	return useQuery(clinicOverviewQueryOptions(params));
}

export function useAppointmentsAnalytics(params: ClinicInsightsParams = {}) {
	return useQuery(appointmentsAnalyticsQueryOptions(params));
}

export function useDemographicsAnalytics(params: { clinicId?: string } = {}) {
	return useQuery(demographicsAnalyticsQueryOptions(params));
}

export function useEncountersAnalytics(params: ClinicInsightsParams = {}) {
	return useQuery(encountersAnalyticsQueryOptions(params));
}

export function useImmunizationsAnalytics(params: ClinicInsightsParams = {}) {
	return useQuery(immunizationsAnalyticsQueryOptions(params));
}

export function useRevenueAnalytics(params: ClinicInsightsParams = {}) {
	return useQuery(revenueAnalyticsQueryOptions(params));
}
