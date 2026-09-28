// ============================================================
// TYPE EXPORTS

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
	activeStatusEnum,
	appointmentStatusEnum,
	appointments,
	auditActionEnum,
	auditEntityEnum,
	auditLogs,
	bloodGroupEnum,
	clinics,
	encounterStatusEnum,
	encounters,
	genderEnum,
	growthMeasurements,
	guardians,
	immunizationStatusEnum,
	immunizations,
	labOrders,
	labPriorityEnum,
	labStatusEnum,
	MEDICAL_RECORD_STATUSES,
	MEDICAL_RECORD_TYPES,
	medicalRecords,
	metricTypeEnum,
	patientAllergies,
	patientChronicConditions,
	patients,
	prescriptionStatusEnum,
	prescriptions,
	roleEnum,
	staff,
	visitTypeEnum,
	vitals,
	whoGrowthData,
} from "./";
import type { account, session, twoFactor, user, verification } from "./auth";

// ============================================================
export type WHOGrowthData = InferSelectModel<typeof whoGrowthData>;
export type NewWHOGrowthData = InferInsertModel<typeof whoGrowthData>;

export type Clinic = InferSelectModel<typeof clinics>;
export type NewClinic = InferInsertModel<typeof clinics>;
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
export type Staff = InferSelectModel<typeof staff>;
export type NewStaff = InferInsertModel<typeof staff>;
export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;
export type Guardian = InferSelectModel<typeof guardians>;
export type NewGuardian = InferInsertModel<typeof guardians>;
export type PatientAllergy = InferSelectModel<typeof patientAllergies>;
export type NewPatientAllergy = InferInsertModel<typeof patientAllergies>;
export type ChronicCondition = InferSelectModel<
	typeof patientChronicConditions
>;
export type NewChronicCondition = InferInsertModel<
	typeof patientChronicConditions
>;
export type MedicalRecord = InferSelectModel<typeof medicalRecords>;
export type NewMedicalRecord = InferInsertModel<typeof medicalRecords>;

export type Role = (typeof roleEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
export type BloodGroup = (typeof bloodGroupEnum.enumValues)[number];
export type AppointmentStatus =
	(typeof appointmentStatusEnum.enumValues)[number];
export type ActiveStatus = (typeof activeStatusEnum.enumValues)[number];
export type VisitType = (typeof visitTypeEnum.enumValues)[number];
export type MetricType = (typeof metricTypeEnum.enumValues)[number];
export type EncounterStatus = (typeof encounterStatusEnum.enumValues)[number];
export type ImmunizationStatus =
	(typeof immunizationStatusEnum.enumValues)[number];
export type PrescriptionStatus =
	(typeof prescriptionStatusEnum.enumValues)[number];
export type LabStatus = (typeof labStatusEnum.enumValues)[number];
export type LabPriority = (typeof labPriorityEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type AuditEntity = (typeof auditEntityEnum.enumValues)[number];
export type MedicalRecordType = (typeof MEDICAL_RECORD_TYPES)[number];
export type MedicalRecordStatus = (typeof MEDICAL_RECORD_STATUSES)[number];

export type Encounter = InferSelectModel<typeof encounters>;
export type NewEncounter = InferInsertModel<typeof encounters>;
export type VitalSigns = InferSelectModel<typeof vitals>;
export type NewVitalSigns = InferInsertModel<typeof vitals>;
export type GrowthMeasurement = InferSelectModel<typeof growthMeasurements>;
export type NewGrowthMeasurement = InferInsertModel<typeof growthMeasurements>;
export type Immunization = InferSelectModel<typeof immunizations>;
export type NewImmunization = InferInsertModel<typeof immunizations>;
export type Prescription = InferSelectModel<typeof prescriptions>;
export type NewPrescription = InferInsertModel<typeof prescriptions>;
export type LabOrder = InferSelectModel<typeof labOrders>;
export type NewLabOrder = InferInsertModel<typeof labOrders>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
export type Appointment = InferSelectModel<typeof appointments>;
export type NewAppointment = InferInsertModel<typeof appointments>;

type PatientCreateData = Omit<NewPatient, "id" | "createdAt" | "updatedAt">;
export type PatientUpdateData = Partial<PatientCreateData>;

export type StaffCreateData = Omit<NewStaff, "id" | "createdAt" | "updatedAt">;
export type StaffUpdateData = Partial<StaffCreateData>;

export type GuardianCreateData = Omit<
	NewGuardian,
	"id" | "createdAt" | "updatedAt"
>;
export type GuardianUpdateData = Partial<GuardianCreateData>;

export type EncounterCreateData = Omit<
	NewEncounter,
	"id" | "createdAt" | "updatedAt"
>;
export type EncounterUpdateData = Partial<EncounterCreateData>;

export type VitalCreateData = Omit<
	NewVitalSigns,
	"id" | "createdAt" | "updatedAt"
>;
export type VitalUpdateData = Partial<VitalCreateData>;

export type GrowthCreateData = Omit<
	NewGrowthMeasurement,
	"id" | "createdAt" | "updatedAt"
>;
export type GrowthUpdateData = Partial<GrowthCreateData>;

export type ImmunizationCreateData = Omit<
	NewImmunization,
	"id" | "createdAt" | "updatedAt"
>;
export type ImmunizationUpdateData = Partial<ImmunizationCreateData>;

export type PrescriptionCreateData = Omit<
	NewPrescription,
	"id" | "createdAt" | "updatedAt"
>;
export type PrescriptionUpdateData = Partial<PrescriptionCreateData>;

export type LabOrderCreateData = Omit<
	NewLabOrder,
	"id" | "createdAt" | "updatedAt"
>;
export type LabOrderUpdateData = Partial<LabOrderCreateData>;

export type AppointmentCreateData = Omit<
	NewAppointment,
	"id" | "createdAt" | "updatedAt"
>;
export type AppointmentUpdateData = Partial<AppointmentCreateData>;

export type AuditLogCreateData = Omit<NewAuditLog, "id">;

export type AllergyCreateData = Omit<
	NewPatientAllergy,
	"id" | "createdAt" | "updatedAt"
>;
export type AllergyUpdateData = Partial<AllergyCreateData>;

export type ChronicConditionCreateData = Omit<
	NewChronicCondition,
	"id" | "createdAt" | "updatedAt"
>;
export type ChronicConditionUpdateData = Partial<ChronicConditionCreateData>;

export type MedicalRecordCreateData = Omit<
	NewMedicalRecord,
	"id" | "createdAt" | "updatedAt"
>;
export type MedicalRecordUpdateData = Partial<MedicalRecordCreateData>;

export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;
export type NewSession = InferInsertModel<typeof session>;
export type NewTwoFactor = InferInsertModel<typeof twoFactor>;
export type TwoFactor = InferSelectModel<typeof twoFactor>;
export type Session = InferSelectModel<typeof session>;
export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;
export type AppointmentWithPatient = Appointment & {
	patient?: Partial<Patient>;
	staff?: Partial<Staff>;
};
export type AppointmentWithRelations = Appointment & {
	patient: Patient;
	staff: Staff;
	clinic?: Clinic;
};

export interface PatientSummary {
	dateOfBirth: string;
	firstName: string;
	gender: "male" | "female";
	id: string;
	lastName: string;
	mrn: string;
}

/**
 * Discriminated union of the projection modes accepted by `$getAllPatients`.
 * `"summary"` returns `PatientSummary[]`, `"full"` (default) returns the
 * existing `PatientWithPrimaryGuardian[]` shape.
 */
export type PatientProjection = "summary" | "full";

export interface PatientLookupParams {
	activeStatus?: "Active" | "Inactive" | "Archived";
	limit?: number;
	offset?: number;
	projection?: PatientProjection;
}

export type PatientActivityStatus =
	| "scheduled"
	| "checked-in"
	| "in-progress"
	| "completed"
	| "cancelled"
	| "no-show";

export type PatientActivityRow = {
	id: string;
	patientId: string;
	patientName: string;
	mrn: string;
	avatarUrl: string | null;
	visitType: string;
	providerName: string | null;
	scheduledAt: Date;
	amount: number;
	status: PatientActivityStatus;
	paidBy: "insurance" | "cash";
};

export type FindTodayActivityParams = {
	clinicId: string;
	/** Override "today" — useful for tests and date pickers. */
	date?: Date;
	limit?: number;
	offset?: number;
};
export const VISIT_TYPE_FEES: Record<string, number> = {
	"Well-Child Check": 150,
	"Sick Visit": 220,
	"Follow-Up": 95,
	"Immunization Visit": 85.5,
	Consultation: 200,
	"Lactation Consultation": 120,
	"Emergency/Urgent": 450,
	Telehealth: 75,
	Other: 100,
};

export interface Alert {
	actionUrl?: string;
	id: string;
	isResolved?: boolean;
	message: string;
	patientId: string;
	patientName: string;
	severity: "info" | "warning" | "critical";
	timestamp: Date;
	type:
		| "overdue_vaccination"
		| "abnormal_growth"
		| "missed_appointment"
		| "lab_result"
		| "medication_refill";
}
export interface DashboardStats {
	activePatients: number;
	appointmentsThisWeek: number;
	completionRate: number;
	pendingFollowUps: number;
	todayAppointments: number;
	totalPatients: number;
	upcomingVaccinations: number;
}

export interface TodaySchedule {
	id: string;
	isOverdue: boolean;
	isUrgent?: boolean;
	notes?: string;
	patientDateOfBirth?: string;
	patientId: string;
	patientName: string;
	status: AppointmentStatus;
	time: string;
	type: string;
}

export interface ActivityItem {
	description: string;
	id: string;
	isUrgent: boolean;
	metadata?: Record<string, unknown>;
	patientId: string;
	patientName: string;
	timestamp: Date;
	type:
		| "visit"
		| "appointment"
		| "vaccination"
		| "lab_result"
		| "alert"
		| "prescription";
}

export interface DashboardData {
	alerts: Alert[];
	lastUpdated: Date;
	recentActivity: ActivityItem[];
	stats: DashboardStats;
	todaySchedule: TodaySchedule[];
}
export function statusToActivityStatus(
	status: string | null
): PatientActivityStatus {
	switch (status) {
		case "Checked In":
			return "checked-in";
		case "In Progress":
			return "in-progress";
		case "Completed":
			return "completed";
		case "Cancelled":
			return "cancelled";
		case "No Show":
			return "no-show";
		default:
			return "scheduled";
	}
}

export function feeForVisitType(type: string): number {
	return VISIT_TYPE_FEES[type] ?? 100;
}
