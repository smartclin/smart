import {
	Baby,
	Clock,
	Heart,
	LineChart,
	Shield,
	Sparkles,
	Users,
} from "lucide-react";

export const STATS = [
	{
		id: "patients",
		value: "10K+",
		label: "Patients served",
		color: "text-primary",
	},
	{
		id: "clinics",
		value: "500+",
		label: "Clinics onboard",
		color: "text-violet-600",
	},
	{
		id: "uptime",
		value: "99.9%",
		label: "Uptime SLA",
		color: "text-emerald-600",
	},
	{
		id: "rating",
		value: "4.9★",
		label: "Average rating",
		color: "text-amber-600",
	},
] as const;

export const VALUES = [
	{
		id: "patient-first",
		icon: Baby,
		title: "Patient-First",
		description:
			"Every feature starts with a real clinical need — from a real patient, a real parent, a real pediatrician.",
		color: "text-primary",
	},
	{
		id: "trust",
		icon: Shield,
		title: "Trust & Security",
		description:
			"HIPAA-aligned architecture, end-to-end encryption, and auditable access controls, by default.",
		color: "text-emerald-600",
	},
	{
		id: "innovation",
		icon: Sparkles,
		title: "Thoughtful Innovation",
		description:
			"We adopt new tools only when they improve outcomes — never for their own sake.",
		color: "text-violet-600",
	},
	{
		id: "community",
		icon: Users,
		title: "Clinical Community",
		description:
			"Built with pediatricians, nurses, IBCLCs, and clinic administrators from day one.",
		color: "text-rose-600",
	},
] as const;

export const FEATURES = [
	{
		id: "scheduling",
		icon: Clock,
		title: "Smart Scheduling",
		description:
			"Appointment slotting that respects provider availability, room capacity, and patient preference.",
		color: "text-primary",
	},
	{
		id: "growth",
		icon: LineChart,
		title: "Growth Tracking",
		description:
			"WHO and CDC percentile curves, plotted automatically from every recorded measurement.",
		color: "text-emerald-600",
	},
	{
		id: "immunizations",
		icon: Shield,
		title: "Immunization Compliance",
		description:
			"CDC-aligned schedules, overdue alerts, and clinic-wide coverage dashboards.",
		color: "text-violet-600",
	},
	{
		id: "care",
		icon: Heart,
		title: "Longitudinal Care",
		description:
			"Complete patient history — encounters, prescriptions, labs, and vitals — in one view.",
		color: "text-rose-600",
	},
] as const;

export type TeamMember = {
	id: string;
	name: string;
	role: string;
	specialty: string;
	gradient: string;
	image?: string;
	certifications: readonly string[];
};

export const TEAM: readonly TeamMember[] = [
	{
		id: "hazem",
		name: "Dr. Hazem Ali",
		role: "CEO & Founder",
		specialty: "Pediatrician & IBCLC",
		gradient: "from-primary to-teal-500",
		image: "/images/dr-hazem.jpg",
		certifications: [
			"Board Certified Pediatrician",
			"IBCLC Certified",
			"Fellow of American Academy of Pediatrics",
			"15+ Years Clinical Experience",
		],
	},
	{
		id: "sarah",
		name: "Dr. Sarah Chen",
		role: "CTO & Co-founder",
		specialty: "Neonatologist",
		gradient: "from-emerald-500 to-teal-500",
		image: "/images/dr-sarah.jpg",
		certifications: [
			"Board Certified Neonatologist",
			"Harvard Medical School",
			"10+ Years Experience",
		],
	},
	{
		id: "lisa",
		name: "Lisa Thompson",
		role: "Head of Product",
		specialty: "IBCLC, RN",
		gradient: "from-rose-500 to-orange-500",
		image: "/images/lisa-thompson.jpg",
		certifications: [
			"IBCLC Certified",
			"Registered Nurse",
			"Patient Advocate",
		],
	},
] as const;
