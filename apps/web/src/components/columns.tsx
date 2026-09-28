// packages/tanstack/src/table/shared-columns.tsx

import type {
	Appointment,
	Encounter,
	GrowthMeasurement,
	Immunization,
	LabOrder,
	Patient,
	Prescription,
	Staff,
	VitalSigns,
} from "@smart/db/schema";
import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import { cn, formatDate, toSentenceCase } from "@smart/ui/lib/utils";
import { createAppColumnHelper } from "@smart/ui/table";
import { calculatePediatricAge, getFeverClassification } from "@smart/utils";
import { Link } from "@tanstack/react-router";

// ============================================================
// Column Helpers
// ============================================================
type FullAppointment = Appointment & { patient: Patient; staff: Staff };
// const patientHelper = createAppColumnHelper<Patient>();
const appointmentHelper = createAppColumnHelper<FullAppointment>();
const staffHelper = createAppColumnHelper<Staff>();
type FullEncounter = Encounter & { patient: Patient; staff: Staff };
const encounterHelper = createAppColumnHelper<FullEncounter>();
const vitalHelper = createAppColumnHelper<VitalSigns>();
const growthHelper = createAppColumnHelper<GrowthMeasurement>();
const immunizationHelper = createAppColumnHelper<Immunization>();
type FullPrescription = Prescription & { patient: Patient; staff: Staff };
const prescriptionHelper = createAppColumnHelper<FullPrescription>();
type FullLabOrder = LabOrder & { patient: Patient; staff: Staff };
const labHelper = createAppColumnHelper<FullLabOrder>();

// ============================================================
// Shared Cell Renderers
// ============================================================

/**
 * Render date with optional time
 */
const renderDate = (date: string | Date, includeTime = false) => {
	const d = new Date(date);
	if (includeTime) {
		return (
			<div className="flex flex-col">
				<span>{d.toLocaleDateString()}</span>
				<span className="text-muted-foreground text-xs">
					{d.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
		);
	}
	return <span>{d.toLocaleDateString()}</span>;
};

/**
 * Render status badge with appropriate colors
 */
const renderStatusBadge = (
	status: string,
	variants: Record<string, string> = {}
) => {
	const defaultVariants: Record<string, string> = {
		Active: "success",
		Inactive: "secondary",
		Archived: "outline",
		Scheduled: "default",
		"Checked In": "info",
		"In Progress": "warning",
		Completed: "success",
		Cancelled: "destructive",
		"No Show": "destructive",
		Draft: "secondary",
		Signed: "success",
		Amended: "warning",
		Administered: "success",
		Due: "info",
		Overdue: "destructive",
		Upcoming: "info",
		Deferred: "warning",
		Refused: "destructive",
		Ordered: "info",
		"Sample Collected": "warning",
		Processing: "warning",
		Pending: "secondary",
		Normal: "success",
		Abnormal: "warning",
		Critical: "destructive",
	};

	const variant = (variants[status] ||
		defaultVariants[status] ||
		"default") as
		| "default"
		| "destructive"
		| "ghost"
		| "link"
		| "outline"
		| "secondary";
	return <Badge variant={variant}>{toSentenceCase(status)}</Badge>;
};

/**
 * Render patient name with avatar
 */
const renderPatientName = (
	patient: Patient,
	age?: ReturnType<typeof calculatePediatricAge>
) => {
	const ageInfo = age || calculatePediatricAge(patient.dateOfBirth);
	const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
	const isMale = patient.gender === "male";

	return (
		<div className="flex items-center space-x-3">
			<div
				className={cn(
					"flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-sm shadow-sm",
					isMale
						? "border border-blue-200 bg-blue-100 text-blue-700"
						: "border border-pink-200 bg-pink-100 text-pink-700"
				)}
			>
				{initials.toUpperCase()}
			</div>
			<div>
				<div className="flex items-center gap-2">
					<span className="font-medium text-foreground">
						{patient.firstName} {patient.lastName}
					</span>
					<Badge
						className="px-1.5 text-[10px]"
						variant="outline"
					>
						{ageInfo.ageGroup}
					</Badge>
				</div>
				<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<span className="font-mono">{patient.mrn}</span>
					<span>•</span>
					<span className="capitalize">{patient.gender}</span>
					<span>•</span>
					<span>{ageInfo.displayString}</span>
				</div>
			</div>
		</div>
	);
};

// /**
//  * Render guardian information
//  */
// const renderGuardian = (guardian: Guardian | null | undefined) => {
// 	if (!guardian)
// 		return <span className='text-muted-foreground text-xs'>—</span>;
// 	return (
// 		<div className='text-xs'>
// 			<div className='font-medium text-foreground'>{guardian.name}</div>
// 			<div className='text-muted-foreground'>{guardian.relationship}</div>
// 			{Boolean(guardian.phone) && (
// 				<div className='text-[10px] text-muted-foreground'>
// 					{guardian.phone}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// /**
//  * Render allergies with severity indicators
//  */
// const renderAllergies = (allergies: PatientAllergy[]) => {
// 	if (allergies.length === 0) {
// 		return (
// 			<div className='flex items-center text-emerald-600 text-xs'>
// 				<span className='mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500' />
// 				No known allergies
// 			</div>
// 		);
// 	}

// 	const severityColors: Record<string, string> = {
// 		Mild: "border-blue-200 bg-blue-50 text-blue-700",
// 		Moderate: "border-amber-200 bg-amber-50 text-amber-700",
// 		Severe: "border-orange-200 bg-orange-50 text-orange-700",
// 		Anaphylactic: "border-rose-200 bg-rose-50 text-rose-700"
// 	};

// 	return (
// 		<div className='flex flex-wrap gap-1'>
// 			{allergies.slice(0, 3).map(allergy => (
// 				<Badge
// 					className={cn(
// 						"border px-1.5 py-0.5 text-[10px]",
// 						severityColors[allergy.severity] || "border-gray-200 bg-gray-50"
// 					)}
// 					key={allergy.id}
// 					variant='outline'
// 				>
// 					{allergy.allergen}
// 				</Badge>
// 			))}
// 			{allergies.length > 3 && (
// 				<Badge
// 					className='px-1.5 text-[10px]'
// 					variant='secondary'
// 				>
// 					+{allergies.length - 3}
// 				</Badge>
// 			)}
// 		</div>
// 	);
// };

// ============================================================
// Patient Columns
// ============================================================
const patientHelper = createAppColumnHelper<Patient>();

export const patientColumns = patientHelper.columns([
	patientHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
		enableResizing: false,
	}),
	patientHelper.accessor("mrn", {
		id: "mrn",
		header: "MRN",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs">{String(getValue())}</span>
		),
		meta: { label: "MRN", variant: "text" },
		size: 100,
	}),

	patientHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
		id: "name",
		header: "Patient",
		cell: ({ row }) => {
			const patient = row.original;
			const age = calculatePediatricAge(patient.dateOfBirth);
			const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
			const isMale = patient.gender === "male";

			return (
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-sm shadow-sm",
							isMale
								? "border border-blue-200 bg-blue-100 text-blue-700"
								: "border border-pink-200 bg-pink-100 text-pink-700"
						)}
					>
						{initials.toUpperCase()}
					</div>

					<div>
						<div className="flex items-center gap-2">
							<span className="font-medium text-foreground">
								{patient.firstName} {patient.lastName}
							</span>
							<Badge
								className="px-1.5 text-[10px]"
								variant="outline"
							>
								{age.ageGroup}
							</Badge>
						</div>

						<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
							<span className="font-mono">{patient.mrn}</span>
							<span>•</span>
							<span className="capitalize">{patient.gender}</span>
							<span>•</span>
							<span>{age.displayString}</span>
						</div>
					</div>
				</div>
			);
		},
		meta: { label: "Patient", variant: "text" },
		size: 280,
	}),

	patientHelper.accessor("dateOfBirth", {
		id: "dateOfBirth",
		header: "Age / DOB",
		cell: ({ getValue }) => {
			const dob = getValue();
			const age = calculatePediatricAge(dob);

			return (
				<div className="space-y-0.5 text-xs">
					<div className="font-medium text-foreground">
						{age.displayString}
					</div>
					<div className="text-muted-foreground">
						{formatDate(dob)}
					</div>
				</div>
			);
		},
		meta: { label: "Date of Birth", variant: "date" },
		size: 150,
	}),

	patientHelper.accessor("gender", {
		id: "gender",
		header: "Gender",
		cell: ({ getValue }) => (
			<span className="text-sm capitalize">{String(getValue())}</span>
		),
		meta: { label: "Gender", variant: "select" },
		size: 80,
	}),

	patientHelper.accessor("activeStatus", {
		id: "activeStatus",
		header: "Status",
		cell: ({ getValue }) => renderStatusBadge(String(getValue())),
		meta: {
			label: "Status",
			variant: "select",
			options: [
				{ label: "Active", value: "Active" },
				{ label: "Inactive", value: "Inactive" },
				{ label: "Archived", value: "Archived" },
			],
		},
		size: 100,
	}),

	patientHelper.display({
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<Button
				render={
					<Link
						activeProps={{ className: "text-primary/80" }}
						className="inline-flex items-center gap-x-2.5 text-sm transition-colors hover:text-primary/80"
						params={{ id: row.original.id }}
						to="/app/patients/$id"
					>
						View
					</Link>
				}
				size="sm"
				variant="ghost"
			/>
		),
		size: 80,
	}),
]);

// ============================================================
// Appointment Columns
// ============================================================

const appointmentStatusVariants: Record<string, string> = {
	Scheduled: "default",
	"Checked In": "info",
	"In Progress": "warning",
	Completed: "success",
	Cancelled: "destructive",
	"No Show": "destructive",
};

export const appointmentColumns = appointmentHelper.columns([
	appointmentHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
	}),

	appointmentHelper.accessor("startTime", {
		id: "startTime",
		header: ({ header }) => <header.ColumnHeader title="Date/Time" />,
		cell: ({ getValue }) => renderDate(getValue(), true),
		meta: { label: "Date/Time", variant: "date" },
		size: 160,
	}),

	appointmentHelper.accessor("endTime", {
		id: "endTime",
		header: ({ header }) => <header.ColumnHeader title="End Time" />,
		cell: ({ getValue }) => renderDate(getValue(), true),
		meta: { label: "End Time", variant: "date" },
		size: 140,
	}),

	appointmentHelper.accessor("patient", {
		id: "patient",
		header: ({ header }) => <header.ColumnHeader title="Patient" />,
		cell: ({ getValue }) => {
			const patient = getValue() as Patient;
			if (!patient)
				return <span className="text-muted-foreground">—</span>;
			const age = calculatePediatricAge(patient.dateOfBirth);
			return renderPatientName(patient, age);
		},
		meta: { label: "Patient", variant: "text" },
		size: 260,
	}),

	appointmentHelper.accessor("staff", {
		id: "staff",
		header: ({ header }) => <header.ColumnHeader title="Provider" />,
		cell: ({ getValue }) => {
			const staff = getValue() as Staff;
			return staff ? (
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">{staff.name}</span>
					<Badge
						className="text-[10px]"
						variant="outline"
					>
						{staff.role}
					</Badge>
				</div>
			) : (
				<span className="text-muted-foreground text-sm">—</span>
			);
		},
		meta: { label: "Provider", variant: "select" },
		size: 180,
	}),

	appointmentHelper.accessor("type", {
		id: "type",
		header: ({ header }) => <header.ColumnHeader title="Type" />,
		cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
		meta: {
			label: "Type",
			variant: "select",
			options: [
				{ label: "Well-Child Check", value: "Well-Child Check" },
				{ label: "Sick Visit", value: "Sick Visit" },
				{ label: "Follow-Up", value: "Follow-Up" },
				{ label: "Immunization Visit", value: "Immunization Visit" },
				{ label: "Consultation", value: "Consultation" },
				{ label: "Telehealth", value: "Telehealth" },
			],
		},
		size: 140,
	}),

	appointmentHelper.accessor("status", {
		id: "status",
		header: ({ header }) => <header.ColumnHeader title="Status" />,
		cell: ({ getValue }) =>
			renderStatusBadge(getValue(), appointmentStatusVariants),
		meta: {
			label: "Status",
			variant: "select",
			options: [
				{ label: "Scheduled", value: "Scheduled" },
				{ label: "Checked In", value: "Checked In" },
				{ label: "In Progress", value: "In Progress" },
				{ label: "Completed", value: "Completed" },
				{ label: "Cancelled", value: "Cancelled" },
				{ label: "No Show", value: "No Show" },
			],
		},
		size: 120,
	}),

	appointmentHelper.display({
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<div className="flex items-center gap-1">
				<Button
					render={
						<Link
							params={{ id: row.original.id }}
							to={"/app/appointments/$id"}
						/>
					}
					size="sm"
					variant="ghost"
				>
					View
				</Button>
				<Button
					className="h-8 w-8 p-0"
					size="sm"
					variant="ghost"
				>
					<span className="sr-only">More</span>
					{/* Dropdown menu for more actions */}
				</Button>
			</div>
		),
		maxSize: 120,
		enableHiding: false,
	}),
]);
// ============================================================
// Staff Columns
// ============================================================

export const staffColumns = staffHelper.columns([
	staffHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
	}),

	staffHelper.accessor("name", {
		id: "name",
		header: ({ header }) => <header.ColumnHeader title="Name" />,
		cell: ({ getValue, row }) => {
			const name = getValue();
			const staff = row.original;
			return (
				<div className="flex items-center gap-3">
					<div
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold text-sm text-white"
						style={{
							backgroundColor: staff.avatarColor || "#6B7280",
						}}
					>
						{name
							.split(" ")
							.map((n) => n[0])
							.join("")
							.toUpperCase()
							.slice(0, 2)}
					</div>
					<div>
						<div className="font-medium text-foreground">
							{name}
						</div>
						<div className="text-muted-foreground text-xs">
							{staff.title}
						</div>
					</div>
				</div>
			);
		},
		meta: { label: "Name", variant: "text" },
		size: 220,
	}),

	staffHelper.accessor("email", {
		id: "email",
		header: ({ header }) => <header.ColumnHeader title="Email" />,
		cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
		meta: { label: "Email", variant: "text" },
		size: 200,
	}),

	staffHelper.accessor("role", {
		id: "role",
		header: ({ header }) => <header.ColumnHeader title="Role" />,
		cell: ({ getValue }) => renderStatusBadge(getValue()),
		meta: {
			label: "Role",
			variant: "select",
			options: [
				{ label: "Admin", value: "admin" },
				{ label: "Doctor", value: "doctor" },
				{ label: "Staff", value: "staff" },
			],
		},
		size: 100,
	}),

	staffHelper.accessor("specialty", {
		id: "specialty",
		header: ({ header }) => <header.ColumnHeader title="Specialty" />,
		cell: ({ getValue }) => (
			<span className="text-sm">{getValue() || "—"}</span>
		),
		meta: { label: "Specialty", variant: "text" },
		size: 150,
	}),

	staffHelper.accessor("isActive", {
		id: "isActive",
		header: ({ header }) => <header.ColumnHeader title="Status" />,
		cell: ({ getValue }) => (
			<Badge variant={getValue() === true ? "default" : "secondary"}>
				{getValue() === true ? "Active" : "Inactive"}
			</Badge>
		),
		meta: {
			label: "Status",
			variant: "select",
			options: [
				{ label: "Active", value: "true" },
				{ label: "Inactive", value: "false" },
			],
		},
		size: 100,
	}),

	staffHelper.display({
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<Button
				render={
					<Link
						params={{ staffId: row.original.id }}
						to="/app/staff/$staffId"
					>
						View
					</Link>
				}
				size="sm"
				variant="ghost"
			/>
		),
		maxSize: 80,
		enableHiding: false,
	}),
]);

// ============================================================
// Encounter Columns
// ============================================================

export const encounterColumns = encounterHelper.columns([
	encounterHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
		enableResizing: false,
	}),

	encounterHelper.accessor("encounterDate", {
		id: "encounterDate",
		header: ({ header }) => <header.ColumnHeader />,
		cell: ({ cell }) => <cell.DateCell />,
		size: 160,
		meta: { label: "Date", variant: "date" },
	}),

	encounterHelper.accessor("patient", {
		id: "patient",
		header: ({ header }) => <header.ColumnHeader />,
		cell: ({ getValue }) => {
			const patient = getValue() as Patient;
			if (!patient)
				return <span className="text-muted-foreground">—</span>;
			const age = calculatePediatricAge(patient.dateOfBirth);
			return renderPatientName(patient, age);
		},
		size: 260,
		meta: { label: "Patient", variant: "text" },
	}),

	encounterHelper.accessor("visitType", {
		id: "visitType",
		header: ({ header }) => <header.ColumnHeader />,
		cell: ({ cell }) => <cell.TextCell />,
		size: 150,
		meta: {
			label: "Visit Type",
			variant: "select",
			options: [
				{ label: "Well-Child Check", value: "Well-Child Check" },
				{ label: "Sick Visit", value: "Sick Visit" },
				{ label: "Follow-Up", value: "Follow-Up" },
				{ label: "Immunization Visit", value: "Immunization Visit" },
				{ label: "Emergency/Urgent", value: "Emergency/Urgent" },
				{ label: "Telehealth", value: "Telehealth" },
			],
		},
	}),

	encounterHelper.accessor("chiefComplaint", {
		id: "chiefComplaint",
		header: ({ header }) => <header.ColumnHeader />,
		cell: ({ getValue }) => (
			<span className="line-clamp-2 text-sm">{getValue() || "—"}</span>
		),
		size: 200,
		meta: { label: "Chief Complaint", variant: "text" },
	}),

	encounterHelper.accessor("status", {
		id: "status",
		header: ({ header }) => <header.ColumnHeader />,
		cell: ({ cell }) => <cell.StatusCell />,
		size: 100,
		meta: {
			label: "Status",
			variant: "select",
			options: [
				{ label: "Draft", value: "Draft" },
				{ label: "Completed", value: "Completed" },
				{ label: "Signed", value: "Signed" },
				{ label: "Amended", value: "Amended" },
			],
		},
	}),

	encounterHelper.display({
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<Button
				render={
					<Link
						params={{ id: row.original.id }}
						to="/app/encounters/$id"
					>
						View
					</Link>
				}
				size="sm"
				variant="ghost"
			/>
		),
		maxSize: 80,
		enableHiding: false,
		enableResizing: false,
	}),
]);

// ============================================================
// Vital Signs Columns
// ============================================================

export const vitalColumns = vitalHelper.columns([
	vitalHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
	}),
	vitalHelper.accessor("recordedAt", {
		id: "recordedAt",
		header: ({ header }) => <header.ColumnHeader title="Recorded" />,
		cell: ({ getValue }) => renderDate(getValue(), true),
		meta: { label: "Recorded", variant: "date" },
		size: 150,
	}),

	vitalHelper.accessor("temperatureC", {
		id: "temperatureC",
		header: ({ header }) => <header.ColumnHeader title="Temp (°C)" />,
		cell: ({ getValue }) => {
			const temp = getValue();
			const classification = getFeverClassification(temp);
			return (
				<div
					className={cn(
						"font-medium",
						classification.color.split(" ")[0]
					)}
				>
					{temp.toFixed(1)}°C
				</div>
			);
		},
		meta: { label: "Temperature", variant: "number" },
		size: 100,
	}),

	vitalHelper.accessor("heartRateBpm", {
		id: "heartRateBpm",
		header: ({ header }) => <header.ColumnHeader title="HR (bpm)" />,
		cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
		meta: { label: "Heart Rate", variant: "number" },
		size: 80,
	}),

	vitalHelper.accessor("respiratoryRateBpm", {
		id: "respiratoryRateBpm",
		header: ({ header }) => <header.ColumnHeader title="RR (bpm)" />,
		cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
		meta: { label: "Respiratory Rate", variant: "number" },
		size: 80,
	}),

	vitalHelper.accessor("oxygenSaturationPercent", {
		id: "oxygenSaturationPercent",
		header: ({ header }) => <header.ColumnHeader title="SpO₂ (%)" />,
		cell: ({ getValue }) => {
			const spo2 = getValue();
			return (
				<span
					className={cn("font-mono", spo2 < 95 && "text-destructive")}
				>
					{spo2}%
				</span>
			);
		},
		meta: { label: "Oxygen Saturation", variant: "number" },
		size: 80,
	}),

	vitalHelper.accessor("painScore", {
		id: "painScore",
		header: ({ header }) => <header.ColumnHeader title="Pain" />,
		cell: ({ getValue }) => {
			const score = getValue() || 0;
			const emojis = ["😊", "🙂", "😐", "😟", "😣", "😭"];
			return (
				<div className="flex items-center gap-1.5">
					<span>{emojis[Math.min(Math.floor(score / 2), 5)]}</span>
					<span className="font-mono text-xs">{score}/10</span>
				</div>
			);
		},
		meta: { label: "Pain Score", variant: "number" },
		size: 90,
	}),

	vitalHelper.accessor("weightKg", {
		id: "weightKg",
		header: ({ header }) => <header.ColumnHeader title="Weight (kg)" />,
		cell: ({ getValue }) => (
			<span className="font-mono">{getValue()?.toFixed(1) ?? "—"}</span>
		),
		meta: { label: "Weight", variant: "number" },
		size: 90,
	}),
]);

// ============================================================
// Growth Measurement Columns
// ============================================================

export const growthColumns = growthHelper.columns([
	growthHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
	}),
	growthHelper.accessor("ageMonths", {
		id: "ageMonths",
		header: ({ header }) => <header.ColumnHeader title="Age (months)" />,
		cell: ({ getValue }) => (
			<span className="font-mono">{getValue().toFixed(1)}</span>
		),
		meta: { label: "Age", variant: "number" },
		size: 100,
	}),

	growthHelper.accessor("weightKg", {
		id: "weightKg",
		header: ({ header }) => <header.ColumnHeader title="Weight (kg)" />,
		cell: ({ getValue }) => (
			<span className="font-mono">{getValue().toFixed(2)}</span>
		),
		meta: { label: "Weight", variant: "number" },
		size: 100,
	}),

	growthHelper.accessor("heightCm", {
		id: "heightCm",
		header: ({ header }) => <header.ColumnHeader title="Height (cm)" />,
		cell: ({ getValue }) => (
			<span className="font-mono">{getValue().toFixed(1)}</span>
		),
		meta: { label: "Height", variant: "number" },
		size: 100,
	}),

	growthHelper.accessor("headCircumferenceCm", {
		id: "headCircumferenceCm",
		header: ({ header }) => <header.ColumnHeader title="Head (cm)" />,
		cell: ({ getValue }) => (
			<span className="font-mono">{getValue()?.toFixed(1) ?? "—"}</span>
		),
		meta: { label: "Head Circumference", variant: "number" },
		size: 100,
	}),

	growthHelper.accessor("bmi", {
		id: "bmi",
		header: ({ header }) => <header.ColumnHeader title="BMI" />,
		cell: ({ getValue }) => (
			<span className="font-mono">{getValue().toFixed(1)}</span>
		),
		meta: { label: "BMI", variant: "number" },
		size: 80,
	}),

	growthHelper.accessor("weightForAgePercentile", {
		id: "weightForAgePercentile",
		header: ({ header }) => <header.ColumnHeader title="Weight %ile" />,
		cell: ({ getValue }) => {
			const percentile = getValue();
			if (percentile === null)
				return <span className="text-muted-foreground">—</span>;
			return (
				<Badge
					variant={
						percentile < 5 || percentile > 95
							? "destructive"
							: "secondary"
					}
				>
					{percentile}%
				</Badge>
			);
		},
		meta: { label: "Weight Percentile", variant: "number" },
		size: 100,
	}),

	growthHelper.accessor("heightForAgePercentile", {
		id: "heightForAgePercentile",
		header: ({ header }) => <header.ColumnHeader title="Height %ile" />,
		cell: ({ getValue }) => {
			const percentile = getValue();
			if (percentile === null)
				return <span className="text-muted-foreground">—</span>;
			return (
				<Badge
					variant={
						percentile < 5 || percentile > 95
							? "destructive"
							: "secondary"
					}
				>
					{percentile}%
				</Badge>
			);
		},
		meta: { label: "Height Percentile", variant: "number" },
		size: 100,
	}),

	growthHelper.accessor("recordedAt", {
		id: "recordedAt",
		header: ({ header }) => <header.ColumnHeader title="Recorded" />,
		cell: ({ getValue }) => renderDate(getValue()),
		meta: { label: "Recorded", variant: "date" },
		size: 120,
	}),
]);

// ============================================================
// Immunization Columns
// ============================================================

export const immunizationColumns = immunizationHelper.columns([
	immunizationHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
	}),
	immunizationHelper.accessor("vaccineName", {
		id: "vaccineName",
		header: ({ header }) => <header.ColumnHeader title="Vaccine" />,
		cell: ({ getValue }) => (
			<span className="font-medium">{getValue()}</span>
		),
		meta: { label: "Vaccine", variant: "text" },
		size: 200,
	}),

	immunizationHelper.accessor("doseNumber", {
		id: "doseNumber",
		header: ({ header }) => <header.ColumnHeader title="Dose" />,
		cell: ({ getValue, row }) => {
			const dose = getValue();
			const total = row.original.totalDoses;
			return (
				<span>
					Dose {dose}
					{total ? `/${total}` : ""}
				</span>
			);
		},
		meta: { label: "Dose", variant: "number" },
		size: 80,
	}),

	immunizationHelper.accessor("targetDisease", {
		id: "targetDisease",
		header: ({ header }) => <header.ColumnHeader title="Disease" />,
		cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
		meta: { label: "Target Disease", variant: "text" },
		size: 160,
	}),

	immunizationHelper.accessor("dueDate", {
		id: "dueDate",
		header: ({ header }) => <header.ColumnHeader title="Due Date" />,
		cell: ({ getValue }) => renderDate(getValue()),
		meta: { label: "Due Date", variant: "date" },
		size: 120,
	}),

	immunizationHelper.accessor("administeredDate", {
		id: "administeredDate",
		header: ({ header }) => <header.ColumnHeader title="Administered" />,
		cell: ({ getValue }) =>
			getValue() ? (
				renderDate(getValue() ?? new Date())
			) : (
				<span className="text-muted-foreground">—</span>
			),
		meta: { label: "Administered", variant: "date" },
		size: 120,
	}),

	immunizationHelper.accessor("status", {
		id: "status",
		header: ({ header }) => <header.ColumnHeader title="Status" />,
		cell: ({ getValue }) => renderStatusBadge(getValue()),
		meta: {
			label: "Status",
			variant: "select",
			options: [
				{ label: "Administered", value: "Administered" },
				{ label: "Due", value: "Due" },
				{ label: "Overdue", value: "Overdue" },
				{ label: "Upcoming", value: "Upcoming" },
				{ label: "Deferred", value: "Deferred" },
				{ label: "Refused", value: "Refused" },
			],
		},
		size: 120,
	}),

	immunizationHelper.display({
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<Button
				render={
					<Link
						params={{ id: row.original.id }}
						to="/app/immunizations/$id"
					>
						View
					</Link>
				}
				size="sm"
				variant="ghost"
			/>
		),
		maxSize: 80,
		enableHiding: false,
	}),
]);

// ============================================================
// Prescription Columns
// ============================================================

export const prescriptionColumns = prescriptionHelper.columns([
	prescriptionHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
	}),
	prescriptionHelper.accessor("rxNumber", {
		id: "rxNumber",
		header: ({ header }) => <header.ColumnHeader title="Rx #" />,
		cell: ({ getValue }) => (
			<span className="font-mono text-sm">{getValue()}</span>
		),
		meta: { label: "Rx Number", variant: "text" },
		size: 120,
	}),

	prescriptionHelper.accessor("patient", {
		id: "patient",
		header: ({ header }) => <header.ColumnHeader title="Patient" />,
		cell: ({ getValue }) => {
			const patient = getValue() as Patient;
			if (!patient)
				return <span className="text-muted-foreground">—</span>;
			return (
				<span>
					{patient.firstName} {patient.lastName}
				</span>
			);
		},
		meta: { label: "Patient", variant: "text" },
		size: 180,
	}),

	prescriptionHelper.accessor("prescriptionItems", {
		id: "medication",
		header: ({ header }) => <header.ColumnHeader title="Medication" />,
		cell: ({ getValue }) => {
			const items = getValue() as Array<{ medicationName: string }>;
			if (!items.length)
				return <span className="text-muted-foreground">—</span>;
			return (
				<span className="font-medium">{items[0]?.medicationName}</span>
			);
		},
		meta: { label: "Medication", variant: "text" },
		size: 180,
	}),

	prescriptionHelper.accessor("diagnosis", {
		id: "diagnosis",
		header: ({ header }) => <header.ColumnHeader title="Diagnosis" />,
		cell: ({ getValue }) => (
			<span className="line-clamp-1 text-sm">{getValue() || "—"}</span>
		),
		meta: { label: "Diagnosis", variant: "text" },
		size: 150,
	}),

	prescriptionHelper.accessor("prescribedDate", {
		id: "prescribedDate",
		header: ({ header }) => <header.ColumnHeader title="Prescribed" />,
		cell: ({ getValue }) => renderDate(getValue()),
		meta: { label: "Prescribed", variant: "date" },
		size: 120,
	}),

	prescriptionHelper.accessor("status", {
		id: "status",
		header: ({ header }) => <header.ColumnHeader title="Status" />,
		cell: ({ getValue }) => renderStatusBadge(getValue()),
		meta: {
			label: "Status",
			variant: "select",
			options: [
				{ label: "Active", value: "Active" },
				{ label: "Completed", value: "Completed" },
				{ label: "Discontinued", value: "Discontinued" },
				{ label: "Cancelled", value: "Cancelled" },
			],
		},
		size: 120,
	}),
]);

// ============================================================
// Lab Order Columns
// ============================================================

export const labColumns = labHelper.columns([
	labHelper.display({
		id: "select",
		header: ({ header }) => <header.SelectAllHeader />,
		cell: ({ cell }) => <cell.SelectCell />,
		maxSize: 40,
		enableSorting: false,
		enableHiding: false,
	}),
	labHelper.accessor("orderNumber", {
		id: "orderNumber",
		header: ({ header }) => <header.ColumnHeader title="Order #" />,
		cell: ({ getValue }) => (
			<span className="font-mono text-sm">{getValue()}</span>
		),
		meta: { label: "Order Number", variant: "text" },
		size: 120,
	}),

	labHelper.accessor("patient", {
		id: "patient",
		header: ({ header }) => <header.ColumnHeader title="Patient" />,
		cell: ({ getValue }) => {
			const patient = getValue() as Patient;
			if (!patient)
				return <span className="text-muted-foreground">—</span>;
			return (
				<span>
					{patient.firstName} {patient.lastName}
				</span>
			);
		},
		meta: { label: "Patient", variant: "text" },
		size: 180,
	}),

	labHelper.accessor("testsJson", {
		id: "tests",
		header: ({ header }) => <header.ColumnHeader title="Tests" />,
		cell: ({ getValue }) => {
			const tests = getValue() as Array<{ testName: string }>;
			if (!tests.length)
				return <span className="text-muted-foreground">—</span>;
			return (
				<div className="flex flex-wrap gap-1">
					{tests.slice(0, 2).map((test, i) => (
						<Badge
							className="text-[10px]"
							key={i}
							variant="outline"
						>
							{test.testName}
						</Badge>
					))}
					{tests.length > 2 && (
						<Badge
							className="text-[10px]"
							variant="secondary"
						>
							+{tests.length - 2}
						</Badge>
					)}
				</div>
			);
		},
		meta: { label: "Tests", variant: "text" },
		size: 180,
	}),

	labHelper.accessor("priority", {
		id: "priority",
		header: ({ header }) => <header.ColumnHeader title="Priority" />,
		cell: ({ getValue }) => {
			const priority = getValue();
			const variants: Record<
				string,
				"secondary" | "destructive" | "outline"
			> = {
				Routine: "secondary",
				Urgent: "outline",
				Stat: "destructive",
			};
			return (
				<Badge variant={variants[priority] || "secondary"}>
					{priority}
				</Badge>
			);
		},
		meta: {
			label: "Priority",
			variant: "select",
			options: [
				{ label: "Routine", value: "Routine" },
				{ label: "Urgent", value: "Urgent" },
				{ label: "Stat", value: "Stat" },
			],
		},
		size: 100,
	}),

	labHelper.accessor("status", {
		id: "status",
		header: ({ header }) => <header.ColumnHeader title="Status" />,
		cell: ({ getValue }) => renderStatusBadge(getValue()),
		meta: {
			label: "Status",
			variant: "select",
			options: [
				{ label: "Ordered", value: "Ordered" },
				{ label: "Sample Collected", value: "Sample Collected" },
				{ label: "Processing", value: "Processing" },
				{ label: "Completed", value: "Completed" },
				{ label: "Cancelled", value: "Cancelled" },
			],
		},
		size: 130,
	}),

	labHelper.accessor("orderDate", {
		id: "orderDate",
		header: ({ header }) => <header.ColumnHeader title="Order Date" />,
		cell: ({ getValue }) => renderDate(getValue()),
		meta: { label: "Order Date", variant: "date" },
		size: 120,
	}),
]);

// ============================================================
// Export All Columns
// ============================================================

export const allColumns = {
	patients: patientColumns,
	appointments: appointmentColumns,
	staff: staffColumns,
	encounters: encounterColumns,
	vitals: vitalColumns,
	growth: growthColumns,
	immunizations: immunizationColumns,
	prescriptions: prescriptionColumns,
	labs: labColumns,
};

export type ColumnMap = typeof allColumns;
