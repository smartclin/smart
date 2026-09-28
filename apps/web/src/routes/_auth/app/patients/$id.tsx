// src/routes/_auth/app/patients/$id.tsx

import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Skeleton } from "@smart/ui/components/skeleton";
import { cn } from "@smart/ui/lib/utils";
import {
	calculatePediatricAge,
	formatPediatricAge,
	getFeverClassification,
} from "@smart/utils/index";
import {
	createFileRoute,
	Link,
	Outlet,
	useParams,
} from "@tanstack/react-router";
import {
	Activity,
	AlertTriangle,
	ArrowLeft,
	Calendar,
	FlaskConical,
	HeartPulse,
	type LucideIcon,
	Pencil,
	Pill,
	Syringe,
	User,
} from "lucide-react";

import { usePatientDashboard } from "@/hooks/use-patient-dashboard";
import { usePatientById } from "@/hooks/use-patients";

// ─────────────────────────────────────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_auth/app/patients/$id")({
	component: PatientLayout,
});

// ─────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────
// Only the Overview tab needs `exact: true` — otherwise it would stay
// highlighted when the user navigates into any of its sibling routes.

const TABS = [
	{
		to: "/app/patients/$id",
		label: "Overview",
		exact: true,
	},
	{
		to: "/app/patients/$id/encounters",
		label: "Encounters",
		exact: false,
	},
	{
		to: "/app/patients/$id/vitals",
		label: "Vitals",
		exact: false,
	},
	{
		to: "/app/patients/$id/growth",
		label: "Growth",
		exact: false,
	},
	{
		to: "/app/patients/$id/immunizations",
		label: "Immunizations",
		exact: false,
	},
	{
		to: "/app/patients/$id/prescriptions",
		label: "Prescriptions",
		exact: false,
	},
	{
		to: "/app/patients/$id/labs",
		label: "Labs",
		exact: false,
	},
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

function PatientLayout() {
	const { id: patientId } = useParams({
		from: "/_auth/app/patients/$id",
	});

	const { data: patient, isLoading } = usePatientById(patientId);

	if (isLoading) return <PatientHeaderSkeleton />;

	if (!patient) return <PatientNotFound />;

	const age = calculatePediatricAge(patient.dateOfBirth);
	const compactAge = formatPediatricAge(age.totalMonths, age.days);
	const initials = getInitials(patient.firstName, patient.lastName);

	return (
		<div className="space-y-6">
			{/* Back link */}
			<Button
				className="w-fit"
				render={
					<Link to="/app/patients">
						<ArrowLeft className="mr-2 size-4" />
						Back to Patients
					</Link>
				}
				size="sm"
				variant="ghost"
			/>

			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-4">
					<div
						className={cn(
							"flex size-14 shrink-0 items-center justify-center rounded-full font-bold text-lg",
							patient.gender === "male"
								? "bg-blue-100 text-blue-700"
								: "bg-pink-100 text-pink-700"
						)}
					>
						{initials}
					</div>
					<div>
						<h1 className="font-bold text-2xl tracking-tight">
							{patient.firstName} {patient.lastName}
						</h1>
						<div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
							<span className="font-mono">{patient.mrn}</span>
							<span aria-hidden="true">•</span>
							<span className="capitalize">{patient.gender}</span>
							<span aria-hidden="true">•</span>
							<span>{compactAge}</span>
							<Badge
								className="text-[10px]"
								variant="outline"
							>
								{age.ageGroup}
							</Badge>
						</div>
					</div>
				</div>

				<Button
					render={
						<Link
							params={{ id: patientId }}
							to="/app/patients/$id/edit"
						>
							<Pencil className="mr-2 size-4" />
							Edit
						</Link>
					}
					variant="outline"
				/>
			</div>

			{/* Tabs */}
			<nav
				aria-label="Patient sections"
				className="flex gap-1 overflow-x-auto border-border border-b pb-px"
			>
				{TABS.map((tab) => (
					<Link
						activeOptions={{ exact: tab.exact }}
						activeProps={{
							className: "border-b-2 border-primary text-primary",
						}}
						className="shrink-0 rounded-t-lg px-4 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
						key={tab.label}
						params={{ id: patientId }}
						to={tab.to}
					>
						{tab.label}
					</Link>
				))}
			</nav>

			<Outlet />
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Page (index route)
// ─────────────────────────────────────────────────────────────────────────────

export function PatientOverviewPage() {
	const { id: patientId } = useParams({
		from: "/_auth/app/patients/$id",
	});

	const {
		patient,
		encounters,
		vitals,
		growth,
		immunizations,
		prescriptions,
		labOrders,
		isLoading,
	} = usePatientDashboard(patientId);

	if (isLoading) return <OverviewSkeleton />;
	if (!patient) return null;

	const latestVital = vitals?.[0];
	const latestGrowth = growth?.at(-1);
	const activePrescriptions =
		prescriptions?.filter((p) => p.status === "Active") ?? [];
	const overdueImmunizations =
		immunizations?.filter((i) => i.status === "Overdue") ?? [];
	const pendingLabs =
		labOrders?.filter(
			(l) => l.status !== "Completed" && l.status !== "Cancelled"
		) ?? [];

	const hasAlerts = overdueImmunizations.length > 0 || pendingLabs.length > 0;

	return (
		<div className="space-y-6">
			{/* Quick stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<QuickStatCard
					icon={Calendar}
					patientId={patientId}
					title="Encounters"
					to="/app/patients/$id/encounters"
					value={encounters?.length ?? 0}
				/>
				<QuickStatCard
					badge={
						overdueImmunizations.length > 0
							? `${overdueImmunizations.length} overdue`
							: undefined
					}
					badgeVariant="destructive"
					icon={Syringe}
					patientId={patientId}
					title="Immunizations"
					to="/app/patients/$id/immunizations"
					value={immunizations?.length ?? 0}
				/>
				<QuickStatCard
					badge={
						activePrescriptions.length > 0 ? "Active" : undefined
					}
					badgeVariant="default"
					icon={Pill}
					patientId={patientId}
					title="Prescriptions"
					to="/app/patients/$id/prescriptions"
					value={activePrescriptions.length}
				/>
				<QuickStatCard
					badge={pendingLabs.length > 0 ? "Pending" : undefined}
					badgeVariant="secondary"
					icon={FlaskConical}
					patientId={patientId}
					title="Lab Orders"
					to="/app/patients/$id/labs"
					value={pendingLabs.length}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Latest Vitals */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<HeartPulse className="size-4 text-primary" />
							Latest Vitals
						</CardTitle>
						<Button
							render={
								<Link
									params={{ id: patientId }}
									to="/app/patients/$id/vitals"
								>
									View all
								</Link>
							}
							size="sm"
							variant="ghost"
						/>
					</CardHeader>
					<CardContent>
						{latestVital ? (
							<div className="grid grid-cols-2 gap-3">
								<VitalItem
									label="Temperature"
									severity={
										getFeverClassification(
											latestVital.temperatureC
										).severity
									}
									value={`${latestVital.temperatureC}°C`}
								/>
								<VitalItem
									label="Heart Rate"
									value={`${latestVital.heartRateBpm} bpm`}
								/>
								<VitalItem
									label="Resp. Rate"
									value={`${latestVital.respiratoryRateBpm}/min`}
								/>
								<VitalItem
									label="SpO₂"
									severity={
										latestVital.oxygenSaturationPercent < 95
											? "danger"
											: "normal"
									}
									value={`${latestVital.oxygenSaturationPercent}%`}
								/>
								{latestVital.weightKg !== null && (
									<VitalItem
										label="Weight"
										value={`${latestVital.weightKg} kg`}
									/>
								)}
								{latestVital.heightCm !== null && (
									<VitalItem
										label="Height"
										value={`${latestVital.heightCm} cm`}
									/>
								)}
							</div>
						) : (
							<EmptyState
								actionLabel="Record Vitals"
								actionTo="/app/patients/$id/vitals"
								description="Record the first set of vitals."
								icon={HeartPulse}
								patientId={patientId}
								title="No vitals recorded"
							/>
						)}
					</CardContent>
				</Card>

				{/* Latest Growth */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Activity className="size-4 text-primary" />
							Latest Growth
						</CardTitle>
						<Button
							render={
								<Link
									params={{ id: patientId }}
									to="/app/patients/$id/growth"
								>
									View charts
								</Link>
							}
							size="sm"
							variant="ghost"
						/>
					</CardHeader>
					<CardContent>
						{latestGrowth ? (
							<div className="grid grid-cols-2 gap-3">
								<VitalItem
									label="Weight"
									value={`${latestGrowth.weightKg} kg`}
								/>
								<VitalItem
									label="Height"
									value={`${latestGrowth.heightCm} cm`}
								/>
								<VitalItem
									label="BMI"
									value={`${latestGrowth.bmi}`}
								/>
								{latestGrowth.headCircumferenceCm !== null && (
									<VitalItem
										label="Head Circ."
										value={`${latestGrowth.headCircumferenceCm} cm`}
									/>
								)}
								{latestGrowth.weightForAgePercentile !==
									null && (
									<PercentileItem
										label="Weight %ile"
										value={
											latestGrowth.weightForAgePercentile
										}
									/>
								)}
								{latestGrowth.heightForAgePercentile !==
									null && (
									<PercentileItem
										label="Height %ile"
										value={
											latestGrowth.heightForAgePercentile
										}
									/>
								)}
							</div>
						) : (
							<EmptyState
								actionLabel="Record Growth"
								actionTo="/app/patients/$id/growth"
								description="Record a growth measurement."
								icon={Activity}
								patientId={patientId}
								title="No growth data"
							/>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Alerts */}
			{hasAlerts && (
				<Card className="border-amber-200 bg-amber-50/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-amber-800">
							<AlertTriangle className="size-4" />
							Clinical Alerts
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{overdueImmunizations.length > 0 && (
							<AlertRow
								description={overdueImmunizations
									.map((i) => i.vaccineName)
									.join(", ")}
								patientId={patientId}
								title={`${overdueImmunizations.length} overdue immunization${
									overdueImmunizations.length > 1 ? "s" : ""
								}`}
								to="/app/patients/$id/immunizations"
							/>
						)}
						{pendingLabs.length > 0 && (
							<AlertRow
								description="Awaiting results or processing"
								patientId={patientId}
								title={`${pendingLabs.length} pending lab order${
									pendingLabs.length > 1 ? "s" : ""
								}`}
								to="/app/patients/$id/labs"
							/>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick stat card
// ─────────────────────────────────────────────────────────────────────────────

function QuickStatCard({
	title,
	value,
	icon: Icon,
	to,
	patientId,
	badge,
	badgeVariant,
}: {
	title: string;
	value: number;
	icon: LucideIcon;
	/** Full route path — must include the `_auth` layout prefix. */
	to: string;
	patientId: string;
	badge?: string;
	badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}) {
	return (
		<Link
			className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
			params={{ id: patientId }}
			to={to}
		>
			<div className="flex items-center justify-between">
				<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
					<Icon className="size-5 text-primary" />
				</div>
				{badge !== undefined && (
					<Badge
						className="text-[10px]"
						variant={badgeVariant ?? "default"}
					>
						{badge}
					</Badge>
				)}
			</div>
			<p className="mt-3 font-bold text-2xl tabular-nums">{value}</p>
			<p className="text-muted-foreground text-sm">{title}</p>
		</Link>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Alert row
// ─────────────────────────────────────────────────────────────────────────────

function AlertRow({
	title,
	description,
	to,
	patientId,
}: {
	title: string;
	description: string;
	to: string;
	patientId: string;
}) {
	return (
		<div className="flex items-center justify-between rounded-lg bg-white p-3">
			<div>
				<p className="font-medium text-sm">{title}</p>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
			<Button
				render={
					<Link
						params={{ id: patientId }}
						to={to}
					>
						Review
					</Link>
				}
				size="sm"
				variant="outline"
			/>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Small pieces
// ─────────────────────────────────────────────────────────────────────────────

function VitalItem({
	label,
	value,
	severity = "normal",
}: {
	label: string;
	value: string;
	severity?: "normal" | "warning" | "danger";
}) {
	const colorClass =
		severity === "danger"
			? "text-destructive"
			: severity === "warning"
				? "text-amber-600"
				: "text-foreground";

	return (
		<div className="rounded-lg border border-border bg-muted/30 p-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p
				className={cn(
					"mt-0.5 font-bold text-lg tabular-nums",
					colorClass
				)}
			>
				{value}
			</p>
		</div>
	);
}

function PercentileItem({ label, value }: { label: string; value: number }) {
	const isAbnormal = value < 5 || value > 95;
	return (
		<div className="rounded-lg border border-border bg-muted/30 p-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<div className="mt-0.5 flex items-center gap-2">
				<p className="font-bold text-lg tabular-nums">{value}%</p>
				{isAbnormal && (
					<Badge
						className="text-[10px]"
						variant="destructive"
					>
						Flag
					</Badge>
				)}
			</div>
		</div>
	);
}

function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	actionTo,
	patientId,
}: {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel?: string;
	actionTo?: string;
	patientId: string;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
				<Icon className="size-6 text-muted-foreground" />
			</div>
			<p className="font-medium">{title}</p>
			<p className="mt-0.5 text-muted-foreground text-sm">
				{description}
			</p>
			{actionLabel && actionTo && (
				<Button
					className="mt-4"
					render={
						<Link
							params={{ id: patientId }}
							to={actionTo}
						>
							{actionLabel}
						</Link>
					}
					size="sm"
				/>
			)}
		</div>
	);
}

function PatientNotFound() {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<User className="mb-3 size-12 text-muted-foreground" />
			<p className="font-medium">Patient not found</p>
			<Button
				className="mt-4"
				render={<Link to="/app/patients">Back to Patients</Link>}
			/>
		</div>
	);
}

function PatientHeaderSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-32" />
			<div className="flex items-start gap-4">
				<Skeleton className="size-14 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-48" />
				</div>
			</div>
			<Skeleton className="h-10 w-full" />
		</div>
	);
}

function OverviewSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton
						className="h-28"
						key={i}
					/>
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-2">
				<Skeleton className="h-64" />
				<Skeleton className="h-64" />
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string) {
	const first = firstName.trim().charAt(0).toUpperCase();
	const last = lastName.trim().charAt(0).toUpperCase();
	return `${first}${last}` || "?";
}
