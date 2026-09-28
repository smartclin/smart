// src/components/appointments/AppointmentCard.tsx

import type { Appointment, Patient, Staff } from "@smart/db/schema";
import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Separator } from "@smart/ui/components/separator";
import { cn } from "@smart/ui/lib/utils";
import { calculatePediatricAge } from "@smart/utils/index";
import {
	AlertTriangle,
	CalendarDays,
	CheckCircle2,
	ClipboardList,
	Clock,
	FileText,
	Stethoscope,
	User,
	UserCheck,
	XCircle,
} from "lucide-react";
import { useCallback, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type PatientSummary = Pick<
	Patient,
	| "id"
	| "firstName"
	| "lastName"
	| "mrn"
	| "dateOfBirth"
	| "gender"
	| "contactNumber"
	| "allergies"
>;

type StaffSummary = Pick<Staff, "id" | "name" | "role" | "title">;

export type AppointmentWithRelations = Appointment & {
	patient?: PatientSummary | null;
	staff?: StaffSummary | null;
};

type AppointmentStatus = NonNullable<Appointment["status"]>;

export interface AppointmentCardProps {
	appointment: AppointmentWithRelations;
	className?: string;
	onClose?: () => void;
	onEdit?: () => void;
	onPatientSelect?: (patientId: string) => void;
	onStatusChange?: (next: AppointmentStatus) => void | Promise<void>;
	onSuccess?: () => void;
	readOnly?: boolean;
	variant?: "card" | "compact" | "banner";
}

// ─── Status config ──────────────────────────────────────────────────────────

type StatusConfig = {
	label: string;
	badgeVariant: "default" | "secondary" | "destructive" | "outline";
	accent: string;
	icon: React.ComponentType<{ className?: string }>;
	next?: {
		label: string;
		status: AppointmentStatus;
		variant: "default" | "outline" | "destructive";
	};
};

const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
	Scheduled: {
		label: "Scheduled",
		badgeVariant: "default",
		accent: "bg-blue-500",
		icon: CalendarDays,
		next: { label: "Check in", status: "Checked In", variant: "default" },
	},
	"Checked In": {
		label: "Checked In",
		badgeVariant: "secondary",
		accent: "bg-amber-500",
		icon: UserCheck,
		next: {
			label: "Start visit",
			status: "In Progress",
			variant: "default",
		},
	},
	"In Progress": {
		label: "In Progress",
		badgeVariant: "default",
		accent: "bg-emerald-500",
		icon: Stethoscope,
		next: {
			label: "Mark completed",
			status: "Completed",
			variant: "default",
		},
	},
	Completed: {
		label: "Completed",
		badgeVariant: "outline",
		accent: "bg-slate-400",
		icon: CheckCircle2,
	},
	Cancelled: {
		label: "Cancelled",
		badgeVariant: "destructive",
		accent: "bg-rose-500",
		icon: XCircle,
	},
	"No Show": {
		label: "No Show",
		badgeVariant: "destructive",
		accent: "bg-rose-500",
		icon: AlertTriangle,
	},
};

// ─── Formatters ─────────────────────────────────────────────────────────────

const DATE_FMT = new Intl.DateTimeFormat(undefined, {
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat(undefined, {
	hour: "numeric",
	minute: "2-digit",
});

function toDate(d: Date | string | null | undefined): Date | null {
	if (!d) return null;
	const date = d instanceof Date ? d : new Date(d);
	return Number.isNaN(date.getTime()) ? null : date;
}

function fmtDate(d: Date | string | null | undefined): string {
	const date = toDate(d);
	return date ? DATE_FMT.format(date) : "—";
}

function fmtTime(d: Date | string | null | undefined): string {
	const date = toDate(d);
	return date ? TIME_FMT.format(date) : "—";
}

function fmtRange(
	start: Date | string | null | undefined,
	end: Date | string | null | undefined
): string {
	const s = fmtTime(start);
	const e = fmtTime(end);
	if (s === "—") return e;
	if (e === "—") return s;
	return `${s} – ${e}`;
}

// ─── Allergy helpers ────────────────────────────────────────────────────────

type AllergyEntry = { allergen: string; severity?: string };

function normalizeAllergies(raw: unknown): AllergyEntry[] {
	if (!Array.isArray(raw)) return [];
	return raw
		.filter(
			(a): a is { allergen?: unknown; severity?: unknown } =>
				Boolean(a) && typeof a === "object"
		)
		.filter(
			(a): a is AllergyEntry =>
				typeof a.allergen === "string" && a.allergen.trim().length > 0
		);
}

function isAnaphylactic(a: AllergyEntry): boolean {
	return (a.severity ?? "").toLowerCase() === "anaphylactic";
}

// ─── Relative day ───────────────────────────────────────────────────────────

function relativeDayLabel(
	target: Date | string | null | undefined
): string | null {
	const d = toDate(target);
	if (!d) return null;

	const now = new Date();
	const startOfDay = (x: Date) =>
		new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
	const diffDays = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000);

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays === -1) return "Yesterday";
	if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
	if (diffDays < -1 && diffDays >= -7)
		return `${Math.abs(diffDays)} days ago`;
	return null;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function InfoRow({
	icon: Icon,
	label,
	value,
	muted,
	mono,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: React.ReactNode;
	muted?: boolean;
	mono?: boolean;
}) {
	return (
		<div className="flex items-start gap-2.5">
			<Icon
				aria-hidden="true"
				className="mt-0.5 size-4 shrink-0 text-muted-foreground"
			/>
			<div className="min-w-0">
				<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
					{label}
				</p>
				<p
					className={cn(
						"truncate font-medium text-sm",
						muted && "text-muted-foreground",
						mono && "font-mono tabular-nums"
					)}
				>
					{value}
				</p>
			</div>
		</div>
	);
}

function PatientAvatar({
	firstName,
	lastName,
	gender,
}: {
	firstName: string;
	lastName: string;
	gender?: string | null;
}) {
	const initials =
		`${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
	const isMale = gender === "male";
	return (
		<div
			aria-hidden="true"
			className={cn(
				"flex size-11 shrink-0 items-center justify-center rounded-xl border font-bold text-sm shadow-sm",
				isMale
					? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400"
					: "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-400"
			)}
		>
			{initials}
		</div>
	);
}

function AllergyPill({ allergy }: { allergy: AllergyEntry }) {
	const severe = isAnaphylactic(allergy);
	return (
		<Badge
			className={cn(
				"gap-1 border font-semibold text-[10px]",
				severe
					? "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
					: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
			)}
			variant="outline"
		>
			<AlertTriangle
				aria-hidden="true"
				className="size-3"
			/>
			{allergy.allergen}
			{severe ? " · anaphylaxis" : ""}
		</Badge>
	);
}

/**
 * Patient identity row — reused by the card variant and compact variant.
 * Renders the "Unassigned patient" placeholder when `patient` is null.
 */
function PatientIdentity({
	ageInfo,
	allergies,
	compact = false,
	onPatientSelect,
	patient,
}: {
	ageInfo: ReturnType<typeof calculatePediatricAge> | null;
	allergies: AllergyEntry[];
	compact?: boolean;
	onPatientSelect?: (id: string) => void;
	patient: PatientSummary | null;
}) {
	if (!patient) {
		return (
			<div className="flex items-center gap-2.5">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
					<User className="size-4" />
				</div>
				<div className="min-w-0">
					<p className="truncate font-semibold text-sm">
						Unassigned patient
					</p>
					<p className="text-muted-foreground text-xs">
						Patient record unavailable
					</p>
				</div>
			</div>
		);
	}

	const fullName = `${patient.firstName} ${patient.lastName}`;

	return (
		<div className="flex items-start gap-3">
			<PatientAvatar
				firstName={patient.firstName}
				gender={patient.gender}
				lastName={patient.lastName}
			/>
			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex flex-wrap items-center gap-2">
					{onPatientSelect ? (
						<button
							className="truncate rounded-sm text-start font-semibold text-base hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							onClick={() => onPatientSelect(patient.id)}
							type="button"
						>
							{fullName}
						</button>
					) : (
						<span className="truncate font-semibold text-base">
							{fullName}
						</span>
					)}
					{ageInfo ? (
						<Badge
							className="text-[10px]"
							variant="outline"
						>
							{ageInfo.displayString} · {ageInfo.ageGroup}
						</Badge>
					) : null}
				</div>

				{compact ? null : (
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
						<span className="font-mono">{patient.mrn}</span>
						<span className="capitalize">{patient.gender}</span>
						{patient.contactNumber ? (
							<span>{patient.contactNumber}</span>
						) : null}
					</div>
				)}

				{allergies.length > 0 ? (
					<div className="mt-2 flex flex-wrap gap-1.5">
						{allergies.map((a) => (
							<AllergyPill
								allergy={a}
								key={a.allergen}
							/>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
}

/**
 * Action row — reused by compact and card variants.
 */
function ActionRow({
	config,
	onPatientSelect,
	onStatusChange,
	patient,
	readOnly,
	showClose,
	onClose,
	status,
	size = "default",
}: {
	config: StatusConfig;
	onEdit?: () => void;
	onPatientSelect?: (id: string) => void;
	onStatusChange?: (next: AppointmentStatus) => void | Promise<void>;
	patient: PatientSummary | null;
	readOnly: boolean;
	showClose?: boolean;
	onClose?: () => void;
	status: AppointmentStatus;
	size?: "default" | "sm";
}) {
	if (readOnly) return null;

	const buttonClass = size === "sm" ? "h-7 px-2 text-xs" : undefined;

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<div className="flex flex-wrap gap-2">
				{showClose && onClose ? (
					<Button
						className={buttonClass}
						onClick={onClose}
						size={size}
						variant="ghost"
					>
						Back
					</Button>
				) : null}
				{patient && onPatientSelect ? (
					<Button
						className={buttonClass}
						onClick={() => onPatientSelect(patient.id)}
						size={size}
						variant="outline"
					>
						<User
							aria-hidden="true"
							className="me-1.5 size-4"
						/>
						Open patient chart
					</Button>
				) : null}
			</div>

			<div className="flex flex-wrap gap-2">
				{status !== "Cancelled" &&
				status !== "No Show" &&
				status !== "Completed" ? (
					<Button
						className={buttonClass}
						onClick={() => onStatusChange?.("Cancelled")}
						size={size}
						variant="outline"
					>
						<XCircle
							aria-hidden="true"
							className="me-1.5 size-4"
						/>
						Cancel
					</Button>
				) : null}
				{config.next ? (
					<Button
						className={buttonClass}
						onClick={() => onStatusChange?.(config.next!.status)}
						size={size}
						variant={config.next.variant}
					>
						<CheckCircle2
							aria-hidden="true"
							className="me-1.5 size-4"
						/>
						{config.next.label}
					</Button>
				) : null}
			</div>
		</div>
	);
}

// ─── Main component ─────────────────────────────────────────────────────────

export function AppointmentCard({
	appointment,
	onClose,
	onEdit,
	onPatientSelect,
	onSuccess,
	onStatusChange,
	readOnly = false,
	variant = "card",
	className,
}: AppointmentCardProps) {
	const status = (appointment.status ?? "Scheduled") as AppointmentStatus;
	const config = STATUS_CONFIG[status];
	const StatusIcon = config.icon;

	const patient = appointment.patient ?? null;
	const staff = appointment.staff ?? null;

	const allergies = useMemo(
		() => normalizeAllergies(patient?.allergies),
		[patient?.allergies]
	);

	const ageInfo = useMemo(
		() =>
			patient?.dateOfBirth
				? calculatePediatricAge(patient.dateOfBirth)
				: null,
		[patient?.dateOfBirth]
	);

	const relative = relativeDayLabel(appointment.appointmentDate);
	const timeRange = fmtRange(appointment.startTime, appointment.endTime);
	const dateLabel = fmtDate(appointment.appointmentDate);

	const handleAdvance = useCallback(async () => {
		if (!config.next) return;
		try {
			await onStatusChange?.(config.next.status);
			onSuccess?.();
		} catch {
			// Parent surfaces its own error toast.
		}
	}, [config.next, onStatusChange, onSuccess]);

	// ─── Banner variant ────────────────────────────────────────────────────
	if (variant === "banner") {
		return (
			<div
				className={cn(
					"relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
					className
				)}
			>
				<span
					aria-hidden="true"
					className={cn(
						"absolute inset-y-0 left-0 w-1",
						config.accent
					)}
				/>
				<div className="flex min-w-0 items-center gap-3 ps-2">
					{/* FIX: previously `if (!patient)` guarded a read of
					    patient.firstName, narrowing patient to `never`.
					    Now we render the avatar only when patient exists. */}
					{patient ? (
						<PatientAvatar
							firstName={patient.firstName}
							gender={patient.gender}
							lastName={patient.lastName}
						/>
					) : (
						<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
							<User className="size-4" />
						</div>
					)}
					<div className="min-w-0">
						<p className="truncate font-semibold text-sm">
							{patient
								? `${patient.firstName} ${patient.lastName}`
								: "Unassigned patient"}
							{relative ? (
								<span className="ms-2 font-normal text-muted-foreground text-xs">
									· {relative}
								</span>
							) : null}
						</p>
						<p className="truncate text-muted-foreground text-xs">
							{dateLabel} · {timeRange}
							{staff ? ` · ${staff.name}` : ""}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 ps-2 sm:ps-0">
					<Badge
						aria-live="polite"
						className="gap-1"
						variant={config.badgeVariant}
					>
						<StatusIcon
							aria-hidden="true"
							className="size-3"
						/>
						{config.label}
					</Badge>
					{!readOnly && config.next ? (
						<Button
							onClick={handleAdvance}
							size="sm"
							variant={config.next.variant}
						>
							{config.next.label}
						</Button>
					) : null}
					{!readOnly && onEdit ? (
						<Button
							onClick={onEdit}
							size="sm"
							variant="outline"
						>
							Edit
						</Button>
					) : null}
				</div>
			</div>
		);
	}

	// ─── Compact variant ───────────────────────────────────────────────────
	if (variant === "compact") {
		return (
			<div
				className={cn(
					"relative overflow-hidden rounded-lg border border-border bg-card p-3 shadow-sm",
					className
				)}
			>
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2.5">
						<PatientIdentity
							ageInfo={ageInfo}
							allergies={[]}
							compact
							onPatientSelect={onPatientSelect}
							patient={patient}
						/>
					</div>
					<Badge
						className="shrink-0 gap-1 text-[10px]"
						variant={config.badgeVariant}
					>
						<StatusIcon
							aria-hidden="true"
							className="size-3"
						/>
						{config.label}
					</Badge>
				</div>

				{allergies.length > 0 ? (
					<div className="mt-2 flex flex-wrap gap-1">
						{allergies.slice(0, 2).map((a) => (
							<AllergyPill
								allergy={a}
								key={a.allergen}
							/>
						))}
						{allergies.length > 2 ? (
							<Badge
								className="text-[10px]"
								variant="secondary"
							>
								+{allergies.length - 2}
							</Badge>
						) : null}
					</div>
				) : null}

				{!readOnly && (onPatientSelect || config.next || onEdit) ? (
					<div className="mt-2 flex flex-wrap gap-1.5">
						{patient && onPatientSelect ? (
							<Button
								className="h-7 px-2 text-xs"
								onClick={() => onPatientSelect(patient.id)}
								size="sm"
								variant="ghost"
							>
								Open chart
							</Button>
						) : null}
						{config.next ? (
							<Button
								className="h-7 px-2 text-xs"
								onClick={handleAdvance}
								size="sm"
								variant={config.next.variant}
							>
								{config.next.label}
							</Button>
						) : null}
						{onEdit ? (
							<Button
								className="h-7 px-2 text-xs"
								onClick={onEdit}
								size="sm"
								variant="outline"
							>
								Edit
							</Button>
						) : null}
					</div>
				) : null}
			</div>
		);
	}

	// ─── Card variant (default) ────────────────────────────────────────────
	return (
		<Card className={cn("overflow-hidden", className)}>
			<div className="relative">
				<span
					aria-hidden="true"
					className={cn(
						"absolute inset-y-0 left-0 w-1.5",
						config.accent
					)}
				/>
				<CardHeader className="flex flex-row items-center justify-between gap-3 ps-6 pb-3">
					<div className="flex items-center gap-2">
						<StatusIcon
							aria-hidden="true"
							className="size-4 text-muted-foreground"
						/>
						<CardTitle className="font-mono text-base tabular-nums">
							{appointment.id.slice(0, 8).toUpperCase()}
						</CardTitle>
						<Badge
							aria-live="polite"
							className="gap-1"
							variant={config.badgeVariant}
						>
							{config.label}
						</Badge>
						{relative ? (
							<Badge
								className="text-[10px]"
								variant="outline"
							>
								{relative}
							</Badge>
						) : null}
					</div>
					{!readOnly && onEdit ? (
						<Button
							onClick={onEdit}
							size="sm"
							variant="ghost"
						>
							<FileText
								aria-hidden="true"
								className="me-1.5 size-3.5"
							/>
							Edit
						</Button>
					) : null}
				</CardHeader>
			</div>

			<CardContent className="space-y-5 ps-6">
				<PatientIdentity
					ageInfo={ageInfo}
					allergies={allergies}
					onPatientSelect={onPatientSelect}
					patient={patient}
				/>

				<Separator />

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<InfoRow
						icon={CalendarDays}
						label="Date"
						value={dateLabel}
					/>
					<InfoRow
						icon={Clock}
						label="Time"
						mono
						value={timeRange}
					/>
					<InfoRow
						icon={ClipboardList}
						label="Visit type"
						value={appointment.type || "—"}
					/>
					<InfoRow
						icon={Stethoscope}
						label="Provider"
						muted={!staff}
						value={
							staff ? (
								<span className="flex items-center gap-2">
									{staff.name}
									{staff.role ? (
										<Badge
											className="text-[10px]"
											variant="outline"
										>
											{staff.role}
										</Badge>
									) : null}
								</span>
							) : (
								<span className="text-muted-foreground">
									Unassigned
								</span>
							)
						}
					/>
					{appointment.notes ? (
						<div className="sm:col-span-2">
							<InfoRow
								icon={FileText}
								label="Reason for visit"
								value={
									<span className="line-clamp-3 whitespace-pre-wrap font-normal">
										{appointment.notes}
									</span>
								}
							/>
						</div>
					) : null}
				</div>

				{readOnly ? null : (
					<>
						<Separator />
						<ActionRow
							config={config}
							onClose={onClose}
							onEdit={onEdit}
							onPatientSelect={onPatientSelect}
							onStatusChange={onStatusChange}
							patient={patient}
							readOnly={readOnly}
							showClose={Boolean(onClose)}
							status={status}
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
}
