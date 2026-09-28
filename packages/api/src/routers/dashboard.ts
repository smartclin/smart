// packages/api/src/routers/dashboard.ts

import { ORPCError } from "@orpc/server";
import {
	dashboardRepository,
	type RecentActivityRow,
	type Scope,
} from "@smart/db/repositories/dashboard.repo";
import type { DashboardStats } from "@smart/db/schema/index";
import { z } from "zod";
import { staffProcedure } from "../index";
import { logger } from "../logger/server";

// ============================================================================
// Output types
// ============================================================================

export interface TodayScheduleItem {
	id: string;
	isOverdue: boolean;
	isUrgent: boolean;
	notes?: string;
	patientId: string;
	patientName: string;
	providerName?: string;
	status: AppointmentStatus;
	time: string;
	type: string;
}

type AppointmentStatus =
	| "scheduled"
	| "confirmed"
	| "in_progress"
	| "completed"
	| "cancelled"
	| "no_show";

export interface ActivityItem {
	description: string;
	id: string;
	patientId: string;
	patientName: string;
	timestamp: Date;
	type:
		| "encounter"
		| "appointment"
		| "immunization"
		| "lab_result"
		| "prescription";
}

export interface Alert {
	actionUrl?: string;
	id: string;
	message: string;
	patientId: string;
	patientName: string;
	severity: "info" | "warning" | "critical";
	timestamp: Date;
	type:
		| "overdue_vaccination"
		| "abnormal_growth"
		| "missed_appointment"
		| "lab_result";
}

// ============================================================================
// Input schemas
// ============================================================================

const getStatsSchema = z.object({
	cacheBust: z.boolean().optional().default(false),
});

const getTodayScheduleSchema = z.object({
	date: z.coerce.date().default(() => new Date()),
	includeCompleted: z.boolean().optional().default(false),
	limit: z.number().int().min(1).max(50).default(20),
});

const getRecentActivitySchema = z.object({
	limit: z.number().int().min(1).max(50).default(10),
});

const getAlertsSchema = z.object({
	limit: z.number().int().min(1).max(50).default(10),
	severity: z.enum(["info", "warning", "critical"]).optional(),
});

const getDashboardSchema = z.object({
	date: z.coerce.date().default(() => new Date()),
	includeAlerts: z.boolean().optional().default(true),
	includeActivity: z.boolean().optional().default(true),
	includeSchedule: z.boolean().optional().default(true),
});

const resolveAlertSchema = z.object({
	alertId: z.string().min(1),
	notes: z.string().optional(),
});

// ============================================================================
// Scope resolution
// ============================================================================

/**
 * Doctors see only their own patients; everyone else sees the whole clinic.
 * The clinicId is always set from context — never from input.
 */
function scopeFor(
	user: { id: string; role: string } | null | undefined,
	clinicId: string
): Scope {
	return {
		clinicId,
		providerId: user?.role === "doctor" ? user.id : undefined,
	};
}

// ============================================================================
// Error handling
// ============================================================================

/**
 * Wrap a handler so every failure becomes a clean ORPCError with a
 * logged cause. Replaces 8 near-identical try/catch blocks.
 */
function withErrorHandling<TInput, TOutput>(
	name: string,
	handler: (args: {
		input: TInput;
		context: {
			user?: { id: string; role: string } | null;
			clinicId?: string;
		};
		scope: Scope;
	}) => Promise<TOutput>
) {
	return async (args: {
		input: TInput;
		context: {
			user?: { id: string; role: string } | null;
			clinicId?: string;
		};
	}): Promise<TOutput> => {
		const { clinicId, user } = args.context;

		if (!clinicId) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Clinic ID is required",
			});
		}

		const scope = scopeFor(user ?? null, clinicId);

		try {
			return await handler({ ...args, scope });
		} catch (error) {
			if (error instanceof ORPCError) throw error;

			const message =
				error instanceof Error ? error.message : "Unknown error";
			logger.error({
				msg: `Dashboard.${name} failed`,
				userId: user?.id,
				clinicId,
				error: message,
			});
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: `Dashboard.${name} failed: ${message}`,
				cause: error,
			});
		}
	};
}

// ============================================================================
// Adapters (repo row → router output)
// ============================================================================

const STATUS_MAP: Record<string, AppointmentStatus> = {
	scheduled: "scheduled",
	confirmed: "confirmed",
	"in-progress": "in_progress",
	in_progress: "in_progress",
	completed: "completed",
	cancelled: "cancelled",
	"no-show": "no_show",
	no_show: "no_show",
};

function toScheduleItem(
	row: Awaited<
		ReturnType<typeof dashboardRepository.getAppointmentsByDate>
	>[number]
): TodayScheduleItem {
	const statusKey = (row.status ?? "").toLowerCase();
	const status = STATUS_MAP[statusKey] ?? "scheduled";
	const scheduledAt = new Date(row.scheduledAt);
	const now = new Date();

	return {
		id: row.id,
		patientId: row.patientId,
		patientName: row.patientName,
		providerName: row.providerName ?? undefined,
		time: scheduledAt.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		}),
		type: row.type,
		status,
		isOverdue:
			scheduledAt < now &&
			status !== "completed" &&
			status !== "cancelled",
		isUrgent: row.priority === "Urgent" || row.priority === "Emergency",
		notes: row.notes ?? undefined,
	};
}

function toActivityItem(row: RecentActivityRow): ActivityItem {
	return {
		id: row.id,
		patientId: row.patientId,
		patientName: row.patientName,
		description: row.description,
		timestamp: row.timestamp,
		type: row.type,
	};
}

// ============================================================================
// Alerts
// ============================================================================

async function buildAlerts(
	scope: Scope,
	options: { limit: number; severity?: Alert["severity"] }
): Promise<Alert[]> {
	const alerts: Alert[] = [];

	// Only build critical alerts if the caller asked for critical or no filter.
	if (!options.severity || options.severity === "critical") {
		const overdue = await dashboardRepository.getOverdueVaccinations(
			scope,
			options.limit + 5
		);

		for (const vax of overdue) {
			if (!vax.scheduledDate) continue;
			alerts.push({
				// Include the vaccine name so multiple overdue vaccines for the
				// same patient don't collide.
				id: `vax:${vax.patientId}:${vax.vaccineName}:${vax.scheduledDate}`,
				patientId: vax.patientId,
				patientName: vax.patientName,
				type: "overdue_vaccination",
				message: `${vax.vaccineName} vaccination overdue (${new Date(vax.scheduledDate).toLocaleDateString()})`,
				severity: "critical",
				timestamp: new Date(vax.scheduledDate),
				actionUrl: `/app/patients/${vax.patientId}/immunizations`,
			});
		}
	}

	return alerts
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		.slice(0, options.limit);
}

// ============================================================================
// Router
// ============================================================================

export const dashboardRouter = {
	getDashboard: staffProcedure.input(getDashboardSchema).handler(
		withErrorHandling("getDashboard", async ({ input, scope }) => {
			const { date, includeAlerts, includeActivity, includeSchedule } =
				input;

			const [stats, schedule, activity, alerts] = await Promise.all([
				dashboardRepository.getDashboardStats(scope),
				includeSchedule
					? dashboardRepository
							.getAppointmentsByDate(date, scope, { limit: 20 })
							.then((rows) => rows.map(toScheduleItem))
					: Promise.resolve([]),
				includeActivity
					? dashboardRepository
							.getRecentActivity(scope, 10)
							.then((rows) => rows.map(toActivityItem))
					: Promise.resolve([]),
				includeAlerts
					? buildAlerts(scope, { limit: 10 })
					: Promise.resolve([]),
			]);

			return {
				stats,
				todaySchedule: schedule,
				recentActivity: activity,
				alerts,
				lastUpdated: new Date(),
			};
		})
	),

	getSummary: staffProcedure.input(getStatsSchema).handler(
		withErrorHandling("getSummary", async ({ scope }) => {
			const [stats, alerts] = await Promise.all([
				dashboardRepository.getDashboardStats(scope),
				buildAlerts(scope, { limit: 1 }),
			]);

			return {
				stats,
				alertsCount: alerts.length,
				todayAppointmentsCount: stats.todayAppointments,
				recentActivityCount: 10,
			};
		})
	),

	getStats: staffProcedure
		.input(getStatsSchema)
		.handler(
			withErrorHandling<z.infer<typeof getStatsSchema>, DashboardStats>(
				"getStats",
				async ({ scope }) =>
					dashboardRepository.getDashboardStats(scope)
			)
		),
	getStatsLite: staffProcedure.handler(
		withErrorHandling("getStatsLite", async ({ scope }) => {
			const stats = await dashboardRepository.getDashboardStats(scope);
			return {
				stats,
				alertsCount: 0,
				todayAppointmentsCount: stats.todayAppointments,
				recentActivityCount: 0,
			};
		})
	),
	getTodaySchedule: staffProcedure.input(getTodayScheduleSchema).handler(
		withErrorHandling("getTodaySchedule", async ({ input, scope }) => {
			const rows = await dashboardRepository.getAppointmentsByDate(
				input.date,
				scope,
				{
					includeCompleted: input.includeCompleted,
					limit: input.limit,
				}
			);
			const schedule = rows.map(toScheduleItem);

			return {
				date: input.date.toISOString(),
				schedule,
				total: schedule.length,
				completed: schedule.filter((a) => a.status === "completed")
					.length,
				pending: schedule.filter(
					(a) => a.status !== "completed" && a.status !== "cancelled"
				).length,
			};
		})
	),

	getRecentActivity: staffProcedure.input(getRecentActivitySchema).handler(
		withErrorHandling("getRecentActivity", async ({ input, scope }) => {
			const rows = await dashboardRepository.getRecentActivity(
				scope,
				input.limit
			);
			const activity = rows.map(toActivityItem);

			return {
				activity,
				total: activity.length,
				hasMore: activity.length === input.limit,
			};
		})
	),

	getAlerts: staffProcedure.input(getAlertsSchema).handler(
		withErrorHandling("getAlerts", async ({ input, scope }) => {
			const alerts = await buildAlerts(scope, {
				limit: input.limit,
				severity: input.severity,
			});

			return {
				alerts,
				total: alerts.length,
				criticalCount: alerts.filter((a) => a.severity === "critical")
					.length,
				warningCount: alerts.filter((a) => a.severity === "warning")
					.length,
				infoCount: alerts.filter((a) => a.severity === "info").length,
			};
		})
	),

	resolveAlert: staffProcedure
		.input(resolveAlertSchema)
		.handler(async ({ input, context }) => {
			// TODO: persist the resolution. The repo has no resolver today.
			logger.info({
				msg: "Alert resolved",
				userId: context.user?.id,
				alertId: input.alertId,
				notes: input.notes,
			});

			return {
				success: true,
				alertId: input.alertId,
				resolvedAt: new Date(),
				resolvedBy: context.user?.id,
			};
		}),
};

export type DashboardRouter = typeof dashboardRouter;
