import { Database, Eye, Lock, Shield } from "lucide-react";

export const LAST_UPDATED = "September 26, 2026";

export const PRINCIPLES = [
	{
		id: "security",
		icon: Lock,
		title: "Security First",
		description:
			"End-to-end encryption, scoped access controls, and continuous audit logging protect every record.",
		color: "text-primary",
	},
	{
		id: "transparency",
		icon: Eye,
		title: "Full Transparency",
		description:
			"You always know what we collect, why we collect it, and who can see it.",
		color: "text-module-growth",
	},
	{
		id: "control",
		icon: Database,
		title: "Your Data, Your Control",
		description:
			"Export, correct, or delete your clinic's data at any time — no support ticket required.",
		color: "text-module-encounters",
	},
	{
		id: "hipaa",
		icon: Shield,
		title: "HIPAA Aligned",
		description:
			"Designed to meet HIPAA, GDPR, and pediatric data-protection requirements from day one.",
		color: "text-module-prescriptions",
	},
] as const;

export const COLLECT_PERSONAL = [
	"Full name, date of birth, and contact information",
	"Medical record number and clinical identifiers",
	"Appointment history and encounter notes",
	"Prescriptions, immunizations, and lab results",
	"Guardian and emergency-contact information",
] as const;

export const COLLECT_USAGE = [
	"Device type, browser, and operating system",
	"Pages visited and features used within the app",
	"Error reports and performance diagnostics",
] as const;

export const USE_CARE = [
	"Deliver clinical care and maintain accurate medical records",
	"Coordinate appointments and reminders with patients and guardians",
	"Process prescriptions, lab orders, and immunization schedules",
	"Provide longitudinal pediatric tracking — growth, development, and outcomes",
] as const;

export const RIGHTS = [
	{
		id: "access",
		title: "Right to Access",
		description:
			"Request a complete copy of your clinic's data at any time.",
	},
	{
		id: "correct",
		title: "Right to Correct",
		description:
			"Update inaccurate records directly through the app — no waiting on support.",
	},
	{
		id: "delete",
		title: "Right to Delete",
		description:
			"Request deletion of your account and all associated records, subject to legal retention requirements.",
	},
	{
		id: "portability",
		title: "Right to Portability",
		description:
			"Export your data in standard formats (CSV, FHIR) for transfer to another system.",
	},
] as const;

export const CONTACT = [
	{
		id: "email",
		icon: "mail" as const,
		label: "privacy@smartclinic.app",
		href: "mailto:privacy@smartclinic.app",
	},
	{
		id: "phone",
		icon: "phone" as const,
		label: "1-800-SMART-MD",
		href: "tel:+18007627863",
	},
	{
		id: "address",
		icon: "map-pin" as const,
		label: "123 Healthcare Way, Suite 100",
	},
] as const;
