import {
	appointmentSchema,
	auditLogInsertSchema,
	auditLogSelectSchema,
	auditLogUpdateSchema,
	clinicInsertSchema,
	clinicSelectSchema,
	clinicUpdateSchema,
	encounterInsertSchema,
	encounterSchema,
	encounterSelectSchema,
	encounterUpdateSchema,
	growthMeasurementInsertSchema,
	growthMeasurementSelectSchema,
	growthMeasurementUpdateSchema,
	guardianInsertSchema,
	guardianSelectSchema,
	guardianUpdateSchema,
	immunizationInsertSchema,
	immunizationSelectSchema,
	immunizationUpdateSchema,
	labOrderInsertSchema,
	labOrderSelectSchema,
	labOrderUpdateSchema,
	labTestSchema,
	patientAllergyInsertSchema,
	patientAllergyJsonSchema,
	patientAllergySelectSchema,
	patientAllergyUpdateSchema,
	patientChronicConditionInsertSchema,
	patientChronicConditionSelectSchema,
	patientChronicConditionUpdateSchema,
	patientInsertSchema,
	patientSelectSchema,
	patientUpdateSchema,
	prescriptionInsertSchema,
	prescriptionItemSchema,
	prescriptionSelectSchema,
	prescriptionUpdateSchema,
	staffInsertSchema,
	staffSelectSchema,
	staffUpdateSchema,
	vitalInsertSchema,
	vitalSelectSchema,
	vitalUpdateSchema,
	whoGrowthDataInsertSchema,
	whoGrowthDataSelectSchema,
	whoGrowthDataUpdateSchema,
} from "@smart/db/zod";
/**
 * OpenAPI schema names kept for compatibility.
 *
 * Database and domain validation lives in src/db/zod. This module only
 * exposes the public names consumed by the OpenAPI generator.
 */
import { z } from "zod/v4";

export const TimestampSchema = z.object({
	createdAt: z.date(),
	updatedAt: z.date(),
});
export const IdSchema = z.object({ id: z.string().min(1) });

export const ClinicSchema = clinicSelectSchema;
export const ClinicInsertSchema = clinicInsertSchema;
export const ClinicUpdateSchema = clinicUpdateSchema;
export const StaffSchema = staffSelectSchema;
export const StaffInsertSchema = staffInsertSchema;
export const StaffUpdateSchema = staffUpdateSchema;
export const PatientAllergyJsonSchema = patientAllergyJsonSchema;
export const PatientSchema = patientSelectSchema;
export const PatientInsertSchema = patientInsertSchema;
export const PatientUpdateSchema = patientUpdateSchema;
export const GuardianSchema = guardianSelectSchema;
export const GuardianInsertSchema = guardianInsertSchema;
export const GuardianUpdateSchema = guardianUpdateSchema;
export const PatientAllergySchema = patientAllergySelectSchema;
export const PatientAllergyInsertSchema = patientAllergyInsertSchema;
export const PatientAllergyUpdateSchema = patientAllergyUpdateSchema;
export const PatientChronicConditionSchema =
	patientChronicConditionSelectSchema;
export const PatientChronicConditionInsertSchema =
	patientChronicConditionInsertSchema;
export const PatientChronicConditionUpdateSchema =
	patientChronicConditionUpdateSchema;
export const SubjectiveJsonSchema = encounterSchema.shape.subjectiveJson;
export const ObjectiveJsonSchema = encounterSchema.shape.objectiveJson;
export const AssessmentJsonSchema = encounterSchema.shape.assessmentJson;
export const PlanJsonSchema = encounterSchema.shape.planJson;
export const EncounterSchema = encounterSelectSchema;
export const EncounterInsertSchema = encounterInsertSchema;
export const EncounterUpdateSchema = encounterUpdateSchema;
export const VitalsSchema = vitalSelectSchema;
export const VitalsInsertSchema = vitalInsertSchema;
export const VitalsUpdateSchema = vitalUpdateSchema;
export const GrowthMeasurementSchema = growthMeasurementSelectSchema;
export const GrowthMeasurementInsertSchema = growthMeasurementInsertSchema;
export const GrowthMeasurementUpdateSchema = growthMeasurementUpdateSchema;
export const ImmunizationSchema = immunizationSelectSchema;
export const ImmunizationInsertSchema = immunizationInsertSchema;
export const ImmunizationUpdateSchema = immunizationUpdateSchema;
export const PrescriptionItemSchema = prescriptionItemSchema;
export const PrescriptionSchema = prescriptionSelectSchema;
export const PrescriptionInsertSchema = prescriptionInsertSchema;
export const PrescriptionUpdateSchema = prescriptionUpdateSchema;
export const AppointmentSchema = appointmentSchema;
export const AppointmentInsertSchema = appointmentSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const AppointmentUpdateSchema = appointmentSchema.partial();
export const LabTestSchema = labTestSchema;
export const LabOrderSchema = labOrderSelectSchema;
export const LabOrderInsertSchema = labOrderInsertSchema;
export const LabOrderUpdateSchema = labOrderUpdateSchema;
export const AuditLogSchema = auditLogSelectSchema;
export const AuditLogInsertSchema = auditLogInsertSchema;
export const AuditLogUpdateSchema = auditLogUpdateSchema;
export const WHOGrowthDataSchema = whoGrowthDataSelectSchema;
export const WHOGrowthDataInsertSchema = whoGrowthDataInsertSchema;
export const WHOGrowthDataUpdateSchema = whoGrowthDataUpdateSchema;

// No medical_records table exists in the Drizzle schema yet. Keep the public
// OpenAPI names as a small compatibility contract until that table is added.
export const MedicalRecordSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	encounterId: z.string().nullable().optional(),
	title: z.string(),
	description: z.string().nullable().optional(),
	fileUrl: z.string(),
	fileName: z.string(),
	fileMimeType: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
export const MedicalRecordInsertSchema = MedicalRecordSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const MedicalRecordUpdateSchema = MedicalRecordSchema.partial();

export const clinicSchemas = {
	TimestampSchema,
	IdSchema,
	ClinicSchema,
	ClinicInsertSchema,
	ClinicUpdateSchema,
	StaffSchema,
	StaffInsertSchema,
	StaffUpdateSchema,
	PatientSchema,
	PatientInsertSchema,
	PatientUpdateSchema,
	GuardianSchema,
	GuardianInsertSchema,
	GuardianUpdateSchema,
	PatientAllergySchema,
	PatientAllergyInsertSchema,
	PatientAllergyUpdateSchema,
	PatientChronicConditionSchema,
	PatientChronicConditionInsertSchema,
	PatientChronicConditionUpdateSchema,
	EncounterSchema,
	EncounterInsertSchema,
	EncounterUpdateSchema,
	VitalsSchema,
	VitalsInsertSchema,
	VitalsUpdateSchema,
	GrowthMeasurementSchema,
	GrowthMeasurementInsertSchema,
	GrowthMeasurementUpdateSchema,
	ImmunizationSchema,
	ImmunizationInsertSchema,
	ImmunizationUpdateSchema,
	PrescriptionSchema,
	PrescriptionInsertSchema,
	PrescriptionUpdateSchema,
	AppointmentSchema,
	AppointmentInsertSchema,
	AppointmentUpdateSchema,
	LabOrderSchema,
	LabOrderInsertSchema,
	LabOrderUpdateSchema,
	AuditLogSchema,
	AuditLogInsertSchema,
	AuditLogUpdateSchema,
	WHOGrowthDataSchema,
	WHOGrowthDataInsertSchema,
	WHOGrowthDataUpdateSchema,
	MedicalRecordSchema,
	MedicalRecordInsertSchema,
	MedicalRecordUpdateSchema,
};

export type Clinic = z.infer<typeof ClinicSchema>;
export type ClinicInsert = z.infer<typeof ClinicInsertSchema>;
export type ClinicUpdate = z.infer<typeof ClinicUpdateSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type StaffInsert = z.infer<typeof StaffInsertSchema>;
export type StaffUpdate = z.infer<typeof StaffUpdateSchema>;
export type Patient = z.infer<typeof PatientSchema>;
export type PatientInsert = z.infer<typeof PatientInsertSchema>;
export type PatientUpdate = z.infer<typeof PatientUpdateSchema>;
export type Guardian = z.infer<typeof GuardianSchema>;
export type GuardianInsert = z.infer<typeof GuardianInsertSchema>;
export type GuardianUpdate = z.infer<typeof GuardianUpdateSchema>;
export type PatientAllergy = z.infer<typeof PatientAllergySchema>;
export type PatientAllergyInsert = z.infer<typeof PatientAllergyInsertSchema>;
export type PatientAllergyUpdate = z.infer<typeof PatientAllergyUpdateSchema>;
export type PatientChronicCondition = z.infer<
	typeof PatientChronicConditionSchema
>;
export type PatientChronicConditionInsert = z.infer<
	typeof PatientChronicConditionInsertSchema
>;
export type PatientChronicConditionUpdate = z.infer<
	typeof PatientChronicConditionUpdateSchema
>;
export type Encounter = z.infer<typeof EncounterSchema>;
export type EncounterInsert = z.infer<typeof EncounterInsertSchema>;
export type EncounterUpdate = z.infer<typeof EncounterUpdateSchema>;
export type Vitals = z.infer<typeof VitalsSchema>;
export type VitalsInsert = z.infer<typeof VitalsInsertSchema>;
export type VitalsUpdate = z.infer<typeof VitalsUpdateSchema>;
export type GrowthMeasurement = z.infer<typeof GrowthMeasurementSchema>;
export type GrowthMeasurementInsert = z.infer<
	typeof GrowthMeasurementInsertSchema
>;
export type GrowthMeasurementUpdate = z.infer<
	typeof GrowthMeasurementUpdateSchema
>;
export type Immunization = z.infer<typeof ImmunizationSchema>;
export type ImmunizationInsert = z.infer<typeof ImmunizationInsertSchema>;
export type ImmunizationUpdate = z.infer<typeof ImmunizationUpdateSchema>;
export type Prescription = z.infer<typeof PrescriptionSchema>;
export type PrescriptionInsert = z.infer<typeof PrescriptionInsertSchema>;
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdateSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type AppointmentInsert = z.infer<typeof AppointmentInsertSchema>;
export type AppointmentUpdate = z.infer<typeof AppointmentUpdateSchema>;
export type LabOrder = z.infer<typeof LabOrderSchema>;
export type LabOrderInsert = z.infer<typeof LabOrderInsertSchema>;
export type LabOrderUpdate = z.infer<typeof LabOrderUpdateSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogInsert = z.infer<typeof AuditLogInsertSchema>;
export type AuditLogUpdate = z.infer<typeof AuditLogUpdateSchema>;
export type WHOGrowthData = z.infer<typeof WHOGrowthDataSchema>;
export type WHOGrowthDataInsert = z.infer<typeof WHOGrowthDataInsertSchema>;
export type WHOGrowthDataUpdate = z.infer<typeof WHOGrowthDataUpdateSchema>;
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export type MedicalRecordInsert = z.infer<typeof MedicalRecordInsertSchema>;
export type MedicalRecordUpdate = z.infer<typeof MedicalRecordUpdateSchema>;
export type PatientAllergyJson = z.infer<typeof PatientAllergyJsonSchema>;
export type SubjectiveJson = z.infer<typeof SubjectiveJsonSchema>;
export type ObjectiveJson = z.infer<typeof ObjectiveJsonSchema>;
export type AssessmentJson = z.infer<typeof AssessmentJsonSchema>;
export type PlanJson = z.infer<typeof PlanJsonSchema>;
export type PrescriptionItem = z.infer<typeof PrescriptionItemSchema>;
export type LabTest = z.infer<typeof LabTestSchema>;
