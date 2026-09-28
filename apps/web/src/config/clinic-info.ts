// config/clinic-info.ts

export const CLINIC_INFO = {
	name: "Smart Clinic",
	addressLine1: "123 Sunshine Lane, Suite 200",
	addressLine2: "Springfield, USA 00000",
	phoneDisplay: "(555) 123-4567",
	phoneE164: "+15551234567",
	email: "hello@pediatricclinic.example",
	emergencyNote:
		"Call 911. For urgent after-hours questions, use our 24/7 nurse line.",
} as const;

export const CLINIC_HOURS = [
	{ day: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
	{ day: "Saturday", time: "9:00 AM – 2:00 PM" },
	{ day: "Sunday", time: "Closed" },
	{ day: "After-Hours Nurse Line", time: "24 / 7" },
] as const;

export type ClinicHour = (typeof CLINIC_HOURS)[number];
