// packages/api/src/routers/analytics.ts

import { ORPCError } from "@orpc/server";
import { and, count, eq, gte, lt } from "@smart/db";
import {
	dashboardRepository,
	type Scope,
	type SeriesRange,
} from "@smart/db/repositories/dashboard.repo";
import {
	appointments,
	encounters,
	immunizations,
	patients,
	payments,
} from "@smart/db/schema";
import { db } from "@smart/db/server";
import { z } from "zod/v4";
import { publicProcedure } from "../index";
import { logger } from "../logger/server";

// ============================================================================
// Types
// ============================================================================

export type TrendDirection = "up" | "down" | "flat";

export type InsightSeriesPoint = {
	label: string;
	value: number;
	/** Bucket start time (epoch ms); lets clients use a continuous time x-axis. */
	ts?: number;
};

export type ClinicInsight = {
	id: string;
	label: string;
	value: number;
	unit?: string;
	color?: string;
	series: readonly InsightSeriesPoint[];
	trend?: {
		direction: TrendDirection;
		value: number;
	};
};

export type ClinicInsightsPayload = {
	insights: readonly ClinicInsight[];
	generatedAt: string;
	totals: {
		patients: number;
		encounters: number;
		appointments: number;
		revenue?: number;
		immunizations?: number;
	};
};

// ============================================================================
// Input Schemas
// ============================================================================

const insightsInputSchema = z.object({
	from: z.string().optional(),
	to: z.string().optional(),
	clinicId: z.string().optional(),
	weeks: z.number().int().min(1).max(52).optional(),
});

const dateRangeFilterSchema = z.object({
	from: z.string().optional(),
	to: z.string().optional(),
	clinicId: z.string().optional(),
	weeks: z.number().int().min(1).max(52).optional(),
});

const clinicOnlySchema = z.object({
	clinicId: z.string().optional(),
});

// ============================================================================
// Helpers
// ============================================================================

function resolveAnalyticsScope(
	context: {
		user?: { id: string; role: string } | null;
		clinicId?: string;
	},
	inputClinicId?: string
): Scope {
	const clinicId = inputClinicId ?? context.clinicId;
	return {
		clinicId,
		providerId:
			context.user?.role === "doctor" ? context.user.id : undefined,
	};
}

function parseDateRange(
	from?: string,
	to?: string,
	defaultWeeks = 12
): { start: Date; end: Date } {
	const end = to ? new Date(to) : new Date();
	const start = from
		? new Date(from)
		: (() => {
				const d = new Date(end);
				d.setUTCDate(d.getUTCDate() - defaultWeeks * 7);
				return d;
			})();
	return { start, end };
}

function computeTrend(series: readonly InsightSeriesPoint[]): {
	direction: TrendDirection;
	value: number;
} {
	if (series.length < 2) {
		return { direction: "flat", value: 0 };
	}
	const mid = Math.floor(series.length / 2);
	const prevHalf = series.slice(0, mid);
	const currHalf = series.slice(mid);

	const prevSum = prevHalf.reduce((acc, p) => acc + p.value, 0);
	const currSum = currHalf.reduce((acc, p) => acc + p.value, 0);

	if (prevSum === 0) {
		if (currSum === 0) return { direction: "flat", value: 0 };
		return { direction: "up", value: 100 };
	}

	const percentChange = ((currSum - prevSum) / prevSum) * 100;
	const rounded = Math.round(Math.abs(percentChange) * 10) / 10;

	if (percentChange > 0.5) {
		return { direction: "up", value: rounded };
	}
	if (percentChange < -0.5) {
		return { direction: "down", value: rounded };
	}
	return { direction: "flat", value: 0 };
}

function calculateAge(dobString: string | null | undefined): number | null {
	if (!dobString) return null;
	const birth = new Date(dobString);
	if (Number.isNaN(birth.getTime())) return null;
	const today = new Date();
	let age = today.getUTCFullYear() - birth.getUTCFullYear();
	const m = today.getUTCMonth() - birth.getUTCMonth();
	if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) {
		age--;
	}
	return age >= 0 ? age : null;
}

const DAYS_OF_WEEK = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
] as const;

// ============================================================================
// Router Implementation
// ============================================================================

export const analyticsRouter = {
	/**
	 * Clinic Insights: Primary endpoint for the analytics dashboard cards & charts.
	 * Returns 4 time-series metrics (visits, newPatients, immunizations, revenue)
	 * with trends and totals, fulfilling ClinicInsightsPayload.
	 */
	insights: publicProcedure
		.input(insightsInputSchema)
		.handler(async ({ input, context }) => {
			const scope = resolveAnalyticsScope(context, input.clinicId);
			const database = context.db ?? db;
			const { start, end } = parseDateRange(
				input.from,
				input.to,
				input.weeks ?? 12
			);
			const range: SeriesRange = {
				from: start,
				to: end,
				weeks: input.weeks ?? 12,
			};

			try {
				const [
					visitsSeries,
					newPatientsSeries,
					immunizationsSeries,
					revenueSeries,
				] = await Promise.all([
					dashboardRepository.getVisitsSeries(scope, range),
					dashboardRepository.getNewPatientsSeries(scope, range),
					dashboardRepository.getImmunizationsSeries(scope, range),
					dashboardRepository.getRevenueSeries(scope, range),
				]);

				const totalVisits = visitsSeries.reduce(
					(acc, p) => acc + p.value,
					0
				);
				const totalNewPatients = newPatientsSeries.reduce(
					(acc, p) => acc + p.value,
					0
				);
				const totalImmunizations = immunizationsSeries.reduce(
					(acc, p) => acc + p.value,
					0
				);
				const totalRevenue = revenueSeries.reduce(
					(acc, p) => acc + p.value,
					0
				);

				const patientFilter = scope.clinicId
					? eq(patients.clinicId, scope.clinicId)
					: undefined;

				const [
					patientCountRes,
					encounterCountRes,
					appointmentCountRes,
				] = await Promise.all([
					database
						.select({ value: count() })
						.from(patients)
						.where(patientFilter),
					database
						.select({ value: count() })
						.from(encounters)
						.innerJoin(
							patients,
							eq(encounters.patientId, patients.id)
						)
						.where(
							and(
								patientFilter,
								scope.providerId
									? eq(
											encounters.providerId,
											scope.providerId
										)
									: undefined
							)
						),
					database
						.select({ value: count() })
						.from(appointments)
						.innerJoin(
							patients,
							eq(appointments.patientId, patients.id)
						)
						.where(
							and(
								patientFilter,
								scope.providerId
									? eq(appointments.staffId, scope.providerId)
									: undefined
							)
						),
				]);

				const totals = {
					patients: Number(patientCountRes[0]?.value ?? 0),
					encounters: Number(encounterCountRes[0]?.value ?? 0),
					appointments: Number(appointmentCountRes[0]?.value ?? 0),
					revenue: totalRevenue,
					immunizations: totalImmunizations,
				};

				const insights: ClinicInsight[] = [
					{
						id: "visits",
						label: "Patient Visits",
						value: totalVisits,
						unit: "visits",
						color: "#0d9488",
						series: visitsSeries,
						trend: computeTrend(visitsSeries),
					},
					{
						id: "newPatients",
						label: "New Patients",
						value: totalNewPatients,
						unit: "patients",
						color: "#6366f1",
						series: newPatientsSeries,
						trend: computeTrend(newPatientsSeries),
					},
					{
						id: "immunizations",
						label: "Immunizations Administered",
						value: totalImmunizations,
						unit: "doses",
						color: "#0ea5e9",
						series: immunizationsSeries,
						trend: computeTrend(immunizationsSeries),
					},
					{
						id: "revenue",
						label: "Clinic Revenue",
						value: totalRevenue,
						unit: "USD",
						color: "#059669",
						series: revenueSeries,
						trend: computeTrend(revenueSeries),
					},
				];

				return {
					insights,
					generatedAt: new Date().toISOString(),
					totals,
				} satisfies ClinicInsightsPayload;
			} catch (error) {
				logger.error({
					msg: "Analytics.insights query failed",
					clinicId: scope.clinicId,
					error:
						error instanceof Error ? error.message : String(error),
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate clinic insights",
					cause: error,
				});
			}
		}),

	/**
	 * Overview: High-level KPI summary across patient, appointment, encounter,
	 * immunization, and revenue counts for the selected period.
	 */
	overview: publicProcedure
		.input(dateRangeFilterSchema.optional().default({}))
		.handler(async ({ input, context }) => {
			const scope = resolveAnalyticsScope(context, input.clinicId);
			const database = context.db ?? db;
			const { start, end } = parseDateRange(
				input.from,
				input.to,
				input.weeks ?? 4
			);

			const patientFilter = scope.clinicId
				? eq(patients.clinicId, scope.clinicId)
				: undefined;

			try {
				const [
					totalPatientsRes,
					activePatientsRes,
					newPatientsRes,
					encountersList,
					appointmentsList,
					immunizationsList,
					paymentsList,
				] = await Promise.all([
					database
						.select({ value: count() })
						.from(patients)
						.where(patientFilter),
					database
						.select({ value: count() })
						.from(patients)
						.where(
							and(
								patientFilter,
								eq(patients.activeStatus, "Active")
							)
						),
					database
						.select({ value: count() })
						.from(patients)
						.where(
							and(
								patientFilter,
								gte(patients.createdAt, start),
								lt(patients.createdAt, end)
							)
						),
					database
						.select({
							id: encounters.id,
							status: encounters.status,
							durationMinutes: encounters.durationMinutes,
						})
						.from(encounters)
						.innerJoin(
							patients,
							eq(encounters.patientId, patients.id)
						)
						.where(
							and(
								patientFilter,
								scope.providerId
									? eq(
											encounters.providerId,
											scope.providerId
										)
									: undefined,
								gte(encounters.encounterDate, start),
								lt(encounters.encounterDate, end)
							)
						),
					database
						.select({
							id: appointments.id,
							status: appointments.status,
						})
						.from(appointments)
						.innerJoin(
							patients,
							eq(appointments.patientId, patients.id)
						)
						.where(
							and(
								patientFilter,
								scope.providerId
									? eq(appointments.staffId, scope.providerId)
									: undefined,
								gte(appointments.startTime, start),
								lt(appointments.startTime, end)
							)
						),
					database
						.select({
							id: immunizations.id,
							status: immunizations.status,
							dueDate: immunizations.dueDate,
						})
						.from(immunizations)
						.innerJoin(
							patients,
							eq(immunizations.patientId, patients.id)
						)
						.where(patientFilter),
					database
						.select({
							amountCents: payments.amountCents,
							status: payments.status,
						})
						.from(payments)
						.innerJoin(
							patients,
							eq(payments.patientId, patients.id)
						)
						.where(
							and(
								patientFilter,
								gte(payments.createdAt, start),
								lt(payments.createdAt, end)
							)
						),
				]);

				const totalAppointments = appointmentsList.length;
				const completedAppointments = appointmentsList.filter(
					(a) => a.status?.toLowerCase() === "completed"
				).length;
				const cancelledAppointments = appointmentsList.filter(
					(a) => a.status?.toLowerCase() === "cancelled"
				).length;
				const noShowAppointments = appointmentsList.filter(
					(a) =>
						a.status?.toLowerCase() === "no-show" ||
						a.status?.toLowerCase() === "no_show"
				).length;

				const totalEncounters = encountersList.length;
				const validDurations = encountersList
					.map((e) => e.durationMinutes)
					.filter((d): d is number => typeof d === "number" && d > 0);
				const avgDuration =
					validDurations.length > 0
						? Math.round(
								validDurations.reduce((sum, d) => sum + d, 0) /
									validDurations.length
							)
						: 0;

				const todayIso = new Date().toISOString().slice(0, 10);
				const administeredImmunizations = immunizationsList.filter(
					(i) => i.status === "Administered"
				).length;
				const overdueImmunizations = immunizationsList.filter(
					(i) =>
						i.status === "Overdue" ||
						(i.status === "Due" &&
							i.dueDate &&
							i.dueDate < todayIso)
				).length;
				const upcomingImmunizations = immunizationsList.filter(
					(i) =>
						i.status === "Due" &&
						(!i.dueDate || i.dueDate >= todayIso)
				).length;

				const completedPayments = paymentsList.filter(
					(p) => p.status === "Completed"
				);
				const totalRevenueCents = completedPayments.reduce(
					(acc, p) => acc + (p.amountCents || 0),
					0
				);

				return {
					range: {
						start: start.toISOString(),
						end: end.toISOString(),
					},
					patients: {
						total: Number(totalPatientsRes[0]?.value ?? 0),
						active: Number(activePatientsRes[0]?.value ?? 0),
						newInPeriod: Number(newPatientsRes[0]?.value ?? 0),
					},
					appointments: {
						total: totalAppointments,
						completed: completedAppointments,
						cancelled: cancelledAppointments,
						noShow: noShowAppointments,
						completionRate:
							totalAppointments > 0
								? Math.round(
										(completedAppointments /
											totalAppointments) *
											1000
									) / 10
								: 0,
						cancellationRate:
							totalAppointments > 0
								? Math.round(
										(cancelledAppointments /
											totalAppointments) *
											1000
									) / 10
								: 0,
						noShowRate:
							totalAppointments > 0
								? Math.round(
										(noShowAppointments /
											totalAppointments) *
											1000
									) / 10
								: 0,
					},
					encounters: {
						total: totalEncounters,
						averageDurationMinutes: avgDuration,
					},
					immunizations: {
						administered: administeredImmunizations,
						overdue: overdueImmunizations,
						upcoming: upcomingImmunizations,
					},
					revenue: {
						totalDollars: Math.round(totalRevenueCents / 100),
						totalCents: totalRevenueCents,
						paymentCount: completedPayments.length,
					},
				};
			} catch (error) {
				logger.error({
					msg: "Analytics.overview query failed",
					clinicId: scope.clinicId,
					error:
						error instanceof Error ? error.message : String(error),
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate clinic overview",
					cause: error,
				});
			}
		}),

	/**
	 * Appointments: Detailed status, type, day-of-week, and hour distribution.
	 */
	appointments: publicProcedure
		.input(dateRangeFilterSchema.optional().default({}))
		.handler(async ({ input, context }) => {
			const scope = resolveAnalyticsScope(context, input.clinicId);
			const database = context.db ?? db;
			const { start, end } = parseDateRange(
				input.from,
				input.to,
				input.weeks ?? 12
			);

			const patientFilter = scope.clinicId
				? eq(patients.clinicId, scope.clinicId)
				: undefined;

			try {
				const rows = await database
					.select({
						id: appointments.id,
						status: appointments.status,
						type: appointments.type,
						startTime: appointments.startTime,
					})
					.from(appointments)
					.innerJoin(
						patients,
						eq(appointments.patientId, patients.id)
					)
					.where(
						and(
							patientFilter,
							scope.providerId
								? eq(appointments.staffId, scope.providerId)
								: undefined,
							gte(appointments.startTime, start),
							lt(appointments.startTime, end)
						)
					);

				const byStatusMap = new Map<string, number>();
				const byTypeMap = new Map<string, number>();
				const byDayCounts = new Array<number>(7).fill(0);
				const byHourMap = new Map<number, number>();

				for (const row of rows) {
					const s = row.status ?? "unknown";
					byStatusMap.set(s, (byStatusMap.get(s) ?? 0) + 1);

					const t = row.type ?? "General";
					byTypeMap.set(t, (byTypeMap.get(t) ?? 0) + 1);

					const apptDate = new Date(row.startTime);
					const day = apptDate.getUTCDay();
					byDayCounts[day] = (byDayCounts[day] ?? 0) + 1;

					const hour = apptDate.getUTCHours();
					byHourMap.set(hour, (byHourMap.get(hour) ?? 0) + 1);
				}

				const total = rows.length;
				const completed = byStatusMap.get("Completed") ?? 0;
				const cancelled = byStatusMap.get("Cancelled") ?? 0;
				const noShow =
					(byStatusMap.get("No-Show") ?? 0) +
					(byStatusMap.get("no_show") ?? 0);

				const byStatus = Array.from(byStatusMap.entries()).map(
					([status, count]) => ({
						status,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				const byType = Array.from(byTypeMap.entries()).map(
					([type, count]) => ({
						type,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				const byDayOfWeek = DAYS_OF_WEEK.map((day, idx) => ({
					day,
					count: byDayCounts[idx] ?? 0,
				}));

				const byHourOfDay = Array.from(
					{ length: 12 },
					(_, i) => i + 8
				).map((hour) => ({
					hour,
					label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
					count: byHourMap.get(hour) ?? 0,
				}));

				return {
					total,
					completed,
					cancelled,
					noShow,
					completionRate:
						total > 0
							? Math.round((completed / total) * 1000) / 10
							: 0,
					cancellationRate:
						total > 0
							? Math.round((cancelled / total) * 1000) / 10
							: 0,
					noShowRate:
						total > 0
							? Math.round((noShow / total) * 1000) / 10
							: 0,
					byStatus,
					byType,
					byDayOfWeek,
					byHourOfDay,
				};
			} catch (error) {
				logger.error({
					msg: "Analytics.appointments query failed",
					clinicId: scope.clinicId,
					error:
						error instanceof Error ? error.message : String(error),
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate appointment analytics",
					cause: error,
				});
			}
		}),

	/**
	 * Demographics: Pediatric age-bracket, gender, and status distribution.
	 */
	demographics: publicProcedure
		.input(clinicOnlySchema.optional().default({}))
		.handler(async ({ input, context }) => {
			const scope = resolveAnalyticsScope(context, input.clinicId);
			const database = context.db ?? db;

			const patientFilter = scope.clinicId
				? eq(patients.clinicId, scope.clinicId)
				: undefined;

			try {
				const rows = await database
					.select({
						id: patients.id,
						gender: patients.gender,
						dateOfBirth: patients.dateOfBirth,
						activeStatus: patients.activeStatus,
						bloodGroup: patients.bloodGroup,
					})
					.from(patients)
					.where(patientFilter);

				const total = rows.length;

				const genderMap = new Map<string, number>();
				const statusMap = new Map<string, number>();
				const bloodGroupMap = new Map<string, number>();

				const ageBrackets = {
					infants: 0, // 0-1 year
					toddlers: 0, // 1-3 years
					preschool: 0, // 4-5 years
					schoolAge: 0, // 6-12 years
					adolescents: 0, // 13-18 years
					adults: 0, // 18+ years
					unknown: 0,
				};

				for (const row of rows) {
					const g = row.gender ?? "Unknown";
					genderMap.set(g, (genderMap.get(g) ?? 0) + 1);

					const s = row.activeStatus ?? "Active";
					statusMap.set(s, (statusMap.get(s) ?? 0) + 1);

					const bg = row.bloodGroup ?? "Unknown";
					bloodGroupMap.set(bg, (bloodGroupMap.get(bg) ?? 0) + 1);

					const age = calculateAge(row.dateOfBirth);
					if (age === null) {
						ageBrackets.unknown++;
					} else if (age < 1) {
						ageBrackets.infants++;
					} else if (age <= 3) {
						ageBrackets.toddlers++;
					} else if (age <= 5) {
						ageBrackets.preschool++;
					} else if (age <= 12) {
						ageBrackets.schoolAge++;
					} else if (age <= 18) {
						ageBrackets.adolescents++;
					} else {
						ageBrackets.adults++;
					}
				}

				const byGender = Array.from(genderMap.entries()).map(
					([gender, count]) => ({
						gender,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				const byAgeGroup = [
					{
						bracket: "infants",
						label: "Infants (0-1 yr)",
						count: ageBrackets.infants,
						percentage:
							total > 0
								? Math.round(
										(ageBrackets.infants / total) * 1000
									) / 10
								: 0,
					},
					{
						bracket: "toddlers",
						label: "Toddlers (1-3 yrs)",
						count: ageBrackets.toddlers,
						percentage:
							total > 0
								? Math.round(
										(ageBrackets.toddlers / total) * 1000
									) / 10
								: 0,
					},
					{
						bracket: "preschool",
						label: "Preschool (4-5 yrs)",
						count: ageBrackets.preschool,
						percentage:
							total > 0
								? Math.round(
										(ageBrackets.preschool / total) * 1000
									) / 10
								: 0,
					},
					{
						bracket: "schoolAge",
						label: "School Age (6-12 yrs)",
						count: ageBrackets.schoolAge,
						percentage:
							total > 0
								? Math.round(
										(ageBrackets.schoolAge / total) * 1000
									) / 10
								: 0,
					},
					{
						bracket: "adolescents",
						label: "Adolescents (13-18 yrs)",
						count: ageBrackets.adolescents,
						percentage:
							total > 0
								? Math.round(
										(ageBrackets.adolescents / total) * 1000
									) / 10
								: 0,
					},
					{
						bracket: "adults",
						label: "Adults (18+ yrs)",
						count: ageBrackets.adults,
						percentage:
							total > 0
								? Math.round(
										(ageBrackets.adults / total) * 1000
									) / 10
								: 0,
					},
					...(ageBrackets.unknown > 0
						? [
								{
									bracket: "unknown",
									label: "Unknown DOB",
									count: ageBrackets.unknown,
									percentage:
										total > 0
											? Math.round(
													(ageBrackets.unknown /
														total) *
														1000
												) / 10
											: 0,
								},
							]
						: []),
				];

				const byActiveStatus = Array.from(statusMap.entries()).map(
					([status, count]) => ({
						status,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				const byBloodGroup = Array.from(bloodGroupMap.entries()).map(
					([bloodGroup, count]) => ({
						bloodGroup,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				return {
					totalPatients: total,
					byGender,
					byAgeGroup,
					byActiveStatus,
					byBloodGroup,
				};
			} catch (error) {
				logger.error({
					msg: "Analytics.demographics query failed",
					clinicId: scope.clinicId,
					error:
						error instanceof Error ? error.message : String(error),
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate patient demographics",
					cause: error,
				});
			}
		}),

	/**
	 * Encounters: Clinical encounter breakdown by visit type, duration, and provider.
	 */
	encounters: publicProcedure
		.input(dateRangeFilterSchema.optional().default({}))
		.handler(async ({ input, context }) => {
			const scope = resolveAnalyticsScope(context, input.clinicId);
			const database = context.db ?? db;
			const { start, end } = parseDateRange(
				input.from,
				input.to,
				input.weeks ?? 12
			);

			const patientFilter = scope.clinicId
				? eq(patients.clinicId, scope.clinicId)
				: undefined;

			try {
				const rows = await database
					.select({
						id: encounters.id,
						visitType: encounters.visitType,
						status: encounters.status,
						durationMinutes: encounters.durationMinutes,
						providerId: encounters.providerId,
						providerName: encounters.providerName,
					})
					.from(encounters)
					.innerJoin(patients, eq(encounters.patientId, patients.id))
					.where(
						and(
							patientFilter,
							scope.providerId
								? eq(encounters.providerId, scope.providerId)
								: undefined,
							gte(encounters.encounterDate, start),
							lt(encounters.encounterDate, end)
						)
					);

				const total = rows.length;
				const visitTypeMap = new Map<string, number>();
				const statusMap = new Map<string, number>();
				const providerMap = new Map<
					string,
					{ providerName: string; count: number }
				>();
				const durations: number[] = [];

				for (const row of rows) {
					const vt = row.visitType ?? "General";
					visitTypeMap.set(vt, (visitTypeMap.get(vt) ?? 0) + 1);

					const st = row.status ?? "Completed";
					statusMap.set(st, (statusMap.get(st) ?? 0) + 1);

					if (row.providerId) {
						const prev = providerMap.get(row.providerId);
						providerMap.set(row.providerId, {
							providerName: row.providerName || "Staff Member",
							count: (prev?.count ?? 0) + 1,
						});
					}

					if (
						typeof row.durationMinutes === "number" &&
						row.durationMinutes > 0
					) {
						durations.push(row.durationMinutes);
					}
				}

				const avgDurationMinutes =
					durations.length > 0
						? Math.round(
								durations.reduce((sum, d) => sum + d, 0) /
									durations.length
							)
						: 0;

				const byVisitType = Array.from(visitTypeMap.entries()).map(
					([visitType, count]) => ({
						visitType,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				const byStatus = Array.from(statusMap.entries()).map(
					([status, count]) => ({
						status,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				const byProvider = Array.from(providerMap.entries()).map(
					([providerId, data]) => ({
						providerId,
						providerName: data.providerName,
						count: data.count,
					})
				);

				return {
					totalEncounters: total,
					avgDurationMinutes,
					byVisitType,
					byStatus,
					byProvider,
				};
			} catch (error) {
				logger.error({
					msg: "Analytics.encounters query failed",
					clinicId: scope.clinicId,
					error:
						error instanceof Error ? error.message : String(error),
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate encounter analytics",
					cause: error,
				});
			}
		}),

	/**
	 * Immunizations: Status distribution, top vaccines, and compliance metrics.
	 */
	immunizations: publicProcedure
		.input(dateRangeFilterSchema.optional().default({}))
		.handler(async ({ input, context }) => {
			const scope = resolveAnalyticsScope(context, input.clinicId);
			const database = context.db ?? db;

			const patientFilter = scope.clinicId
				? eq(patients.clinicId, scope.clinicId)
				: undefined;

			try {
				const rows = await database
					.select({
						id: immunizations.id,
						vaccineName: immunizations.vaccineName,
						status: immunizations.status,
						dueDate: immunizations.dueDate,
						administeredDate: immunizations.administeredDate,
					})
					.from(immunizations)
					.innerJoin(
						patients,
						eq(immunizations.patientId, patients.id)
					)
					.where(patientFilter);

				const total = rows.length;
				const todayIso = new Date().toISOString().slice(0, 10);

				const statusMap = new Map<string, number>();
				const vaccineMap = new Map<string, number>();

				let administered = 0;
				let overdue = 0;
				let due = 0;

				for (const row of rows) {
					const s = row.status ?? "Due";
					statusMap.set(s, (statusMap.get(s) ?? 0) + 1);

					if (s === "Administered") {
						administered++;
						const vName = row.vaccineName ?? "Unknown";
						vaccineMap.set(vName, (vaccineMap.get(vName) ?? 0) + 1);
					} else if (
						s === "Overdue" ||
						(s === "Due" && row.dueDate && row.dueDate < todayIso)
					) {
						overdue++;
					} else if (s === "Due") {
						due++;
					}
				}

				const topVaccines = Array.from(vaccineMap.entries())
					.map(([vaccineName, count]) => ({ vaccineName, count }))
					.sort((a, b) => b.count - a.count)
					.slice(0, 10);

				const onTimeRate =
					administered + overdue > 0
						? Math.round(
								(administered / (administered + overdue)) * 1000
							) / 10
						: 100;

				const byStatus = Array.from(statusMap.entries()).map(
					([status, count]) => ({
						status,
						count,
						percentage:
							total > 0
								? Math.round((count / total) * 1000) / 10
								: 0,
					})
				);

				return {
					totalDoses: total,
					administered,
					overdue,
					due,
					onTimeRate,
					topVaccines,
					byStatus,
				};
			} catch (error) {
				logger.error({
					msg: "Analytics.immunizations query failed",
					clinicId: scope.clinicId,
					error:
						error instanceof Error ? error.message : String(error),
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate immunization analytics",
					cause: error,
				});
			}
		}),

	/**
	 * Revenue: Financial breakdown and collections summary.
	 */
	revenue: publicProcedure
		.input(dateRangeFilterSchema.optional().default({}))
		.handler(async ({ input, context }) => {
			const scope = resolveAnalyticsScope(context, input.clinicId);
			const database = context.db ?? db;
			const { start, end } = parseDateRange(
				input.from,
				input.to,
				input.weeks ?? 12
			);
			const range: SeriesRange = {
				from: start,
				to: end,
				weeks: input.weeks ?? 12,
			};

			const patientFilter = scope.clinicId
				? eq(patients.clinicId, scope.clinicId)
				: undefined;

			try {
				const [paymentsList, series] = await Promise.all([
					database
						.select({
							id: payments.id,
							amountCents: payments.amountCents,
							status: payments.status,
							paidAt: payments.paidAt,
						})
						.from(payments)
						.innerJoin(
							patients,
							eq(payments.patientId, patients.id)
						)
						.where(
							and(
								patientFilter,
								gte(payments.createdAt, start),
								lt(payments.createdAt, end)
							)
						),
					dashboardRepository.getRevenueSeries(scope, range),
				]);

				const statusMap = new Map<
					string,
					{ count: number; totalCents: number }
				>();
				let completedCents = 0;
				let completedCount = 0;

				for (const p of paymentsList) {
					const s = p.status ?? "Pending";
					const prev = statusMap.get(s) ?? {
						count: 0,
						totalCents: 0,
					};
					statusMap.set(s, {
						count: prev.count + 1,
						totalCents: prev.totalCents + (p.amountCents || 0),
					});

					if (s === "Completed") {
						completedCents += p.amountCents || 0;
						completedCount++;
					}
				}

				const totalRevenueDollars = Math.round(completedCents / 100);
				const avgPaymentDollars =
					completedCount > 0
						? Math.round(
								(completedCents / completedCount / 100) * 10
							) / 10
						: 0;

				const byStatus = Array.from(statusMap.entries()).map(
					([status, data]) => ({
						status,
						count: data.count,
						totalDollars: Math.round(data.totalCents / 100),
					})
				);

				return {
					totalRevenue: totalRevenueDollars,
					paymentCount: completedCount,
					avgPayment: avgPaymentDollars,
					byStatus,
					series,
					trend: computeTrend(series),
				};
			} catch (error) {
				logger.error({
					msg: "Analytics.revenue query failed",
					clinicId: scope.clinicId,
					error:
						error instanceof Error ? error.message : String(error),
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate revenue analytics",
					cause: error,
				});
			}
		}),
};

export type AnalyticsRouter = typeof analyticsRouter;
