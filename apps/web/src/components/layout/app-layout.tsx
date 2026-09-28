// src/components/layout/app-layout.tsx

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
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar nav — single source of truth
// ─────────────────────────────────────────────────────────────────────────────

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

const ALERT_ITEMS: NavItem[] = [
	{
		to: "/app/immunizations",
		icon: AlertTriangleIcon,
		label: "Overdue Vaccines",
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

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar item
// ─────────────────────────────────────────────────────────────────────────────

function SidebarNavItem({ item }: { item: NavItem }) {
	const Icon = item.icon;

	return (
		<SidebarMenuItem>
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

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chrome for every `/app/*` route.
 *
 * - Left: `<Sidebar />` — group-by-group nav
 * - Top: sticky header with breadcrumbs + language + profile
 * - Center: the route's own content, provided as `children`
 *
 * The `AppHeader` and `<Outlet />` are supplied by the caller
 * (`routes/_auth/app/route.tsx`) so the layout stays decoupled from routing.
 */
export function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-svh w-full">
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
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

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

			<div className="flex min-w-0 flex-1 flex-col">{children}</div>
		</div>
	);
}

// Re-export the trigger so routes don't have to import from `sidebar`
// just to render it.
export { SidebarTrigger };
