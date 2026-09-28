CREATE TYPE "active_status" AS ENUM('Active', 'Inactive', 'Archived');--> statement-breakpoint
CREATE TYPE "allergy_category" AS ENUM('Medication', 'Food', 'Environmental', 'Other');--> statement-breakpoint
CREATE TYPE "allergy_severity" AS ENUM('Mild', 'Moderate', 'Severe', 'Anaphylactic');--> statement-breakpoint
CREATE TYPE "allergy_status" AS ENUM('Active', 'Resolved', 'Inactive');--> statement-breakpoint
CREATE TYPE "appointment_status" AS ENUM('Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show');--> statement-breakpoint
CREATE TYPE "audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'RESTORE');--> statement-breakpoint
CREATE TYPE "audit_entity" AS ENUM('PATIENT', 'ENCOUNTER', 'IMMUNIZATION', 'PRESCRIPTION', 'LAB', 'DATABASE');--> statement-breakpoint
CREATE TYPE "blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown');--> statement-breakpoint
CREATE TYPE "condition_status" AS ENUM('Active', 'Resolved', 'In Remission');--> statement-breakpoint
CREATE TYPE "delivery_method" AS ENUM('Vaginal', 'Cesarean', 'Assisted');--> statement-breakpoint
CREATE TYPE "encounter_status" AS ENUM('Draft', 'Completed', 'Signed', 'Amended');--> statement-breakpoint
CREATE TYPE "gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "immunization_status" AS ENUM('Administered', 'Due', 'Overdue', 'Upcoming', 'Deferred', 'Refused');--> statement-breakpoint
CREATE TYPE "lab_priority" AS ENUM('Routine', 'Urgent', 'Stat');--> statement-breakpoint
CREATE TYPE "lab_status" AS ENUM('Ordered', 'Sample Collected', 'Processing', 'Completed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "medical_record_status" AS ENUM('Active', 'Archived', 'Superseded');--> statement-breakpoint
CREATE TYPE "medical_record_type" AS ENUM('Lab Report', 'Imaging', 'Referral', 'Discharge Summary', 'Consent Form', 'Insurance', 'Operative Report', 'Pathology', 'External Record', 'Other');--> statement-breakpoint
CREATE TYPE "metric_type" AS ENUM('weight', 'height', 'head_circumference', 'bmi');--> statement-breakpoint
CREATE TYPE "prescription_status" AS ENUM('Active', 'Completed', 'Discontinued', 'Cancelled');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('admin', 'doctor', 'staff', 'patient');--> statement-breakpoint
CREATE TYPE "visit_type" AS ENUM('Well-Child Check', 'Sick Visit', 'Follow-Up', 'Immunization Visit', 'Consultation', 'Lactation Consultation', 'Emergency/Urgent', 'Telehealth', 'Other');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"staff_id" text NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone DEFAULT now() NOT NULL,
	"appointment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"type" text NOT NULL,
	"notes" text,
	"clinic_id" text,
	"priority" text DEFAULT 'Normal',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"staff_id" text NOT NULL,
	"staff_name" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"details" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"before_state" jsonb,
	"after_state" jsonb
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"website" text,
	"logo" text,
	"timezone" text DEFAULT 'UTC',
	"currency" text DEFAULT 'USD',
	"active" boolean DEFAULT true NOT NULL,
	"settings" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounters" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"provider_name" text NOT NULL,
	"encounter_date" timestamp with time zone NOT NULL,
	"visit_type" text NOT NULL,
	"chief_complaint" text NOT NULL,
	"subjective_json" json NOT NULL,
	"objective_json" json NOT NULL,
	"assessment_json" json NOT NULL,
	"plan_json" json NOT NULL,
	"status" text DEFAULT 'Completed' NOT NULL,
	"signed_at" timestamp with time zone,
	"signed_by" text,
	"duration_minutes" integer,
	"follow_up_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growth_measurements" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"encounter_id" text,
	"recorded_at" timestamp with time zone NOT NULL,
	"age_months" real NOT NULL,
	"age_days" integer,
	"weight_kg" real NOT NULL,
	"height_cm" real NOT NULL,
	"head_circ_cm" real,
	"bmi" real NOT NULL,
	"weight_for_age_zscore" real,
	"weight_for_age_percentile" real,
	"height_for_age_zscore" real,
	"height_for_age_percentile" real,
	"bmi_for_age_zscore" real,
	"bmi_for_age_percentile" real,
	"head_circ_zscore" real,
	"head_circ_percentile" real,
	"weight_velocity" real,
	"height_velocity" real,
	"recorded_by" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"name" text NOT NULL,
	"user_id" text,
	"relationship" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"is_primary" boolean DEFAULT true NOT NULL,
	"emergency_contact" boolean DEFAULT true NOT NULL,
	"contact_order" integer DEFAULT 1,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "immunizations" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"vaccine_code" text NOT NULL,
	"vaccine_name" text NOT NULL,
	"target_disease" text NOT NULL,
	"dose_number" integer NOT NULL,
	"total_doses" integer,
	"recommended_age_label" text NOT NULL,
	"recommended_age_months" real NOT NULL,
	"due_date" text NOT NULL,
	"administered_date" text,
	"status" text DEFAULT 'Due' NOT NULL,
	"manufacturer" text,
	"brand_name" text,
	"batch_number" text,
	"expiry_date" text,
	"administration_site" text,
	"administration_route" text,
	"administered_by" text,
	"adverse_reactions" text,
	"parent_consent" boolean DEFAULT false,
	"consent_form_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_orders" (
	"id" text PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"patient_id" text NOT NULL,
	"encounter_id" text,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"ordered_by" text NOT NULL,
	"clinical_indication" text NOT NULL,
	"tests_json" json NOT NULL,
	"status" text DEFAULT 'Ordered' NOT NULL,
	"priority" text DEFAULT 'Routine' NOT NULL,
	"completed_date" timestamp with time zone,
	"specimen_collection_notes" text,
	"specimen_type" text,
	"specimen_collected_at" timestamp with time zone,
	"results_released_at" timestamp with time zone,
	"notes" text,
	"instructions" text,
	"results" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"encounter_id" text,
	"uploaded_by" text NOT NULL,
	"record_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_mime_type" text NOT NULL,
	"file_size_bytes" integer,
	"external_id" text,
	"external_system" text,
	"document_date" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"tags" text[] DEFAULT '{}'::text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "organization_role" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"role" text NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "patient_allergies" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"allergen" text NOT NULL,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"reaction" text NOT NULL,
	"identified_date" text,
	"onset_date" text,
	"resolution_date" text,
	"status" text DEFAULT 'Active',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patient_chronic_conditions" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"condition" text NOT NULL,
	"icd_code" text,
	"diagnosed_date" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"severity" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY,
	"mrn" text NOT NULL UNIQUE,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"gender" text NOT NULL,
	"blood_group" text DEFAULT 'Unknown' NOT NULL,
	"gestation_weeks_at_birth" real DEFAULT 40,
	"birth_weight_kg" real,
	"birth_length_cm" real,
	"contact_number" text,
	"birth_head_circ_cm" real,
	"delivery_method" text,
	"preferred_language" text DEFAULT 'English',
	"active_status" text DEFAULT 'Active' NOT NULL,
	"notes" text,
	"user_id" text NOT NULL,
	"allergies" jsonb DEFAULT '[]',
	"pediatrician_id" text,
	"clinic_id" text,
	"email" text UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" text PRIMARY KEY,
	"rx_number" text NOT NULL UNIQUE,
	"patient_id" text NOT NULL,
	"encounter_id" text,
	"prescribed_date" text NOT NULL,
	"prescriber_id" text NOT NULL,
	"prescriber_name" text NOT NULL,
	"prescriber_license" text NOT NULL,
	"patient_weight_kg" real NOT NULL,
	"diagnosis" text,
	"prescription_items" json NOT NULL,
	"notes" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"filled_at" timestamp with time zone,
	"filled_by" text,
	"discontinued_at" timestamp with time zone,
	"discontinued_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"role" text NOT NULL,
	"license_number" text NOT NULL,
	"avatar_color" text NOT NULL,
	"pin_hash" text NOT NULL,
	"clinicId" text,
	"phone" varchar(32),
	"bio" text,
	"user_id" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"specialty" text DEFAULT 'General Pediatrics',
	"department" text DEFAULT 'General',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"layers" jsonb NOT NULL,
	"variables" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true,
	"failed_verification_count" integer DEFAULT 0,
	"locked_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"two_factor_enabled" boolean DEFAULT false,
	"clinic_id" text,
	"api_key" text,
	"address" text,
	"phone" text
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vitals" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"encounter_id" text,
	"recorded_at" timestamp with time zone NOT NULL,
	"temperature_c" real NOT NULL,
	"temperature_method" text DEFAULT 'Axillary',
	"heart_rate_bpm" integer NOT NULL,
	"respiratory_rate_bpm" integer NOT NULL,
	"systolic_bp" integer,
	"diastolic_bp" integer,
	"mean_arterial_pressure" integer,
	"oxygen_saturation_percent" integer NOT NULL,
	"pain_score" integer DEFAULT 0,
	"pain_scale_type" text DEFAULT 'Wong-Baker',
	"weight_kg" real,
	"height_cm" real,
	"head_circumference_cm" real,
	"bmi" real,
	"notes" text,
	"recorded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "who_growth_data" (
	"id" text PRIMARY KEY,
	"gender" text NOT NULL,
	"metric_type" text NOT NULL,
	"age_days" integer,
	"age_months" real NOT NULL,
	"l_value" real NOT NULL,
	"m_value" real NOT NULL,
	"s_value" real NOT NULL,
	"sd_4neg" real,
	"sd_3neg" real,
	"sd_2neg" real,
	"sd_1neg" real,
	"sd_0" real,
	"sd_1" real,
	"sd_2" real,
	"sd_3" real,
	"sd_4" real,
	"data_source" text DEFAULT 'WHO',
	"version" text DEFAULT '2006',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_staff_time" ON "appointments" ("staff_id","start_time");--> statement-breakpoint
CREATE INDEX "idx_appointments_patient_time" ON "appointments" ("patient_id","start_time");--> statement-breakpoint
CREATE INDEX "idx_appointments_status" ON "appointments" ("status");--> statement-breakpoint
CREATE INDEX "appointment_patient_status_idx" ON "appointments" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "appointment_provider_date_status_idx" ON "appointments" ("staff_id","appointment_date","status");--> statement-breakpoint
CREATE INDEX "idx_audit_entity_id_timestamp" ON "audit_logs" ("entity","entity_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_audit_staff_timestamp" ON "audit_logs" ("staff_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_logs" ("action");--> statement-breakpoint
CREATE INDEX "idx_clinics_name" ON "clinics" ("name");--> statement-breakpoint
CREATE INDEX "idx_clinics_active" ON "clinics" ("active");--> statement-breakpoint
CREATE INDEX "idx_encounters_patient_date" ON "encounters" ("patient_id","encounter_date");--> statement-breakpoint
CREATE INDEX "idx_encounters_provider_date" ON "encounters" ("provider_id","encounter_date");--> statement-breakpoint
CREATE INDEX "idx_encounters_type" ON "encounters" ("visit_type");--> statement-breakpoint
CREATE INDEX "idx_encounters_status" ON "encounters" ("status");--> statement-breakpoint
CREATE INDEX "idx_growth_patient_age" ON "growth_measurements" ("patient_id","age_months");--> statement-breakpoint
CREATE INDEX "idx_growth_encounter" ON "growth_measurements" ("encounter_id");--> statement-breakpoint
CREATE INDEX "idx_guardians_patient_primary" ON "guardians" ("patient_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_guardians_user_id" ON "guardians" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_immunizations_patient_status" ON "immunizations" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "idx_immunizations_due_date" ON "immunizations" ("due_date");--> statement-breakpoint
CREATE INDEX "idx_immunizations_vaccine_code" ON "immunizations" ("vaccine_code");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" ("email");--> statement-breakpoint
CREATE INDEX "idx_lab_orders_patient_status" ON "lab_orders" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "idx_lab_orders_priority_status" ON "lab_orders" ("priority","status");--> statement-breakpoint
CREATE INDEX "idx_lab_orders_encounter" ON "lab_orders" ("encounter_id");--> statement-breakpoint
CREATE INDEX "idx_medical_records_patient_type" ON "medical_records" ("patient_id","record_type");--> statement-breakpoint
CREATE INDEX "idx_medical_records_patient_status" ON "medical_records" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "idx_medical_records_encounter" ON "medical_records" ("encounter_id");--> statement-breakpoint
CREATE INDEX "idx_medical_records_external" ON "medical_records" ("external_system","external_id");--> statement-breakpoint
CREATE INDEX "idx_medical_records_uploaded_by" ON "medical_records" ("uploaded_by");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" ("slug");--> statement-breakpoint
CREATE INDEX "organizationRole_organizationId_idx" ON "organization_role" ("organization_id");--> statement-breakpoint
CREATE INDEX "organizationRole_role_idx" ON "organization_role" ("role");--> statement-breakpoint
CREATE INDEX "idx_allergies_patient_status" ON "patient_allergies" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "idx_allergies_category" ON "patient_allergies" ("category");--> statement-breakpoint
CREATE INDEX "idx_allergies_severity" ON "patient_allergies" ("severity");--> statement-breakpoint
CREATE INDEX "idx_conditions_patient_status" ON "patient_chronic_conditions" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "idx_conditions_icd" ON "patient_chronic_conditions" ("icd_code");--> statement-breakpoint
CREATE INDEX "idx_patients_mrn" ON "patients" ("mrn");--> statement-breakpoint
CREATE INDEX "idx_patients_active_name" ON "patients" ("active_status","last_name","first_name");--> statement-breakpoint
CREATE INDEX "idx_patients_dob" ON "patients" ("date_of_birth");--> statement-breakpoint
CREATE INDEX "idx_patients_pediatrician_active" ON "patients" ("pediatrician_id","active_status");--> statement-breakpoint
CREATE INDEX "idx_patients_user_id" ON "patients" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_patients_clinic_id" ON "patients" ("clinic_id");--> statement-breakpoint
CREATE INDEX "payments_patient_idx" ON "payments" ("patient_id");--> statement-breakpoint
CREATE INDEX "payments_paid_at_idx" ON "payments" ("paid_at");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" ("status");--> statement-breakpoint
CREATE INDEX "idx_prescriptions_patient_status" ON "prescriptions" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "idx_prescriptions_prescriber" ON "prescriptions" ("prescriber_id");--> statement-breakpoint
CREATE INDEX "idx_prescriptions_rx_number" ON "prescriptions" ("rx_number");--> statement-breakpoint
CREATE INDEX "idx_prescriptions_encounter" ON "prescriptions" ("encounter_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_staff_email" ON "staff" ("email");--> statement-breakpoint
CREATE INDEX "idx_staff_role" ON "staff" ("role");--> statement-breakpoint
CREATE INDEX "idx_staff_is_active" ON "staff" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_staff_user_id" ON "staff" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_templates_category" ON "templates" ("category");--> statement-breakpoint
CREATE INDEX "idx_templates_updated_at" ON "templates" ("updated_at");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "idx_vitals_patient_date" ON "vitals" ("patient_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_vitals_encounter" ON "vitals" ("encounter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "who_gender_metric_age_idx" ON "who_growth_data" ("gender","metric_type","age_months");--> statement-breakpoint
CREATE INDEX "who_gender_idx" ON "who_growth_data" ("gender");--> statement-breakpoint
CREATE INDEX "who_metric_idx" ON "who_growth_data" ("metric_type");--> statement-breakpoint
CREATE INDEX "who_age_idx" ON "who_growth_data" ("age_months");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_provider_id_staff_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "staff"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "growth_measurements" ADD CONSTRAINT "growth_measurements_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "growth_measurements" ADD CONSTRAINT "growth_measurements_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "immunizations" ADD CONSTRAINT "immunizations_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_uploaded_by_staff_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "staff"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_role" ADD CONSTRAINT "organization_role_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patient_chronic_conditions" ADD CONSTRAINT "patient_chronic_conditions_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_pediatrician_id_staff_id_fkey" FOREIGN KEY ("pediatrician_id") REFERENCES "staff"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_prescriber_id_staff_id_fkey" FOREIGN KEY ("prescriber_id") REFERENCES "staff"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_clinicId_clinics_id_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_encounter_id_encounters_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL;