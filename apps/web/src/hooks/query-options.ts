// src/hooks/query-options.ts

import type {
	ImmunizationStatus,
	MetricType,
	Role,
} from "@smart/db/schema/types";

import { orpc } from "@/lib/orpc/utils";

import type {
	AppointmentSearchParams,
	EncounterSearchParams,
	GrowthSearchParams,
	LabSearchParams,
	PatientCountParams,
	PatientSearchParams,
	PrescriptionSearchParams,
	StaffSearchParams,
	VitalSearchParams,
} from "./query-keys.ts";

// ---------------------------------------------------------------------------
// Staleness policy
// ---------------------------------------------------------------------------

const STALE = {
	auth: 60_000,
	immunizationList: 30_000,
	patientsList: 30_000,
	patientDetail: 30_000,
	patientFull: 30_000,
	appointmentsList: 15_000,
	appointmentsByDate: 15_000,
	availableSlots: 30_000,
	encounters: 30_000,
	immunizationsList: 15_000,
	immunizations: 60_000,
	labs: 30_000,
	prescriptions: 30_000,
	vitals: 30_000,
	growth: 60_000,
	whoReference: 300_000,
	staffList: 60_000,
	staffDetail: 60_000,
	dashboardStats: 15_000,
	statsAndCounts: 60_000,
} as const;

// ===========================================================================
// Patients
// ===========================================================================

export const patientListQueryOptions = (params: PatientSearchParams) =>
	orpc.patient.search.queryOptions({
		input: params,
		staleTime: STALE.patientsList,
	});

export const patientSummaryListQueryOptions = (params: {
	limit?: number;
	offset?: number;
	activeStatus?: "Active" | "Inactive" | "Archived";
}) =>
	orpc.patient.getAll.queryOptions({
		input: params,
		staleTime: 5 * 60_000,
	});

export const patientSearchQueryOptions = (params: PatientSearchParams) =>
	orpc.patient.search.queryOptions({
		input: params,
		staleTime: STALE.patientsList,
	});

export const allPatientsQueryOptions = (params: {
	limit?: number;
	offset?: number;
	activeStatus?: "Active" | "Inactive" | "Archived";
}) =>
	orpc.patient.getAll.queryOptions({
		input: params,
		staleTime: STALE.patientsList,
	});

export const patientByIdQueryOptions = (id: string) =>
	orpc.patient.getById.queryOptions({
		input: id,
		staleTime: STALE.patientDetail,
	});

export const patientByMrnQueryOptions = (mrn: string) =>
	orpc.patient.getByMRN.queryOptions({
		input: mrn,
		staleTime: STALE.patientDetail,
	});

export const fullPatientQueryOptions = (id: string) =>
	orpc.patient.getFullData.queryOptions({
		input: id,
		staleTime: STALE.patientFull,
	});

export const patientEncountersQueryOptions = (id: string) =>
	orpc.patient.getEncounters.queryOptions({
		input: { patientId: id, limit: 50, offset: 0 },
		staleTime: STALE.encounters,
	});

export const patientGrowthQueryOptions = (id: string) =>
	orpc.patient.getGrowthData.queryOptions({
		input: id,
		staleTime: STALE.growth,
	});

export const patientImmunizationsQueryOptions = (id: string) =>
	orpc.patient.getImmunizations.queryOptions({
		input: id,
		staleTime: STALE.immunizations,
	});

export const patientPrescriptionsQueryOptions = (id: string) =>
	orpc.patient.getPrescriptions.queryOptions({
		input: { patientId: id },
		staleTime: STALE.prescriptions,
	});

export const patientLabOrdersQueryOptions = (id: string) =>
	orpc.patient.getLabOrders.queryOptions({
		input: { patientId: id },
		staleTime: STALE.labs,
	});

export const patientVitalsQueryOptions = (id: string) =>
	orpc.patient.getVitals.queryOptions({
		input: { patientId: id, limit: 10 },
		staleTime: STALE.vitals,
	});

export const patientStatsQueryOptions = () =>
	orpc.patient.getStats.queryOptions({
		staleTime: STALE.statsAndCounts,
	});

export const patientActivityTodayQueryOptions = (params: {
	date?: Date;
	limit?: number;
	offset?: number;
}) =>
	orpc.patient.getPatientActivityToday.queryOptions({
		input: params,
		staleTime: 30_000,
	});
export const patientCountQueryOptions = (params: PatientCountParams = {}) =>
	orpc.patient.count.queryOptions({
		input: params,
		staleTime: STALE.statsAndCounts,
	});

// ⚠️ Ther is no `patient.activityToday` procedure on the server.
// If you need today's activity, use the dashboard's schedule endpoints
// or add a procedure. Removed to avoid a runtime error.

export const todayScheduleQueryOptions = (params: {
	date?: Date;
	limit?: number;
}) =>
	orpc.dashboard.getTodaySchedule.queryOptions({
		input: {
			...(params.date ? { date: params.date } : {}),
			includeCompleted: false,
			limit: params.limit ?? 4,
		},
		staleTime: STALE.appointmentsByDate,
	});

// ===========================================================================
// Appointments  →  server namespace is `appointment` (singular)
// ===========================================================================

export const appointmentListQueryOptions = (params: AppointmentSearchParams) =>
	orpc.appointment.findAll.queryOptions({
		input: params,
		staleTime: STALE.appointmentsList,
	});

export const appointmentByIdQueryOptions = (id: string) =>
	orpc.appointment.getById.queryOptions({
		input: id,
		staleTime: STALE.appointmentsList,
	});

export const appointmentsByPatientQueryOptions = (
	patientId: string,
	params: AppointmentSearchParams = {}
) =>
	orpc.appointment.findByPatientId.queryOptions({
		input: { patientId, ...params },
		staleTime: STALE.appointmentsList,
	});

export const appointmentsByStaffQueryOptions = (
	staffId: string,
	params: AppointmentSearchParams = {}
) =>
	orpc.appointment.findByStaffId.queryOptions({
		input: { staffId, ...params },
		staleTime: STALE.appointmentsList,
	});

export const appointmentsByDateQueryOptions = (
	date: Date,
	params: { limit?: number; offset?: number } = {}
) =>
	orpc.appointment.findByDate.queryOptions({
		input: {
			date,
			limit: params.limit ?? 50,
			offset: params.offset ?? 0,
		},
		staleTime: STALE.appointmentsByDate,
	});
export const availableSlotsQueryOptions = (
	staffId: string,
	date: string,
	durationMinutes = 30
) =>
	orpc.appointment.getAvailableSlots.queryOptions({
		input: {
			staffId,
			date,
			durationMinutes,
		},
		staleTime: STALE.availableSlots,
	});
export const immunizationListQueryOptions = (params: ImmunizationListParams) =>
	orpc.immunization.getAll.queryOptions({
		input: params,
		staleTime: STALE.immunizationList,
	});
export const upcomingAppointmentsQueryOptions = (
	patientId: string,
	limit = 10
) =>
	orpc.appointment.getUpcoming.queryOptions({
		input: { patientId, limit },
		staleTime: STALE.appointmentsList,
	});

export const appointmentStatsQueryOptions = () =>
	orpc.appointment.getStats.queryOptions({
		staleTime: STALE.statsAndCounts,
	});

export const appointmentCountQueryOptions = (params: AppointmentSearchParams) =>
	orpc.appointment.findAll.queryOptions({
		input: params,
		staleTime: STALE.statsAndCounts,
		select: (result) => result.total,
	});

// ⚠️ There is no `appointment.availableSlots` procedure on the server.
// Removed. Add it to `routers/appointment.ts` if you need it.

// ===========================================================================
// Encounters  →  server namespace is `encounter` (singular)
// ===========================================================================

export const encounterByIdQueryOptions = (id: string) =>
	orpc.encounter.getById.queryOptions({
		input: id,
		staleTime: STALE.encounters,
	});

export const encounterListQueryOptions = (params: EncounterSearchParams) =>
	orpc.encounter.search.queryOptions({
		input: {
			visitType: params.visitType ?? "Consultation",
			status: params.status ?? "Completed",
			...params,
		},
		staleTime: STALE.encounters,
	});

export const encountersByPatientQueryOptions = (
	patientId: string,
	params: Omit<EncounterSearchParams, "patientId"> = {}
) =>
	orpc.encounter.findByPatientId.queryOptions({
		input: {
			patientId,
			limit: params.limit ?? 50,
			offset: params.offset ?? 0,
			...params,
		},
		staleTime: STALE.encounters,
	});

export const recentEncountersQueryOptions = (limit = 10) =>
	orpc.encounter.getRecent.queryOptions({
		input: limit,
		staleTime: STALE.encounters,
	});

export const encounterStatsQueryOptions = () =>
	orpc.encounter.getStats.queryOptions({
		staleTime: STALE.statsAndCounts,
	});

// ===========================================================================
// Immunizations  →  server namespace is `immunization` (singular)
// ===========================================================================

export const immunizationByIdQueryOptions = (id: string) =>
	orpc.immunization.getById.queryOptions({
		input: id,
		staleTime: STALE.immunizations,
	});

export const immunizationsByPatientQueryOptions = (
	patientId: string,
	status?: ImmunizationStatus
) =>
	orpc.immunization.getByPatientId.queryOptions({
		input: { patientId, status },
		staleTime: STALE.immunizations,
	});

export const overdueImmunizationsQueryOptions = (patientId: string) =>
	orpc.immunization.getOverdue.queryOptions({
		input: patientId,
		staleTime: STALE.immunizations,
	});

export const upcomingImmunizationsQueryOptions = (
	patientId: string,
	daysAhead = 30
) =>
	orpc.immunization.getUpcoming.queryOptions({
		input: { patientId, daysAhead },
		staleTime: STALE.immunizations,
	});

export const allOverdueImmunizationsQueryOptions = () =>
	orpc.immunization.getAllOverdue.queryOptions({
		staleTime: STALE.immunizations,
	});

export const vaccineComplianceQueryOptions = (patientId: string) =>
	orpc.immunization.getComplianceRate.queryOptions({
		input: patientId,
		staleTime: STALE.immunizations,
	});

export const immunizationCountQueryOptions = (
	params: { patientId?: string; status?: ImmunizationStatus } = {}
) =>
	orpc.immunization.getCount.queryOptions({
		input: params,
		staleTime: STALE.statsAndCounts,
		select: (result) => result.count,
	});

export type ImmunizationListParams = {
	query?: string;
	status?: ImmunizationStatus;
	dateRange?: "Due Soon" | "Overdue" | "Completed";
	limit?: number;
	offset?: number;
};

// ⚠️ `immunization.list` doesn't exist on the server. The nearest equivalent
// is `getByPatientId` / `getAllOverdue`. Removed; add a `list` procedure if
// you need a cross-patient list.

// ===========================================================================
// Labs  →  server namespace is `lab` (singular)
// ===========================================================================

export const labOrderByIdQueryOptions = (id: string) =>
	orpc.lab.getById.queryOptions({
		input: id,
		staleTime: STALE.labs,
	});

export const labOrderByNumberQueryOptions = (orderNumber: string) =>
	orpc.lab.getByOrderNumber.queryOptions({
		input: orderNumber,
		staleTime: STALE.labs,
	});

export const labOrderListQueryOptions = (params: LabSearchParams) =>
	orpc.lab.findAll.queryOptions({
		input: params,
		staleTime: STALE.labs,
	});

export const labOrdersByPatientQueryOptions = (
	patientId: string,
	params: Omit<LabSearchParams, "patientId"> = {}
) =>
	orpc.lab.getByPatientId.queryOptions({
		input: {
			patientId,
			limit: params.limit ?? 50,
			offset: params.offset ?? 0,
			...params,
		},
		staleTime: STALE.labs,
	});

export const pendingLabOrdersQueryOptions = (patientId?: string) =>
	orpc.lab.getPending.queryOptions({
		input: patientId,
		staleTime: STALE.labs,
	});

export const abnormalLabResultsQueryOptions = (patientId: string) =>
	orpc.lab.getAbnormalResults.queryOptions({
		input: patientId,
		staleTime: STALE.labs,
	});

export const labStatsQueryOptions = () =>
	orpc.lab.getStats.queryOptions({
		staleTime: STALE.statsAndCounts,
	});

// ===========================================================================
// Prescriptions  →  server namespace is `prescription` (singular)
// ===========================================================================

export const prescriptionByIdQueryOptions = (id: string) =>
	orpc.prescription.getById.queryOptions({
		input: id,
		staleTime: STALE.prescriptions,
	});

export const prescriptionByNumberQueryOptions = (rxNumber: string) =>
	orpc.prescription.getByRxNumber.queryOptions({
		input: rxNumber,
		staleTime: STALE.prescriptions,
	});

export const prescriptionListQueryOptions = (
	params: PrescriptionSearchParams
) =>
	orpc.prescription.findAll.queryOptions({
		input: params,
		staleTime: STALE.prescriptions,
	});

export const prescriptionsByPatientQueryOptions = (
	patientId: string,
	params: Omit<PrescriptionSearchParams, "patientId"> = {}
) =>
	orpc.prescription.getByPatientId.queryOptions({
		input: {
			patientId,
			limit: params.limit ?? 50,
			offset: params.offset ?? 0,
			...params,
		},
		staleTime: STALE.prescriptions,
	});

export const activePrescriptionsQueryOptions = (patientId: string) =>
	orpc.prescription.getActive.queryOptions({
		input: patientId,
		staleTime: STALE.prescriptions,
	});

export const prescriptionStatsQueryOptions = () =>
	orpc.prescription.getStats.queryOptions({
		staleTime: STALE.statsAndCounts,
	});

// ===========================================================================
// Vitals  →  server namespace is `vitals` (plural) ✅
// ===========================================================================

export const vitalByIdQueryOptions = (id: string) =>
	orpc.vitals.getById.queryOptions({
		input: id,
		staleTime: STALE.vitals,
	});

export const vitalListQueryOptions = (params: VitalSearchParams) =>
	orpc.vitals.findAll.queryOptions({
		input: params,
		staleTime: STALE.vitals,
	});

export const vitalsByPatientQueryOptions = (
	patientId: string,
	params: Omit<VitalSearchParams, "patientId"> = {}
) =>
	orpc.vitals.getByPatientId.queryOptions({
		input: {
			patientId,
			limit: params.limit ?? 50,
			offset: params.offset ?? 0,
			...params,
		},
		staleTime: STALE.vitals,
	});

export const vitalsByEncounterQueryOptions = (encounterId: string) =>
	orpc.vitals.getByEncounterId.queryOptions({
		input: encounterId,
		staleTime: STALE.vitals,
	});

export const latestVitalQueryOptions = (patientId: string) =>
	orpc.vitals.getLatest.queryOptions({
		input: patientId,
		staleTime: STALE.vitals,
	});

export const abnormalVitalsQueryOptions = (patientId: string, limit = 20) =>
	orpc.vitals.getAbnormal.queryOptions({
		input: { patientId, limit },
		staleTime: STALE.vitals,
	});

export const vitalsByDateRangeQueryOptions = (params: {
	startDate: Date;
	endDate: Date;
	patientId?: string;
}) =>
	orpc.vitals.getByDateRange.queryOptions({
		input: params,
		staleTime: STALE.vitals,
	});

export const vitalsCountQueryOptions = (
	params: { patientId?: string; startDate?: Date; endDate?: Date } = {}
) =>
	orpc.vitals.getCount.queryOptions({
		input: params,
		staleTime: STALE.statsAndCounts,
	});

// ===========================================================================
// Growth  →  server namespace is `growth` ✅ but procedure names differ
// ===========================================================================

export const growthMeasurementByIdQueryOptions = (id: string) =>
	orpc.growth.getById.queryOptions({
		input: id,
		staleTime: STALE.growth,
	});

export const growthMeasurementsByPatientQueryOptions = (
	patientId: string,
	params: Omit<GrowthSearchParams, "patientId"> = {}
) =>
	orpc.growth.getByPatientId.queryOptions({
		input: {
			patientId,
			limit: params.limit ?? 50,
			offset: params.offset ?? 0,
			...params,
		},
		staleTime: STALE.growth,
	});

export const latestGrowthMeasurementQueryOptions = (patientId: string) =>
	orpc.growth.getLatest.queryOptions({
		input: patientId,
		staleTime: STALE.growth,
	});

export const growthChartDataQueryOptions = (
	patientId: string,
	metric: MetricType = "weight"
) =>
	orpc.growth.getChartData.queryOptions({
		input: { patientId, metric },
		staleTime: STALE.growth,
	});

export const growthStatsQueryOptions = (patientId: string) =>
	orpc.growth.getStats.queryOptions({
		input: patientId,
		staleTime: STALE.growth,
	});

export const growthPercentilesQueryOptions = (patientId: string) =>
	orpc.growth.getPercentiles.queryOptions({
		input: patientId,
		staleTime: STALE.growth,
	});

export const whoGrowthDataQueryOptions = (
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi"
) =>
	orpc.growth.getWHOData.queryOptions({
		input: { gender, metricType },
		staleTime: STALE.whoReference,
	});

export const whoPercentileCurveQueryOptions = (
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi",
	ageMonths: number[]
) =>
	orpc.growth.getWHOPercentileCurve.queryOptions({
		input: { gender, metricType, ageMonths },
		staleTime: STALE.whoReference,
	});

export const whoLmsParametersQueryOptions = (
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi",
	ageMonths: number
) =>
	orpc.growth.getWHOLMSParameters.queryOptions({
		input: { gender, metricType, ageMonths },
		staleTime: STALE.whoReference,
	});

export const whoAgeRangeQueryOptions = (
	gender: "male" | "female",
	metricType: "weight" | "height" | "head_circumference" | "bmi"
) =>
	orpc.growth.getWHOAgeRange.queryOptions({
		input: { gender, metricType },
		staleTime: STALE.whoReference,
	});

// ===========================================================================
// Staff  →  server namespace is `staff` ✅ but procedure names differ
// ===========================================================================

export const staffListQueryOptions = (params: StaffSearchParams = {}) =>
	orpc.staff.findAll.queryOptions({
		input: params,
		staleTime: STALE.staffList,
	});

export const staffByIdQueryOptions = (id: string) =>
	orpc.staff.getById.queryOptions({
		input: id,
		staleTime: STALE.staffDetail,
	});

export const staffByEmailQueryOptions = (email: string) =>
	orpc.staff.getByEmail.queryOptions({
		input: email,
		staleTime: STALE.staffDetail,
	});

export const activeStaffQueryOptions = () =>
	orpc.staff.getActive.queryOptions({
		staleTime: STALE.staffList,
	});

export const staffByRoleQueryOptions = (
	role: "admin" | "doctor" | "staff" | "patient"
) =>
	orpc.staff.getByRole.queryOptions({
		input: role,
		staleTime: STALE.staffList,
	});

export const staffWithPatientsQueryOptions = (id: string) =>
	orpc.staff.getWithPatients.queryOptions({
		input: id,
		staleTime: STALE.staffDetail,
	});

export const staffWithEncountersQueryOptions = (id: string) =>
	orpc.staff.getWithEncounters.queryOptions({
		input: id,
		staleTime: STALE.staffDetail,
	});

export const staffWithPrescriptionsQueryOptions = (id: string) =>
	orpc.staff.getWithPrescriptions.queryOptions({
		input: id,
		staleTime: STALE.staffDetail,
	});

export const staffStatsQueryOptions = () =>
	orpc.staff.getStats.queryOptions({
		staleTime: STALE.statsAndCounts,
	});

export const staffCountQueryOptions = (
	params: { role?: Role; isActive?: boolean } = {}
) =>
	orpc.staff.getCount.queryOptions({
		input: params,
		staleTime: STALE.statsAndCounts,
	});

// ===========================================================================
// Dashboard  →  server namespace is `dashboard` ✅ but input shapes differ
//
// The server derives `providerId` from the session; it is NOT an input.
// The only input the server accepts is `cacheBust` (for `getStats`) and
// the various pagination/date fields.
// ===========================================================================
export const dashboardStatsLiteQueryOptions = () =>
	orpc.dashboard.getStatsLite.queryOptions({
		staleTime: STALE.dashboardStats,
	});

export const dashboardStatsQueryOptions = (cacheBust = false) =>
	orpc.dashboard.getStats.queryOptions({
		input: { cacheBust },
		staleTime: STALE.dashboardStats,
	});

export const dashboardTodayScheduleQueryOptions = (
	params: { date?: Date; includeCompleted?: boolean; limit?: number } = {}
) =>
	orpc.dashboard.getTodaySchedule.queryOptions({
		input: {
			date: params.date ?? new Date(),
			includeCompleted: params.includeCompleted ?? false,
			limit: params.limit ?? 20,
		},
		staleTime: STALE.dashboardStats,
	});

export const dashboardRecentActivityQueryOptions = (
	params: { limit?: number; offset?: number } = {}
) =>
	orpc.dashboard.getRecentActivity.queryOptions({
		input: { limit: params.limit ?? 10, offset: params.offset ?? 0 },
		staleTime: STALE.dashboardStats,
	});

export const dashboardAlertsQueryOptions = (
	params: {
		limit?: number;
		severity?: "info" | "warning" | "critical";
		includeResolved?: boolean;
	} = {}
) =>
	orpc.dashboard.getAlerts.queryOptions({
		input: {
			limit: params.limit ?? 10,
			severity: params.severity,
			includeResolved: params.includeResolved ?? false,
		},
		staleTime: STALE.dashboardStats,
	});

export const dashboardQueryOptions = (
	params: {
		date?: Date;
		includeAlerts?: boolean;
		includeActivity?: boolean;
		includeSchedule?: boolean;
	} = {}
) =>
	orpc.dashboard.getDashboard.queryOptions({
		input: {
			date: params.date ?? new Date(),
			includeAlerts: params.includeAlerts ?? true,
			includeActivity: params.includeActivity ?? true,
			includeSchedule: params.includeSchedule ?? true,
		},
		staleTime: STALE.dashboardStats,
	});

export const dashboardSummaryQueryOptions = (cacheBust = false) =>
	orpc.dashboard.getSummary.queryOptions({
		input: { cacheBust },
		staleTime: STALE.dashboardStats,
	});
