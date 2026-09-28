import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@smart/ui/components/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@smart/ui/components/breadcrumb";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Separator } from "@smart/ui/components/separator";
import StatisticsCard from "@smart/ui/components/shadcn-studio/blocks/statistics-card-01";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@smart/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import {
	AlertTriangleIcon,
	BarChart3Icon,
	CalendarDaysIcon,
	ClipboardListIcon,
	FileTextIcon,
	FlaskConicalIcon,
	HeartPulseIcon,
	PillIcon,
	SettingsIcon,
	StethoscopeIcon,
	SyringeIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";
import { ClinicInsightsCard } from "@/components/analytics/ClinicInsightsCard";
import { useClinicInsights } from "@/hooks/use-analytics";
import { usePatientActivityToday } from "@/hooks/use-patient-activity";
import PatientActivityDatatable from "../hero-section/datatable-patient-activity";
import ProfileDropdown from "../hero-section/dropdown-profile";
import LanguageDropdown from "./dropdown-language";
import { TodayScheduleCard } from "./today-schedule-card";

// ─── Sidebar navigation config (single source of truth) ────────────────────
//
// Declared as data so:
//  - routes are type-checked by TanStack Router's `Link` at the call site
//  - badges are declarative
//  - adding a new group is a one-line data change
//
// `to` values use TanStack Router's literal path type. If a route doesn't
// exist, TypeScript will flag it at compile time.

type NavItem = {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	badge?: string;
	badgeVariant?: "default" | "destructive";
	to:
		| "/app"
		| "/app/appointments"
		| "/app/patients"
		| "/app/encounters"
		| "/app/growth"
		| "/app/immunizations"
		| "/app/prescriptions"
		| "/app/labs"
		| "/app/analytics"
		| "/app/staff"
		| "/app/settings";
};

type NavGroup = {
	label: string;
	items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
	{
		label: "Clinical",
		items: [
			{ to: "/app", icon: ClipboardListIcon, label: "Dashboard" },
			{
				to: "/app/appointments",
				icon: CalendarDaysIcon,
				label: "Appointments",
				badge: "8",
			},
			{ to: "/app/patients", icon: UsersIcon, label: "Patients" },
			{
				to: "/app/encounters",
				icon: StethoscopeIcon,
				label: "Encounters",
			},
		],
	},
	{
		label: "Health Tracking",
		items: [
			{ to: "/app/growth", icon: TrendingUpIcon, label: "Growth Charts" },
			{
				to: "/app/immunizations",
				icon: SyringeIcon,
				label: "Immunizations",
				badge: "15",
				badgeVariant: "destructive",
			},
			{
				to: "/app/prescriptions",
				icon: PillIcon,
				label: "Prescriptions",
			},
			{ to: "/app/labs", icon: FlaskConicalIcon, label: "Laboratory" },
		],
	},
	{
		label: "Admin",
		items: [
			{ to: "/app/analytics", icon: BarChart3Icon, label: "Analytics" },
			{ to: "/app/staff", icon: UsersIcon, label: "Staff" },
			{ to: "/app/settings", icon: SettingsIcon, label: "Settings" },
		],
	},
];

// ─── Static alerts (routes are static; badges come from a future query) ────

const ALERT_ITEMS: NavItem[] = [
	{
		to: "/app/immunizations",
		icon: AlertTriangleIcon,
		label: "Overdue Vaccines",
		badge: "15",
		badgeVariant: "destructive",
	},
	{
		to: "/app/labs",
		icon: HeartPulseIcon,
		label: "Abnormal Labs",
	},
	{
		to: "/app/prescriptions",
		icon: FileTextIcon,
		label: "Refill Requests",
	},
];

// ─── Sidebar menu item renderer ────────────────────────────────────────────

function SidebarNavItem({ item }: { item: NavItem }) {
	const Icon = item.icon;

	return (
		<SidebarMenuItem>
			{/*
			 * Base UI pattern: `render` swaps the underlying element while
			 * preserving all props and children. This lets us use TanStack
			 * Router's <Link> (with type-safe `to` and preloading) inside
			 * SidebarMenuButton's styling.
			 *
			 * If `@smart/ui`'s SidebarMenuButton is NOT Base UI-based (i.e.
			 * it doesn't accept `render`), fall back to:
			 *
			 *   <Link to={item.to} className={sidebarMenuButtonVariants()}>
			 *     <Icon /> <span>{item.label}</span>
			 *   </Link>
			 */}
			<SidebarMenuButton render={<Link to={item.to} />}>
				<Icon />
				<span>{item.label}</span>
			</SidebarMenuButton>

			{item.badge ? (
				<SidebarMenuBadge
					className={
						item.badgeVariant === "destructive"
							? "top-1/2! right-2 -translate-y-1/2! rounded-full bg-destructive/10 text-destructive"
							: "top-1/2! right-2 -translate-y-1/2! rounded-full bg-primary/10"
					}
				>
					{item.badge}
				</SidebarMenuBadge>
			) : null}
		</SidebarMenuItem>
	);
}

// ─── Main shell ────────────────────────────────────────────────────────────

function DashboardShell() {
	const { data: activityResult, isLoading: activityLoading } =
		usePatientActivityToday({ limit: 20 });
	const activity = activityResult?.data ?? [];
	const { data: clinicInsights, isLoading: insightsLoading } =
		useClinicInsights();
	const insights = clinicInsights?.insights ?? [];

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarContent>
					{/* Brand */}
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										render={<Link to="/app" />}
									>
										<StethoscopeIcon />
										<span className="font-semibold">
											Smart Clinic
										</span>
									</SidebarMenuButton>
									<SidebarMenuBadge className="top-1/2! right-2 -translate-y-1/2! rounded-full bg-primary/10">
										v1.0
									</SidebarMenuBadge>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					{/* Declarative nav groups */}
					{NAV_GROUPS.map((group) => (
						<SidebarGroup key={group.label}>
							<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{group.items.map((item) => (
										<SidebarNavItem
											item={item}
											key={item.to}
										/>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					))}

					{/* Alerts */}
					<SidebarGroup>
						<SidebarGroupLabel>Alerts</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{ALERT_ITEMS.map((item) => (
									<SidebarNavItem
										item={item}
										key={item.label}
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<div className="flex flex-1 flex-col">
				<header className="sticky top-0 z-50 border-b bg-card">
					<div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
						<div className="flex items-center gap-4">
							<SidebarTrigger className="[&_svg]:size-5!" />
							<Separator
								className="hidden h-4! data-vertical:self-center sm:block"
								orientation="vertical"
							/>
							<Breadcrumb className="hidden sm:block">
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink
											render={<Link to="/" />}
										>
											Home
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbLink
											render={<Link to="/app" />}
										>
											Clinic
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>
											Dashboard
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className="flex items-center gap-1.5">
							<LanguageDropdown
								trigger={
									<Button
										size="icon-lg"
										variant="ghost"
									>
										<SettingsIcon />
									</Button>
								}
							/>
							<ProfileDropdown
								trigger={
									<Button
										size="icon-lg"
										variant="ghost"
									>
										<Avatar className="size-[inherit] rounded-[inherit] after:rounded-[inherit]">
											<AvatarImage
												className="rounded-[inherit]"
												src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
											/>
											<AvatarFallback className="rounded-[inherit]">
												DR
											</AvatarFallback>
										</Avatar>
									</Button>
								}
							/>
						</div>
					</div>
				</header>

				<main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
					{/* Welcome banner — data-driven, not hardcoded */}
					<WelcomeBanner />

					<div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
						{/*
						 * Statistics cards — statistic-card-01 only accepts
						 * { title, value, changePercentage, icon }.
						 * Anything else (loading, trend, subtitle) must be
						 * handled by the caller, not passed through.
						 */}
						<div className="col-span-full grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							<ClinicStatisticsCards />
						</div>

						{/* Insights + Schedule */}
						<div className="grid gap-6 max-xl:col-span-full lg:max-xl:grid-cols-2">
							<ClinicInsightsCard
								className="justify-between gap-3 *:data-[slot=card-content]:space-y-5"
								insights={insights}
								isLoading={insightsLoading}
							/>
							<TodayScheduleCard className="justify-between gap-3" />
						</div>

						{/* Vaccination Compliance Chart */}
						<Card className="col-span-full *:data-[slot=card-content]:space-y-6 xl:col-span-2">
							<CardHeader>
								<CardTitle className="font-semibold text-lg">
									Vaccination Compliance
								</CardTitle>
								<p className="text-muted-foreground text-sm">
									Clinic-wide immunization coverage over the
									last 6 months
								</p>
							</CardHeader>
							<CardContent>
								<div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed bg-muted/30">
									<p className="text-muted-foreground text-sm">
										Connect to{" "}
										<code className="font-mono">
											useImmunizationStats()
										</code>
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Patient Activity Table */}
						<Card className="col-span-full w-full py-0">
							<PatientActivityDatatable
								data={activity}
								isLoading={activityLoading}
							/>
						</Card>
					</div>
				</main>

				<footer>
					<div className="mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 text-muted-foreground max-sm:flex-col sm:gap-6 sm:px-6">
						<p className="text-balance text-sm max-sm:text-center">
							©{new Date().getFullYear()} Smart Clinic. All rights
							reserved.
						</p>
						<div className="flex items-center gap-5 text-sm">
							<Link
								className="transition-colors hover:text-primary"
								to="/support"
							>
								Support
							</Link>
							<Link
								className="transition-colors hover:text-primary"
								to="/privacy"
							>
								Privacy
							</Link>
							<Link
								className="transition-colors hover:text-primary"
								to="/terms"
							>
								Terms
							</Link>
						</div>
					</div>
				</footer>
			</div>
		</SidebarProvider>
	);
}

// ─── Welcome banner ────────────────────────────────────────────────────────

function WelcomeBanner() {
	// TODO: wire these to real data
	//   - user name → useAuth().user.name
	//   - appointments count → useDashboardStats().data.todayAppointments
	//   - overdue count → useAllOverdueImmunizations().data.length
	const stats = { appointments: 8, overdueVaccines: 15 };
	const userName = "Dr. Hazem"; // TODO: from session

	return (
		<div className="mb-6">
			<h1 className="font-bold text-2xl tracking-tight">
				Good morning, {userName} 👋
			</h1>
			<p className="mt-1 text-muted-foreground text-sm">
				You have <strong>{stats.appointments} appointments</strong> and{" "}
				<strong>{stats.overdueVaccines} overdue vaccines</strong>{" "}
				requiring attention today.
			</p>
		</div>
	);
}

// ─── Clinic statistics cards ───────────────────────────────────────────────
//
// Pulled out of the shell so the shell doesn't need to know about stats
// internals. Reads the data, renders the presentational cards, handles
// loading via skeleton swap.

function ClinicStatisticsCards() {
	const { data: stats, isLoading } = useClinicStatsCards();

	if (isLoading) {
		return (
			<>
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						className="h-32 animate-pulse rounded-2xl border border-border bg-card"
						key={i}
					/>
				))}
			</>
		);
	}

	return (
		<>
			{stats.map((stat) => (
				<StatisticsCard
					changePercentage={stat.changePercentage}
					icon={stat.icon}
					key={stat.key}
					title={stat.title}
					value={stat.value}
				/>
			))}
		</>
	);
}

// ─── Local hook — replace with your real implementation ────────────────────
//
// This is a stand-in so the file compiles. Move it to
// `apps/web/src/hooks/use-clinic-stats.ts` and wire it to real queries.

function useClinicStatsCards() {
	// TODO: replace with real data
	//   - patients    → usePatientCount()
	//   - today       → useDashboardStats().todayAppointments
	//   - overdue     → useAllOverdueImmunizations().length
	//   - missed      → useDashboardStats().completionRate inverse
	return {
		data: [
			{
				key: "patients",
				title: "Active patients",
				value: "0",
				changePercentage: "+0%",
				icon: <UsersIcon className="size-4" />,
			},
			{
				key: "appointments",
				title: "Appointments today",
				value: "0",
				changePercentage: "+0%",
				icon: <CalendarDaysIcon className="size-4" />,
			},
			{
				key: "overdue",
				title: "Overdue vaccines",
				value: "0",
				changePercentage: "+0%",
				icon: <SyringeIcon className="size-4" />,
			},
			{
				key: "missed",
				title: "Missed visits",
				value: "0",
				changePercentage: "-0%",
				icon: <AlertTriangleIcon className="size-4" />,
			},
		],
		isLoading: false,
	};
}

export default DashboardShell;
