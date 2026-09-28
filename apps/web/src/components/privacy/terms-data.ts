export const LAST_UPDATED = "September 26, 2026";
export const EFFECTIVE_DATE = "October 1, 2026";
export const CONTACT_EMAIL = "legal@smartclinic.app";

// ─── Quick summary (the four bullets at the top) ──────────────────────────

export type SummaryItem = {
	id: string;
	kind: "positive" | "caution";
	title: string;
	description: string;
};

export const SUMMARY: readonly SummaryItem[] = [
	{
		id: "free",
		kind: "positive",
		title: "Free to use",
		description:
			"Smart Clinic is free for individual pediatricians and small clinics.",
	},
	{
		id: "ownership",
		kind: "positive",
		title: "You own your data",
		description: "Your clinical records belong to your clinic — not to us.",
	},
	{
		id: "hipaa",
		kind: "positive",
		title: "HIPAA-aligned by design",
		description:
			"Built to meet HIPAA and pediatric data-protection standards.",
	},
	{
		id: "disclaimer",
		kind: "caution",
		title: "Clinical judgment is yours",
		description:
			"Smart Clinic is a tool. It does not replace professional medical judgment.",
	},
] as const;

// ─── Numbered sections ─────────────────────────────────────────────────────

export type BulletList = {
	heading?: string;
	items: readonly string[];
};

export type Callout = {
	kind: "warning" | "info";
	title: string;
	body: string;
};

export type AccountType = {
	id: string;
	title: string;
	description: string;
};

export type TermsSection = {
	id: string;
	title: string;
	body?: string;
	lists?: readonly BulletList[];
	callout?: Callout;
	accountTypes?: readonly AccountType[];
	doList?: readonly string[];
	dontList?: readonly string[];
};

export const SECTIONS: readonly TermsSection[] = [
	{
		id: "acceptance",
		title: "1. Acceptance of Terms",
		body: "By creating an account or using Smart Clinic, you agree to these Terms of Service. If you use the platform on behalf of a clinic, you confirm that you have authority to bind that clinic to these terms. If you do not agree with any part of these terms, you may not use the platform.",
	},
	{
		id: "accounts",
		title: "2. Your Account",
		body: "Smart Clinic offers accounts for two primary user types. Both are governed by these Terms.",
		accountTypes: [
			{
				id: "provider",
				title: "Provider Accounts",
				description:
					"For pediatricians, nurses, IBCLCs, and clinic staff who deliver care. Verified against professional credentials before activation.",
			},
			{
				id: "patient",
				title: "Patient Accounts",
				description:
					"For patients and their guardians to view records, appointments, and results. Patient data is shared with a patient account only at the clinic's direction.",
			},
		],
		lists: [
			{
				heading: "Account creation",
				items: [
					"You must provide accurate, current, and complete information.",
					"You are responsible for keeping your credentials confidential.",
					"You must notify us immediately of any unauthorized access.",
					"You may not share your account with anyone else.",
				],
			},
		],
	},
	{
		id: "acceptable-use",
		title: "3. Acceptable Use",
		body: "Smart Clinic exists to support pediatric care. We ask that you use it accordingly.",
		doList: [
			"Use the platform for legitimate clinical and administrative purposes.",
			"Keep patient data accurate and up to date.",
			"Report bugs and security concerns responsibly.",
			"Respect patient privacy, including that of minors.",
		],
		dontList: [
			"Share patient data with anyone who is not authorized to receive it.",
			"Attempt to access records you are not entitled to view.",
			"Use the platform to advertise, spam, or harass.",
			"Reverse-engineer, resell, or sublicense the platform without written permission.",
		],
	},
	{
		id: "clinical-judgment",
		title: "4. Clinical Judgment & Limitations",
		body: "Smart Clinic is a documentation and workflow tool. It does not provide medical advice, diagnosis, or treatment. Every clinical decision remains the responsibility of the licensed provider.",
		callout: {
			kind: "warning",
			title: "Not a substitute for professional judgment.",
			body: "Always rely on your own clinical training, judgment, and direct patient assessment. Do not use Smart Clinic as your sole source of information for any medical decision.",
		},
	},
	{
		id: "termination",
		title: "5. Termination",
		body: "You may close your account at any time from the account settings page. We may suspend or terminate accounts that violate these terms, that we are legally required to close, or that present a security risk to other users. On termination, we retain clinical records for the period required by applicable law, then delete them.",
	},
];

// ─── Contact ───────────────────────────────────────────────────────────────

export const CONTACT_BLURB =
	"Questions about these Terms? Our legal team is one message away.";
