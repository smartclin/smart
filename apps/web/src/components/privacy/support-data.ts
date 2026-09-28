import { type LucideIcon, Mail, MessageCircle } from "lucide-react";

export const SUPPORT_EMAIL = "support@smartclinic.app";
export const STATUS_URL = "https://status.smartclinic.app";

// ─── Quick-help channels (top 4-card grid) ────────────────────────────────

export type HelpChannel = {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
	cta: string;
	href: string;
	color: string;
};

export const HELP_CHANNELS: readonly HelpChannel[] = [
	{
		id: "chat",
		icon: MessageCircle,
		title: "Live Chat",
		description: "Talk to a support specialist in real time.",
		cta: "Start chat",
		href: "/contact",
		color: "text-module-encounters",
	},
	{
		id: "email",
		icon: Mail,
		title: "Email Support",
		description: SUPPORT_EMAIL,
		cta: "Send email",
		href: `mailto:${SUPPORT_EMAIL}`,
		color: "text-module-labs",
	},
] as const;

// ─── FAQ ──────────────────────────────────────────────────────────────────

export type FaqItem = {
	id: string;
	question: string;
	answer: string;
};

export const FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: "hipaa",
		question: "Is Smart Clinic HIPAA compliant?",
		answer: "Yes. Smart Clinic is architected to meet HIPAA requirements — encryption in transit and at rest, role-based access controls, audit logging, and a signed Business Associate Agreement (BAA) available for all clinic accounts.",
	},
	{
		id: "migration",
		question: "Can I migrate data from my existing EMR?",
		answer: "Absolutely. We support imports from CSV, FHIR, and HL7. For larger clinics, our team will guide you through a structured migration plan at no additional cost.",
	},
	{
		id: "pricing",
		question: "How does pricing work for small clinics?",
		answer: "Smart Clinic is free for individual pediatricians and clinics with up to 3 providers. Beyond that, we charge a flat per-provider monthly rate — no per-patient fees, no surprise charges.",
	},
	{
		id: "support-hours",
		question: "What are your support hours?",
		answer: "Live chat and phone support are available Monday–Friday, 8 AM–8 PM ET. Email is monitored 24/7, and critical issues (data access, security) get a response within 30 minutes around the clock.",
	},
	{
		id: "cancel",
		question: "How do I cancel my account?",
		answer: "You can close your account from Settings → Billing at any time. We retain clinical records for the period required by law, then permanently delete them. You can export all data before cancelling.",
	},
] as const;

// ─── Guides ───────────────────────────────────────────────────────────────

export type GuideItem = {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
	level: "Beginner" | "Essential" | "Advanced";
	href: string;
	color: string;
};

export type ContactChannel = {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
	detail: string;
	cta: string;
	href: string;
};

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
	{
		id: "email",
		icon: Mail,
		title: "Email",
		description: SUPPORT_EMAIL,
		detail: "Response within 4 business hours",
		cta: "Send email",
		href: `mailto:${SUPPORT_EMAIL}`,
	},
] as const;

export const SUPPORT_HOURS = {
	heading: "Support hours",
	body: "Monday–Friday, 8 AM–8 PM ET · Email monitored 24/7",
} as const;

// ─── Status ───────────────────────────────────────────────────────────────

export const STATUS = {
	label: "All systems operational",
	href: STATUS_URL,
} as const;
