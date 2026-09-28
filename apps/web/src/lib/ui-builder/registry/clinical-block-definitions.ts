import type {
	BlockDefinition,
	BlockRegistry,
	ComponentLayer,
} from "@smart/ui/components/ui-builder/types";

// Helper to create text spans
const textSpan = (
	id: string,
	text: string,
	className?: string
): ComponentLayer => ({
	id,
	type: "span",
	name: "span",
	props: className ? { className } : {},
	children: text,
});

// Helper to create div containers
const divContainer = (
	id: string,
	className: string,
	children: ComponentLayer[]
): ComponentLayer => ({
	id,
	type: "div",
	name: "div",
	props: { className },
	children,
});

// ============================================
// CLINICAL NOTE TEMPLATES
// ============================================

export const wellChildVisitTemplate: BlockDefinition = {
	name: "well-child-visit",
	category: "clinical-notes",
	description:
		"Standard well-child visit template with vitals, milestones, and diagnosis",
	requiredComponents: [
		"PatientInfoDisplay",
		"VitalSignsField",
		"DevelopmentalMilestones",
		"DiagnosisCodeSelector",
		"MedicationField",
		"Button",
		"Card",
	],
	template: divContainer(
		"well-child-root",
		"space-y-6 p-6 max-w-4xl mx-auto",
		[
			// Header
			divContainer("header", "flex items-center justify-between", [
				textSpan(
					"header-title",
					"Well-Child Visit Note",
					"text-2xl font-bold"
				),
				{
					id: "header-date",
					type: "span",
					name: "span",
					props: { className: "text-muted-foreground" },
					children: { __variableRef: "visit-date" },
				},
			]),

			// Patient Info
			{
				id: "patient-info",
				type: "PatientInfoDisplay",
				name: "Patient Info",
				props: {
					showAge: true,
					showDOB: true,
					showMRN: true,
					showAllergies: true,
					showPrimaryCare: true,
				},
				children: [],
			},

			// Vital Signs
			{
				id: "vital-signs",
				type: "VitalSignsField",
				name: "Vital Signs",
				props: {
					showBMI: true,
					showHeadCircumference: true,
					showPainScale: false,
					required: true,
				},
				children: [],
			},

			// Developmental Milestones
			{
				id: "milestones",
				type: "DevelopmentalMilestones",
				name: "Developmental Milestones",
				props: {
					ageGroup: "24mo",
					showRedFlags: true,
					showNotes: true,
				},
				children: [],
			},

			// Diagnosis
			divContainer("diagnosis-section", "space-y-2", [
				textSpan("diagnosis-label", "Diagnosis", "font-semibold"),
				{
					id: "diagnosis-selector",
					type: "DiagnosisCodeSelector",
					name: "Diagnosis Codes",
					props: {
						placeholder: "Search ICD-10 codes...",
						category: "all",
						multiple: true,
						maxCodes: 5,
					},
					children: [],
				},
			]),

			// Medications
			{
				id: "medications",
				type: "MedicationField",
				name: "Medications",
				props: {
					showDosageCalculator: true,
					showFrequency: true,
					showDuration: true,
					showInstructions: true,
					weightBased: true,
				},
				children: [],
			},

			// Actions
			divContainer("actions", "flex gap-3 justify-end pt-4 border-t", [
				{
					id: "save-draft",
					type: "Button",
					name: "Save Draft",
					props: {
						variant: "outline",
						className: "gap-2",
					},
					children: [textSpan("save-draft-text", "Save Draft")],
				},
				{
					id: "save-note",
					type: "Button",
					name: "Save Note",
					props: {
						variant: "default",
						className: "gap-2",
					},
					children: [textSpan("save-note-text", "Sign & Save")],
				},
			]),
		]
	),
};

export const sickVisitTemplate: BlockDefinition = {
	name: "sick-visit",
	category: "clinical-notes",
	description: "Acute sick visit template focused on symptoms and diagnosis",
	requiredComponents: [
		"PatientInfoDisplay",
		"VitalSignsField",
		"DiagnosisCodeSelector",
		"MedicationField",
		"Textarea",
		"Button",
	],
	template: divContainer(
		"sick-visit-root",
		"space-y-6 p-6 max-w-4xl mx-auto",
		[
			textSpan("sick-title", "Sick Visit Note", "text-2xl font-bold"),

			{
				id: "patient-info",
				type: "PatientInfoDisplay",
				name: "Patient Info",
				props: { showAge: true, showAllergies: true, compact: true },
				children: [],
			},

			{
				id: "vital-signs",
				type: "VitalSignsField",
				name: "Vital Signs",
				props: { showBMI: false, showPainScale: true, required: true },
				children: [],
			},

			// Chief Complaint
			divContainer("chief-complaint", "space-y-2", [
				textSpan("cc-label", "Chief Complaint", "font-semibold"),
				{
					id: "cc-textarea",
					type: "Textarea",
					name: "Chief Complaint",
					props: {
						placeholder: "Describe the presenting complaint...",
						rows: 3,
					},
					children: [],
				},
			]),

			// Assessment
			divContainer("assessment", "space-y-2", [
				textSpan("assessment-label", "Assessment", "font-semibold"),
				{
					id: "diagnosis-selector",
					type: "DiagnosisCodeSelector",
					name: "Diagnosis",
					props: { multiple: true, maxCodes: 3 },
					children: [],
				},
			]),

			// Plan
			divContainer("plan", "space-y-2", [
				textSpan("plan-label", "Plan", "font-semibold"),
				{
					id: "medications",
					type: "MedicationField",
					name: "Medications",
					props: { weightBased: true },
					children: [],
				},
			]),

			divContainer("actions", "flex gap-3 justify-end pt-4 border-t", [
				{
					id: "save-note",
					type: "Button",
					name: "Sign & Save",
					props: { variant: "default" },
					children: [textSpan("save-text", "Sign & Save")],
				},
			]),
		]
	),
};

export const earInfectionTemplate: BlockDefinition = {
	name: "ear-infection-visit",
	category: "clinical-notes",
	description: "Focused ear infection visit with otoscopy findings",
	requiredComponents: [
		"PatientInfoDisplay",
		"VitalSignsField",
		"DiagnosisCodeSelector",
		"MedicationField",
		"Checkbox",
		"Textarea",
	],
	template: divContainer(
		"ear-infection-root",
		"space-y-6 p-6 max-w-4xl mx-auto",
		[
			textSpan("ei-title", "Ear Infection Visit", "text-2xl font-bold"),

			{
				id: "patient-info",
				type: "PatientInfoDisplay",
				name: "Patient Info",
				props: { compact: true, showAllergies: true },
				children: [],
			},

			{
				id: "vital-signs",
				type: "VitalSignsField",
				name: "Vital Signs",
				props: { required: true, showBMI: false },
				children: [],
			},

			// Otoscopy Findings
			divContainer("otoscopy", "space-y-3 p-4 border rounded-lg", [
				textSpan(
					"otoscopy-label",
					"Otoscopy Findings",
					"font-semibold"
				),

				divContainer("right-ear", "space-y-2", [
					textSpan("right-label", "Right Ear", "font-medium text-sm"),
					divContainer("right-checkboxes", "grid grid-cols-2 gap-2", [
						{
							id: "right-redness",
							type: "Checkbox",
							name: "Redness",
							props: { id: "right-redness" },
							children: [],
						},
						textSpan("right-redness-label", "Erythema", "text-sm"),
					]),
				]),

				divContainer("left-ear", "space-y-2", [
					textSpan("left-label", "Left Ear", "font-medium text-sm"),
					divContainer("left-checkboxes", "grid grid-cols-2 gap-2", [
						{
							id: "left-redness",
							type: "Checkbox",
							name: "Redness",
							props: { id: "left-redness" },
							children: [],
						},
						textSpan("left-redness-label", "Erythema", "text-sm"),
					]),
				]),

				{
					id: "otoscopy-notes",
					type: "Textarea",
					name: "Otoscopy Notes",
					props: {
						placeholder: "Additional otoscopy findings...",
						rows: 2,
					},
					children: [],
				},
			]),

			{
				id: "diagnosis-selector",
				type: "DiagnosisCodeSelector",
				name: "Diagnosis",
				props: { category: "infectious", multiple: false },
				children: [],
			},

			{
				id: "medications",
				type: "MedicationField",
				name: "Medications",
				props: { weightBased: true, showDosageCalculator: true },
				children: [],
			},
		]
	),
};

// ============================================
// PATIENT PAGE TEMPLATES
// ============================================

export const patientDashboardTemplate: BlockDefinition = {
	name: "patient-dashboard",
	category: "patient-pages",
	description:
		"Patient overview dashboard with stats, info, and quick actions",
	requiredComponents: [
		"ClinicStatsGrid",
		"PatientInfoDisplay",
		"AllergyAlert",
		"AppointmentReminder",
		"VaccinationSchedule",
	],
	template: divContainer("dashboard-root", "space-y-6 p-6", [
		textSpan("dashboard-title", "Patient Dashboard", "text-3xl font-bold"),

		{
			id: "stats-grid",
			type: "ClinicStatsGrid",
			name: "Clinic Stats",
			props: {
				title: null,
				columns: 4,
				variant: "compact",
			},
			children: [],
		},

		divContainer("main-grid", "grid grid-cols-1 lg:grid-cols-3 gap-6", [
			divContainer("left-column", "lg:col-span-2 space-y-6", [
				{
					id: "patient-info",
					type: "PatientInfoDisplay",
					name: "Patient Info",
					props: {
						showAge: true,
						showDOB: true,
						showMRN: true,
						showAllergies: true,
						showPrimaryCare: true,
					},
					children: [],
				},
				{
					id: "appointment-reminder",
					type: "AppointmentReminder",
					name: "Next Appointment",
					props: {
						status: "upcoming",
						variant: "default",
					},
					children: [],
				},
			]),

			divContainer("right-column", "space-y-6", [
				{
					id: "allergy-alert",
					type: "AllergyAlert",
					name: "Allergies",
					props: {
						variant: "default",
						showEmptyState: true,
					},
					children: [],
				},
				{
					id: "vaccination-schedule",
					type: "VaccinationSchedule",
					name: "Vaccinations",
					props: {
						showCompleted: false,
						showUpcoming: true,
						showOverdue: true,
					},
					children: [],
				},
			]),
		]),
	]),
};

export const appointmentBookingTemplate: BlockDefinition = {
	name: "appointment-booking-page",
	category: "patient-pages",
	description: "Full appointment booking page with form and clinic info",
	requiredComponents: [
		"AppointmentBookingForm",
		"OpeningHoursCard",
		"EmergencyBanner",
		"InsuranceInfoCard",
	],
	template: divContainer("booking-root", "space-y-8 p-6 max-w-6xl mx-auto", [
		{
			id: "emergency-banner",
			type: "EmergencyBanner",
			name: "Emergency Banner",
			props: {
				variant: "critical",
				message: "For medical emergencies, call 911 immediately.",
			},
			children: [],
		},

		textSpan(
			"booking-title",
			"Book an Appointment",
			"text-3xl font-bold text-center"
		),

		divContainer("booking-grid", "grid grid-cols-1 lg:grid-cols-3 gap-8", [
			divContainer("form-column", "lg:col-span-2", [
				{
					id: "booking-form",
					type: "AppointmentBookingForm",
					name: "Booking Form",
					props: {
						title: "Schedule Your Visit",
						description:
							"Choose a date, time, and provider for your child's appointment.",
					},
					children: [],
				},
			]),

			divContainer("sidebar", "space-y-6", [
				{
					id: "opening-hours",
					type: "OpeningHoursCard",
					name: "Opening Hours",
					props: {
						today: "Monday",
						afterHoursPhone: "(555) 911-0000",
					},
					children: [],
				},
				{
					id: "insurance-info",
					type: "InsuranceInfoCard",
					name: "Insurance",
					props: {
						variant: "compact",
					},
					children: [],
				},
			]),
		]),
	]),
};

export const clinicHomepageTemplate: BlockDefinition = {
	name: "clinic-homepage",
	category: "marketing",
	description: "Full clinic homepage with services, team, and testimonials",
	requiredComponents: [
		"EmergencyBanner",
		"ServiceCard",
		"DoctorTeamGrid",
		"TestimonialCard",
		"FaqAccordion",
		"OpeningHoursCard",
	],
	template: divContainer("homepage-root", "space-y-0", [
		{
			id: "emergency-banner",
			type: "EmergencyBanner",
			name: "Emergency Banner",
			props: { variant: "critical" },
			children: [],
		},

		// Hero section
		divContainer(
			"hero",
			"py-16 px-6 bg-gradient-to-b from-sky-50 to-white",
			[
				divContainer(
					"hero-content",
					"max-w-4xl mx-auto text-center space-y-6",
					[
						textSpan(
							"hero-title",
							"Compassionate Care for Every Stage of Childhood",
							"text-4xl font-bold text-slate-900"
						),
						textSpan(
							"hero-subtitle",
							"From first smiles to first sports physicals, our pediatric team is here for your family.",
							"text-lg text-slate-600"
						),
						divContainer(
							"hero-actions",
							"flex gap-4 justify-center",
							[
								{
									id: "hero-book",
									type: "Button",
									name: "Book Appointment",
									props: { size: "lg" },
									children: [
										textSpan(
											"hero-book-text",
											"Book an Appointment"
										),
									],
								},
								{
									id: "hero-call",
									type: "Button",
									name: "Call Us",
									props: { variant: "outline", size: "lg" },
									children: [
										textSpan(
											"hero-call-text",
											"(555) 123-4567"
										),
									],
								},
							]
						),
					]
				),
			]
		),

		// Services section
		divContainer("services", "py-16 px-6 bg-white", [
			divContainer("services-content", "max-w-6xl mx-auto space-y-8", [
				divContainer("services-header", "text-center space-y-3", [
					textSpan(
						"services-title",
						"Our Services",
						"text-3xl font-bold"
					),
					textSpan(
						"services-subtitle",
						"Comprehensive pediatric care under one roof.",
						"text-slate-600"
					),
				]),
				divContainer(
					"services-grid",
					"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
					[
						{
							id: "service-1",
							type: "ServiceCard",
							name: "Well-Child Visits",
							props: {
								title: "Well-Child Visits",
								description:
									"Routine checkups to track growth and development.",
								icon: "baby",
							},
							children: [],
						},
						{
							id: "service-2",
							type: "ServiceCard",
							name: "Immunizations",
							props: {
								title: "Immunizations",
								description:
									"On-schedule vaccines following CDC guidelines.",
								icon: "syringe",
							},
							children: [],
						},
						{
							id: "service-3",
							type: "ServiceCard",
							name: "Sick Visits",
							props: {
								title: "Sick Visits",
								description:
									"Same-day appointments for acute concerns.",
								icon: "stethoscope",
							},
							children: [],
						},
					]
				),
			]),
		]),

		// Team section
		divContainer("team", "py-16 px-6 bg-slate-50", [
			divContainer("team-content", "max-w-6xl mx-auto", [
				{
					id: "doctor-grid",
					type: "DoctorTeamGrid",
					name: "Our Team",
					props: {
						title: "Meet Our Pediatricians",
						columns: 3,
					},
					children: [],
				},
			]),
		]),

		// Testimonials
		divContainer("testimonials", "py-16 px-6 bg-white", [
			divContainer(
				"testimonials-content",
				"max-w-6xl mx-auto space-y-8",
				[
					textSpan(
						"testimonials-title",
						"What Parents Say",
						"text-3xl font-bold text-center"
					),
					divContainer(
						"testimonials-grid",
						"grid grid-cols-1 md:grid-cols-3 gap-6",
						[
							{
								id: "testimonial-1",
								type: "TestimonialCard",
								name: "Testimonial 1",
								props: {
									name: "Jennifer M.",
									relationship: "Mother of Emma, age 3",
									rating: 5,
									variant: "featured",
								},
								children: [],
							},
							{
								id: "testimonial-2",
								type: "TestimonialCard",
								name: "Testimonial 2",
								props: {
									name: "David L.",
									relationship: "Father of twins, age 5",
									rating: 5,
								},
								children: [],
							},
							{
								id: "testimonial-3",
								type: "TestimonialCard",
								name: "Testimonial 3",
								props: {
									name: "Maria G.",
									relationship: "Mother of Sofia, age 8",
									rating: 5,
								},
								children: [],
							},
						]
					),
				]
			),
		]),

		// Hours & FAQ
		divContainer("info", "py-16 px-6 bg-slate-50", [
			divContainer(
				"info-grid",
				"max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8",
				[
					{
						id: "opening-hours",
						type: "OpeningHoursCard",
						name: "Opening Hours",
						props: {
							today: "Monday",
							afterHoursPhone: "(555) 911-0000",
						},
						children: [],
					},
					{
						id: "faq",
						type: "FaqAccordion",
						name: "FAQ",
						props: {
							title: "Frequently Asked Questions",
							allowMultiple: false,
						},
						children: [],
					},
				]
			),
		]),
	]),
};

// ============================================
// EXPORT ALL BLOCKS
// ============================================

const allClinicalBlocks: BlockDefinition[] = [
	wellChildVisitTemplate,
	sickVisitTemplate,
	earInfectionTemplate,
	patientDashboardTemplate,
	appointmentBookingTemplate,
	clinicHomepageTemplate,
];

export const clinicalBlockDefinitions: BlockRegistry = allClinicalBlocks.reduce(
	(acc, block) => {
		acc[block.name] = block;
		return acc;
	},
	{} as BlockRegistry
);
