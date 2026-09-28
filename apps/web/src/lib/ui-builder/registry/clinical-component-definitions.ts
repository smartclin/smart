// Import all clinical components

import type { ComponentRegistry } from "@smart/ui/components/ui-builder/types";
import { z } from "zod";
import {
	AllergyAlert,
	AppointmentBookingForm,
	AppointmentReminder,
	AppointmentSlot,
	ClinicStatsGrid,
	DevelopmentalMilestones,
	DiagnosisCodeSelector,
	DoctorTeamGrid,
	EmergencyBanner,
	FaqAccordion,
	FeedingGuideCard,
	GrowthChartCard,
	InsuranceInfoCard,
	MedicationField,
	OpeningHoursCard,
	PatientCard,
	PatientInfoDisplay,
	PediatricianBio,
	PrescriptionCard,
	ServiceCard,
	TestimonialCard,
	VaccinationSchedule,
	VitalSignsField,
} from "@/components/clinical";
import { AgeMilestoneTracker } from "@/components/clinical/age-milestone-tracker";
import {
	classNameFieldOverrides,
	commonFieldOverrides,
	functionPropFieldOverrides,
} from "@/lib/ui-builder/registry/form-field-overrides";

/**
 * Clinical component definitions for the pediatric clinic UI Builder.
 * Each entry maps a component name to its Zod schema for the properties panel.
 */
export const clinicalComponentDefinitions: ComponentRegistry = {
	// ============================================
	// FORM FIELDS (Clinical Data Entry)
	// ============================================

	VitalSignsField: {
		component: VitalSignsField,
		schema: z.object({
			className: z.string().optional(),
			showBMI: z.boolean().default(true),
			showHeadCircumference: z.boolean().default(false),
			showPainScale: z.boolean().default(false),
			required: z.boolean().default(false),
			onChange: z.any().optional(),
		}),
		from: "@/components/clinic/vital-signs-field",
		defaultChildren: [],
		fieldOverrides: {
			...commonFieldOverrides(),
			onChange: () => functionPropFieldOverrides("onChange"),
		},
	},

	DiagnosisCodeSelector: {
		component: DiagnosisCodeSelector,
		schema: z.object({
			className: z.string().optional(),
			placeholder: z.string().default("Search ICD-10 codes..."),
			category: z
				.enum([
					"common",
					"infectious",
					"developmental",
					"chronic",
					"injury",
					"all",
				])
				.default("all"),
			multiple: z.boolean().default(true),
			maxCodes: z.coerce.number().default(5),
			required: z.boolean().default(false),
			onChange: z.any().optional(),
		}),
		from: "@/components/clinic/diagnosis-code-selector",
		defaultChildren: [],
		fieldOverrides: {
			...commonFieldOverrides(),
			onChange: () => functionPropFieldOverrides("onChange"),
		},
	},

	MedicationField: {
		component: MedicationField,
		schema: z.object({
			className: z.string().optional(),
			showDosageCalculator: z.boolean().default(true),
			showFrequency: z.boolean().default(true),
			showDuration: z.boolean().default(true),
			showInstructions: z.boolean().default(true),
			weightBased: z.boolean().default(true),
			required: z.boolean().default(false),
			onChange: z.any().optional(),
		}),
		from: "@/components/clinic/medication-field",
		defaultChildren: [],
		fieldOverrides: {
			...commonFieldOverrides(),
			onChange: () => functionPropFieldOverrides("onChange"),
		},
	},

	DevelopmentalMilestones: {
		component: DevelopmentalMilestones,
		schema: z.object({
			className: z.string().optional(),
			ageGroup: z
				.enum([
					"2mo",
					"4mo",
					"6mo",
					"9mo",
					"12mo",
					"18mo",
					"24mo",
					"3yr",
					"4yr",
					"5yr",
				])
				.default("12mo"),
			showRedFlags: z.boolean().default(true),
			showNotes: z.boolean().default(true),
			onChange: z.any().optional(),
		}),
		from: "@/components/clinic/developmental-milestones",
		defaultChildren: [],
		fieldOverrides: {
			...commonFieldOverrides(),
			onChange: () => functionPropFieldOverrides("onChange"),
		},
	},

	// ============================================
	// PATIENT DISPLAY COMPONENTS
	// ============================================

	PatientInfoDisplay: {
		component: PatientInfoDisplay,
		schema: z.object({
			className: z.string().optional(),
			patientId: z.string().optional(),
			showAge: z.boolean().default(true),
			showDOB: z.boolean().default(true),
			showMRN: z.boolean().default(true),
			showAllergies: z.boolean().default(true),
			showPrimaryCare: z.boolean().default(false),
			compact: z.boolean().default(false),
		}),
		from: "@/components/clinic/patient-info-display",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	PatientCard: {
		component: PatientCard,
		schema: z.object({
			className: z.string().optional(),
			patientName: z.string().default("New Patient"),
			age: z.coerce.number().nullable().default(5),
			dateOfBirth: z.string().optional(),
			gender: z.enum(["male", "female", "other"]).default("male"),
			lastVisit: z.string().optional(),
			nextVisit: z.string().optional(),
			primaryDoctor: z.string().default("Dr. Smith"),
			bloodType: z.string().optional(),
			allergies: z.string().optional(),
			notes: z.string().optional(),
			variant: z
				.enum(["default", "compact", "detailed"])
				.default("default"),
		}),
		from: "@/components/clinic/patient-card",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	AllergyAlert: {
		component: AllergyAlert,
		schema: z.object({
			className: z.string().optional(),
			patientName: z.string().optional(),
			showEmptyState: z.boolean().default(true),
			title: z.string().nullable().default("Allergy Alerts"),
			variant: z
				.enum(["default", "compact", "banner"])
				.default("default"),
			allergies: z
				.array(
					z.object({
						allergen: z.string(),
						reaction: z.string().optional(),
						severity: z
							.enum([
								"mild",
								"moderate",
								"severe",
								"anaphylactic",
							])
							.optional(),
					})
				)
				.optional(),
		}),
		from: "@/components/clinic/allergy-alert",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	// ============================================
	// CLINICAL DISPLAY CARDS
	// ============================================

	AgeMilestoneTracker: {
		component: AgeMilestoneTracker,
		schema: z.object({
			className: z.string().optional(),
			ageMonths: z.coerce.number().default(6),
			showProgress: z.boolean().default(true),
			showUpcoming: z.boolean().default(true),
		}),
		from: "@/components/clinic/age-milestone-tracker",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	GrowthChartCard: {
		component: GrowthChartCard,
		schema: z.object({
			className: z.string().optional(),
		}),
		from: "@/components/clinic/growth-chart-card",
		defaultChildren: [],
		fieldOverrides: {
			className: (layer) => classNameFieldOverrides(layer),
		},
	},

	VaccinationSchedule: {
		component: VaccinationSchedule,
		schema: z.object({
			className: z.string().optional(),
			patientAgeMonths: z.coerce.number().default(6),
			showCompleted: z.boolean().default(true),
			showUpcoming: z.boolean().default(true),
			showOverdue: z.boolean().default(true),
			vaccineFilter: z
				.enum(["all", "routine", "travel", "optional"])
				.default("all"),
		}),
		from: "@/components/clinic/vaccination-schedule",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	FeedingGuideCard: {
		component: FeedingGuideCard,
		schema: z.object({
			className: z.string().optional(),
			ageMonths: z.coerce.number().default(6),
			highlightCurrentAge: z.boolean().default(true),
			title: z.string().nullable().default("Feeding Guide"),
			description: z.string().optional(),
			variant: z
				.enum(["default", "compact", "timeline"])
				.default("default"),
		}),
		from: "@/components/clinic/feeding-guide-card",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	// ============================================
	// APPOINTMENT COMPONENTS
	// ============================================

	AppointmentSlot: {
		component: AppointmentSlot,
		schema: z.object({
			className: z.string().optional(),
			date: z.string().default("2026-09-22"),
			time: z.string().default("10:00"),
			endTime: z.string().default("10:30"),
			pediatrician: z.string().default("Dr. Smith"),
			type: z
				.enum([
					"checkup",
					"vaccination",
					"sick-visit",
					"consultation",
					"follow-up",
					"emergency",
				])
				.default("checkup"),
			available: z.boolean().default(true),
			location: z.string().default("Main Clinic - Room 101"),
			notes: z.string().optional(),
		}),
		from: "@/components/clinic/appointment-slot",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	AppointmentReminder: {
		component: AppointmentReminder,
		schema: z.object({
			className: z.string().optional(),
			patientName: z.string().default("John Doe"),
			pediatrician: z.string().default("Dr. Smith"),
			date: z.string().default("2026-09-22"),
			time: z.string().default("10:00 AM"),
			endTime: z.string().default("10:30 AM"),
			visitType: z.string().default("Well-Child Check"),
			location: z.string().default("Main Clinic — Room 101"),
			status: z
				.enum(["upcoming", "today", "tomorrow", "overdue", "cancelled"])
				.default("today"),
			notes: z.string().optional(),
			contactPhone: z.string().default("(555) 123-4567"),
			variant: z
				.enum(["default", "compact", "banner"])
				.default("default"),
			title: z.string().nullable().default("Appointment Reminder"),
		}),
		from: "@/components/clinic/appointment-reminder",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	AppointmentBookingForm: {
		component: AppointmentBookingForm,
		schema: z.object({
			className: z.string().optional(),
			patientName: z.string().default("John Doe"),
			title: z.string().default("Book an Appointment"),
			description: z
				.string()
				.default("Schedule a visit with one of our pediatricians"),
			isSubmitting: z.boolean().default(false),
		}),
		from: "@/components/clinic/appointment-booking-form",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	// ============================================
	// PRESCRIPTION & INSURANCE
	// ============================================

	PrescriptionCard: {
		component: PrescriptionCard,
		schema: z.object({
			className: z.string().optional(),
			rxNumber: z.string().default("RX-2026-0001"),
			patientName: z.string().default("John Doe"),
			prescriberName: z.string().default("Dr. Smith"),
			prescribedDate: z.string().default("2026-09-22"),
			diagnosis: z.string().optional(),
			status: z
				.enum(["Active", "Completed", "Discontinued", "Cancelled"])
				.default("Active"),
			variant: z
				.enum(["default", "compact", "detailed"])
				.default("default"),
		}),
		from: "@/components/clinic/prescription-card",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	InsuranceInfoCard: {
		component: InsuranceInfoCard,
		schema: z.object({
			className: z.string().optional(),
			patientName: z.string().optional(),
			title: z.string().nullable().default("Insurance Information"),
			variant: z.enum(["default", "compact"]).default("default"),
		}),
		from: "@/components/clinic/insurance-info-card",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	// ============================================
	// CLINIC INFO & MARKETING
	// ============================================

	EmergencyBanner: {
		component: EmergencyBanner,
		schema: z.object({
			className: z.string().optional(),
			message: z
				.string()
				.default("For medical emergencies, call 911 immediately."),
			phoneNumber: z.string().default("(555) 911-0000"),
			showIcon: z.boolean().default(true),
			variant: z
				.enum(["info", "warning", "critical"])
				.default("critical"),
			dismissible: z.boolean().default(false),
		}),
		from: "@/components/clinic/emergency-banner",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	ClinicStatsGrid: {
		component: ClinicStatsGrid,
		schema: z.object({
			className: z.string().optional(),
			title: z.string().nullable().default("Clinic Overview"),
			description: z.string().optional(),
			columns: z.coerce.number().min(2).max(4).default(4),
			variant: z
				.enum(["default", "compact", "detailed"])
				.default("default"),
		}),
		from: "@/components/clinic/clinic-stats-grid",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	DoctorTeamGrid: {
		component: DoctorTeamGrid,
		schema: z.object({
			className: z.string().optional(),
			title: z.string().nullable().default("Our Medical Team"),
			description: z.string().optional(),
			columns: z.coerce.number().min(2).max(4).default(4),
			variant: z
				.enum(["default", "compact", "detailed"])
				.default("default"),
		}),
		from: "@/components/clinic/doctor-team-grid",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	PediatricianBio: {
		component: PediatricianBio,
		schema: z.object({
			className: z.string().optional(),
			name: z.string().default("Dr. Sarah Johnson"),
			specialty: z.string().default("General Pediatrics"),
			bio: z.string().optional(),
			yearsExperience: z.coerce.number().default(15),
			email: z.string().optional(),
			phone: z.string().optional(),
			location: z.string().optional(),
			acceptingPatients: z.boolean().default(true),
			variant: z
				.enum(["default", "compact", "detailed"])
				.default("default"),
			title: z.string().nullable().default(null),
		}),
		from: "@/components/clinic/pediatrician-bio",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	ServiceCard: {
		component: ServiceCard,
		schema: z.object({
			className: z.string().optional(),
			title: z.string().default("Well-Child Visit"),
			description: z
				.string()
				.default("Routine checkup to monitor your child's growth."),
			icon: z
				.enum([
					"stethoscope",
					"syringe",
					"heart",
					"baby",
					"microscope",
					"calendar",
					"users",
					"phone",
				])
				.default("stethoscope"),
			availability: z
				.enum(["available", "limited", "unavailable"])
				.default("available"),
			phone: z.string().optional(),
			duration: z.string().optional(),
			price: z.string().optional(),
			actionLabel: z.string().default("Book Now"),
			variant: z
				.enum(["default", "compact", "featured"])
				.default("default"),
		}),
		from: "@/components/clinic/service-card",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	TestimonialCard: {
		component: TestimonialCard,
		schema: z.object({
			className: z.string().optional(),
			name: z.string().default("Jennifer Martinez"),
			relationship: z.string().default("Mother of Emma, age 3"),
			quote: z.string().optional(),
			rating: z.coerce.number().min(1).max(5).default(5),
			variant: z
				.enum(["default", "compact", "featured"])
				.default("default"),
		}),
		from: "@/components/clinic/testimonial-card",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	FaqAccordion: {
		component: FaqAccordion,
		schema: z.object({
			className: z.string().optional(),
			title: z.string().nullable().default("Frequently Asked Questions"),
			allowMultiple: z.boolean().default(false),
		}),
		from: "@/components/clinic/faq-accordion",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},

	OpeningHoursCard: {
		component: OpeningHoursCard,
		schema: z.object({
			className: z.string().optional(),
			today: z.string().optional(),
			afterHoursPhone: z.string().optional(),
			title: z.string().nullable().default("Opening Hours"),
		}),
		from: "@/components/clinic/opening-hours-card",
		defaultChildren: [],
		fieldOverrides: commonFieldOverrides(),
	},
};
