// src/hooks/query-keys.ts

import type {
	AppointmentStatus,
	EncounterStatus,
	ImmunizationStatus,
	VisitType,
} from "@smart/db/schema/types";

// ---------------------------------------------------------------------------
// stableParams
// ---------------------------------------------------------------------------

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		!(value instanceof Date) &&
		!(value instanceof RegExp)
	);
}

/**
 * Convert a value into a stable, JSON-serializable representation.
 *
 * - drops `undefined` keys
 * - sorts object keys alphabetically
 * - converts `Date` to ISO string
 * - recurses into nested plain objects
 * - leaves arrays in order (arrays are positional)
 */
function stableValue(value: unknown): unknown {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(stableValue);
	if (isPlainObject(value)) {
		const out: PlainObject = {};
		for (const key of Object.keys(value).toSorted()) {
			const v = stableValue(value[key]);
			if (v !== undefined) out[key] = v;
		}
		return out;
	}
	return value;
}

/**
 * Produce a stable JSON string for a params object.
 *
 * Exported because the mutation layer and optimistic helpers need the
 * same normalization when building keys by hand.
 */
export function stableParams(params: PlainObject | undefined): string {
	if (params === undefined) return "";
	const stable = stableValue(params);
	return JSON.stringify(stable);
}

// ---------------------------------------------------------------------------
// Params types (structural — kept loose so query-keys.ts has no import cycle)
// ---------------------------------------------------------------------------

export interface PatientSearchParams {
	activeStatus?: "Active" | "Inactive" | "Archived";
	ageRange?: { min?: number; max?: number };
	gender?: "male" | "female";
	hasAllergies?: boolean;
	hasChronicConditions?: boolean;
	limit?: number;
	offset?: number;
	orderBy?: "firstName" | "lastName" | "createdAt" | "dateOfBirth";
	orderDirection?: "asc" | "desc";
	pediatricianId?: string;
	query?: string;
}

export interface PatientCountParams {
	activeStatus?: "Active" | "Inactive" | "Archived";
}

export interface AppointmentSearchParams {
	appointmentType?: VisitType;
	endDate?: Date;
	limit?: number;
	offset?: number;
	patientId?: string;
	query?: string;
	staffId?: string;
	startDate?: Date;
	status?: AppointmentStatus;
}
export type ImmunizationListParams = {
	query?: string;
	status?: ImmunizationStatus;
	dateRange?: "Due Soon" | "Overdue" | "Completed";
	patientId?: string;
	limit?: number;
	offset?: number;
};
export interface EncounterSearchParams {
	endDate?: Date;
	limit?: number;
	offset?: number;
	page?: number;
	pageSize?: number;
	patientId?: string;
	providerId?: string;
	query?: string;
	startDate?: Date;
	status?: EncounterStatus;
	visitType?: VisitType;
}

export interface LabSearchParams {
	endDate?: Date;
	limit?: number;
	offset?: number;
	orderedBy?: string;
	patientId?: string;
	priority?: "Routine" | "Urgent" | "Stat";
	query?: string;
	startDate?: Date;
	status?:
		| "Ordered"
		| "Sample Collected"
		| "Processing"
		| "Completed"
		| "Cancelled";
}

export interface PrescriptionSearchParams {
	endDate?: Date;
	limit?: number;
	offset?: number;
	patientId?: string;
	prescribedBy?: string;
	query?: string;
	startDate?: Date;
	status?: "Active" | "Completed" | "Discontinued" | "Cancelled";
}

export interface VitalSearchParams {
	encounterId?: string;
	endDate?: Date;
	limit?: number;
	offset?: number;
	patientId?: string;
	startDate?: Date;
}

export interface GrowthSearchParams {
	endDate?: Date;
	limit?: number;
	maxAgeMonths?: number;
	minAgeMonths?: number;
	offset?: number;
	startDate?: Date;
}

export interface StaffSearchParams {
	isActive?: boolean;
	limit?: number;
	offset?: number;
	orderBy?: "name" | "createdAt";
	orderDirection?: "asc" | "desc";
	role?: "admin" | "doctor" | "staff" | "patient";
	search?: string;
}

export interface DashboardParams {
	date?: Date;
	includeActivity?: boolean;
	includeAlerts?: boolean;
	includeSchedule?: boolean;
	providerId?: string;
}

// ---------------------------------------------------------------------------
// queryKeys
// ---------------------------------------------------------------------------
export const activityKeys = {
	all: ["activity"] as const,
	today: (params: { date?: string; limit: number; offset: number }) =>
		[...activityKeys.all, "today", params] as const,
	todaySchedule: (params: { date?: string; limit: number }) =>
		[...activityKeys.all, "today-schedule", params] as const,
} as const;
export const queryKeys = {
	auth: {
		all: ["auth"] as const,
	},
	activity: activityKeys,
	patients: {
		all: ["patients"] as const,
		list: (p: PatientSearchParams) =>
			["patients", "list", stableParams({ p })] as const,
		detail: (id: string) => ["patients", "detail", id] as const,
		full: (id: string) => ["patients", "full", id] as const,
		byMrn: (mrn: string) => ["patients", "mrn", mrn] as const,
		encounters: (id: string) => ["patients", id, "encounters"] as const,
		vitals: (id: string) => ["patients", id, "vitals"] as const,
		growth: (id: string) => ["patients", id, "growth"] as const,
		immunizations: (id: string) =>
			["patients", id, "immunizations"] as const,
		prescriptions: (id: string) =>
			["patients", id, "prescriptions"] as const,
		labOrders: (id: string) => ["patients", id, "labOrders"] as const,
		stats: ["patients", "stats"] as const,
		count: (p?: PatientCountParams) =>
			["patients", "count", stableParams({ p })] as const,
	},
	analytics: {
		all: ["analytics"] as const,
		insights: (params: Record<string, unknown>) =>
			["analytics", "insights", params] as const,
	},

	appointments: {
		all: ["appointments"] as const,
		list: (p: AppointmentSearchParams) =>
			["appointments", "list", stableParams({ p })] as const,
		detail: (id: string) => ["appointments", "detail", id] as const,
		byPatient: (patientId: string, p: AppointmentSearchParams) =>
			[
				"appointments",
				"patient",
				patientId,
				stableParams({ p }),
			] as const,
		byStaff: (staffId: string, p: AppointmentSearchParams) =>
			["appointments", "staff", staffId, stableParams({ p })] as const,
		byDate: (date: Date, p: AppointmentSearchParams) =>
			[
				"appointments",
				"date",
				date.toISOString(),
				stableParams({ p }),
			] as const,
		upcoming: (patientId: string, limit = 10) =>
			["appointments", "upcoming", patientId, limit] as const,
		slots: (staffId: string, date: string, durationMinutes: number) =>
			["appointments", "slots", staffId, date, durationMinutes] as const,
		stats: ["appointments", "stats"] as const,
		count: (p: AppointmentSearchParams) =>
			["appointments", "count", stableParams({ p })] as const,
	},

	encounters: {
		all: ["encounters"] as const,
		detail: (id: string) => ["encounters", "detail", id] as const,
		list: (p: EncounterSearchParams) =>
			["encounters", "list", stableParams({ p })] as const,
		byPatient: (patientId: string, p: EncounterSearchParams) =>
			["encounters", "patient", patientId, stableParams({ p })] as const,
		recent: (limit: number) => ["encounters", "recent", limit] as const,
		stats: ["encounters", "stats"] as const,
		count: (p: EncounterSearchParams) =>
			["encounters", "count", stableParams({ p })] as const,
	},

	immunizations: {
		all: ["immunizations"] as const,
		list: (p?: ImmunizationListParams) =>
			["immunizations", "list", stableParams(p ?? {})] as const,
		detail: (id: string) => ["immunizations", "detail", id] as const,
		byPatient: (patientId: string, status?: string) =>
			["immunizations", "patient", patientId, status ?? "all"] as const,
		overdue: (patientId: string) =>
			["immunizations", "overdue", patientId] as const,
		upcoming: (patientId: string, daysAhead: number) =>
			["immunizations", "upcoming", patientId, daysAhead] as const,
		allOverdue: ["immunizations", "allOverdue"] as const,
		compliance: (patientId: string) =>
			["immunizations", "compliance", patientId] as const,
		count: (p?: { patientId?: string; status?: string }) =>
			["immunizations", "count", stableParams(p ?? {})] as const,
	},

	labs: {
		all: ["labs"] as const,
		detail: (id: string) => ["labs", "detail", id] as const,
		byNumber: (orderNumber: string) =>
			["labs", "number", orderNumber] as const,
		list: (p: LabSearchParams) =>
			["labs", "list", stableParams({ p })] as const,
		byPatient: (patientId: string, p: LabSearchParams) =>
			["labs", "patient", patientId, stableParams({ p })] as const,
		pending: (patientId?: string) =>
			["labs", "pending", patientId ?? "all"] as const,
		abnormal: (patientId: string) =>
			["labs", "abnormal", patientId] as const,
		stats: ["labs", "stats"] as const,
		count: (p?: LabSearchParams) =>
			["labs", "count", stableParams({ p })] as const,
	},

	prescriptions: {
		all: ["prescriptions"] as const,
		detail: (id: string) => ["prescriptions", "detail", id] as const,
		byNumber: (rxNumber: string) =>
			["prescriptions", "number", rxNumber] as const,
		list: (p: PrescriptionSearchParams) =>
			["prescriptions", "list", stableParams({ p })] as const,
		byPatient: (patientId: string, p: PrescriptionSearchParams) =>
			[
				"prescriptions",
				"patient",
				patientId,
				stableParams({ p }),
			] as const,
		active: (patientId: string) =>
			["prescriptions", "active", patientId] as const,
		stats: ["prescriptions", "stats"] as const,
		count: (p?: PrescriptionSearchParams) =>
			["prescriptions", "count", stableParams({ p })] as const,
	},

	vitals: {
		all: ["vitals"] as const,
		detail: (id: string) => ["vitals", "detail", id] as const,
		list: (p: VitalSearchParams) =>
			["vitals", "list", stableParams({ p })] as const,
		byPatient: (patientId: string, p: VitalSearchParams) =>
			["vitals", "patient", patientId, stableParams({ p })] as const,
		byEncounter: (encounterId: string) =>
			["vitals", "encounter", encounterId] as const,
		latest: (patientId: string) => ["vitals", "latest", patientId] as const,
		abnormal: (patientId: string, limit: number) =>
			["vitals", "abnormal", patientId, limit] as const,
		count: (p?: VitalSearchParams) =>
			["vitals", "count", stableParams({ p })] as const,
	},

	growth: {
		all: ["growth"] as const,
		detail: (id: string) => ["growth", "detail", id] as const,
		byPatient: (patientId: string, p: GrowthSearchParams) =>
			["growth", "patient", patientId, stableParams({ p })] as const,
		latest: (patientId: string) => ["growth", "latest", patientId] as const,
		chart: (patientId: string, metric: string) =>
			["growth", "chart", patientId, metric] as const,
		stats: (patientId: string) => ["growth", "stats", patientId] as const,
		percentiles: (patientId: string) =>
			["growth", "percentiles", patientId] as const,
		whoData: (gender: string, metricType: string) =>
			["growth", "who", gender, metricType] as const,
		whoCurve: (gender: string, metricType: string, ageMonths: number[]) =>
			[
				"growth",
				"who",
				"curve",
				gender,
				metricType,
				ageMonths.join(","),
			] as const,
		whoLms: (gender: string, metricType: string, ageMonths: number) =>
			["growth", "who", "lms", gender, metricType, ageMonths] as const,
		whoAgeRange: (gender: string, metricType: string) =>
			["growth", "who", "ageRange", gender, metricType] as const,
		count: (p?: GrowthSearchParams) =>
			["growth", "count", stableParams({ p })] as const,
	},

	staff: {
		all: ["staff"] as const,
		list: (p: StaffSearchParams) =>
			["staff", "list", stableParams({ p })] as const,
		detail: (id: string) => ["staff", "detail", id] as const,
		byEmail: (email: string) => ["staff", "email", email] as const,
		active: ["staff", "active"] as const,
		byRole: (role: string) => ["staff", "role", role] as const,
		withPatients: (id: string) => ["staff", id, "patients"] as const,
		withEncounters: (id: string) => ["staff", id, "encounters"] as const,
		withPrescriptions: (id: string) =>
			["staff", id, "prescriptions"] as const,
		stats: ["staff", "stats"] as const,
		count: (p?: StaffSearchParams) =>
			["staff", "count", stableParams({ p })] as const,
	},

	dashboard: {
		all: ["dashboard"] as const,
		stats: (providerId?: string) =>
			["dashboard", "stats", providerId ?? "all"] as const,
		todaySchedule: (p: {
			providerId?: string;
			date?: string;
			includeCompleted?: boolean;
			limit?: number;
		}) => ["dashboard", "schedule", stableParams(p)] as const,
		recentActivity: (p: {
			providerId?: string;
			limit?: number;
			offset?: number;
		}) => ["dashboard", "activity", stableParams(p)] as const,
		alerts: (p: {
			providerId?: string;
			limit?: number;
			severity?: string;
			includeResolved?: boolean;
		}) => ["dashboard", "alerts", stableParams(p)] as const,
		full: (p: DashboardParams) =>
			["dashboard", "full", stableParams({ p })] as const,
	},
} as const;

export type QueryKeys = typeof queryKeys;
