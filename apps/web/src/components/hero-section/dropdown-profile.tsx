import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@smart/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@smart/ui/components/dropdown-menu";
import { getInitial } from "@smart/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	BabyIcon,
	CalendarClockIcon,
	CreditCardIcon,
	LogOutIcon,
	SettingsIcon,
	ShieldCheckIcon,
	StethoscopeIcon,
	SyringeIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import type { ComponentType, ReactElement } from "react";
import { useLogout } from "@/hooks/use-mutations";
import { useAuthUser } from "@/lib/store";

// ------------------------------------------------------------
// Role configuration
// ------------------------------------------------------------

type AppRole = "admin" | "doctor" | "staff" | "patient";

const ROLE_LABELS: Record<AppRole, string> = {
	admin: "Administrator",
	doctor: "Physician",
	patient: "Patient",
	staff: "Front Desk",
};

const isAdmin = (role: AppRole) => role === "admin";
const isClinical = (role: AppRole) => role === "doctor" || role === "admin";

// ------------------------------------------------------------
// Menu data — add a row here to add a menu item
// ------------------------------------------------------------

type MenuItem = {
	to: string;
	label: string;
	icon: ComponentType<{ className?: string }>;
};

const CLINICAL_ITEMS = (role: AppRole): MenuItem[] => [
	{
		to: "/app/appointments",
		label: "Today's schedule",
		icon: CalendarClockIcon,
	},
	{
		to: "/app/patients",
		label: role === "doctor" ? "My patients" : "All patients",
		icon: StethoscopeIcon,
	},
	{
		to: "/app/immunizations",
		label: "Immunization schedule",
		icon: SyringeIcon,
	},
];

const FRONT_DESK_ITEMS: MenuItem[] = [
	{
		to: "/app/appointments",
		label: "Clinic schedule",
		icon: CalendarClockIcon,
	},
	{ to: "/app/patients/new", label: "Register new patient", icon: BabyIcon },
];

const ACCOUNT_ITEMS: MenuItem[] = [
	{ to: "/app/settings", label: "My account", icon: UserIcon },
	{
		to: "/app/settings/preferences",
		label: "Preferences",
		icon: SettingsIcon,
	},
];

const ADMIN_ITEMS: MenuItem[] = [
	{ to: "/app/staff", label: "Manage team", icon: UsersIcon },
	{
		to: "/app/settings/billing",
		label: "Clinic billing",
		icon: CreditCardIcon,
	},
	{ to: "/app/settings/audit", label: "Audit log", icon: ShieldCheckIcon },
];

// ------------------------------------------------------------
// Primitives
// ------------------------------------------------------------

const ITEM_CLASS = "gap-2 px-4 py-2.5 text-base";

/**
 * A `DropdownMenuItem` whose contents are an internal router `<Link>`.
 * Encapsulates the `render` prop dance so callers just pass `to` + `label`.
 */
function MenuLink({
	to,
	label,
	icon: Icon,
}: {
	to: string;
	label: string;
	icon: ComponentType<{ className?: string }>;
}) {
	return (
		<DropdownMenuItem
			className={ITEM_CLASS}
			render={
				<Link to={to}>
					<Icon className="size-5 text-foreground" />
					<span>{label}</span>
				</Link>
			}
		/>
	);
}

/**
 * A list of `MenuLink`s grouped under one `<DropdownMenuGroup>`.
 * Keeps the group/label/separator pattern in one place.
 */
function MenuGroup({ items }: { items: MenuItem[] }) {
	return (
		<>
			<DropdownMenuGroup>
				{items.map((item) => (
					<MenuLink
						icon={item.icon}
						key={item.to}
						label={item.label}
						to={item.to}
					/>
				))}
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
		</>
	);
}

/**
 * Identity header — decorative, so it renders a plain `<div>` rather than
 * `DropdownMenuLabel`. The latter requires a `<Menu.Group>` ancestor in
 * Base UI and would throw at runtime outside one.
 */
function IdentityHeader({
	name,
	email,
	initials,
	image,
	roleLabel,
}: {
	name: string;
	email: string;
	initials: string;
	image?: string | null;
	roleLabel: string;
}) {
	return (
		<div className="flex items-center gap-4 px-4 py-2.5">
			<Avatar size="lg">
				<AvatarImage
					alt={name}
					src={image ?? ""}
				/>
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="flex flex-1 flex-col items-start">
				<span className="font-semibold text-foreground text-lg">
					{name}
				</span>
				<span className="text-base text-muted-foreground">{email}</span>
				<span className="mt-0.5 rounded-sm bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-xs">
					{roleLabel}
				</span>
			</div>
		</div>
	);
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

type Props = {
	/** Trigger element. Rendered via Base UI's `render` prop. */
	trigger: ReactElement;
	defaultOpen?: boolean;
	align?: "start" | "center" | "end";
};

const ProfileDropdown = ({ trigger, defaultOpen, align = "end" }: Props) => {
	const user = useAuthUser();
	const logout = useLogout();

	const displayName = user?.name ?? "Guest";
	const email = user?.email ?? "";
	const initials = getInitial(displayName);

	const role: AppRole = (user?.role as AppRole | undefined) ?? "staff";
	const roleLabel = ROLE_LABELS[role] ?? "Staff";

	const showClinical = isClinical(role);
	const showFrontDesk = role === "staff" || isAdmin(role);
	const showAdmin = isAdmin(role);

	return (
		<DropdownMenu
			defaultOpen={import.meta.env.DEV ? defaultOpen : undefined}
		>
			<DropdownMenuTrigger render={trigger} />

			<DropdownMenuContent
				align={align}
				className="w-80"
			>
				<IdentityHeader
					email={email}
					image={user?.image}
					initials={initials}
					name={displayName}
					roleLabel={roleLabel}
				/>

				<DropdownMenuSeparator />

				{showClinical && <MenuGroup items={CLINICAL_ITEMS(role)} />}
				{showFrontDesk && <MenuGroup items={FRONT_DESK_ITEMS} />}

				<MenuGroup items={ACCOUNT_ITEMS} />

				{showAdmin && <MenuGroup items={ADMIN_ITEMS} />}

				<DropdownMenuItem
					className={ITEM_CLASS}
					disabled={logout.isPending}
					onSelect={(e) => {
						e.preventDefault();
						logout.mutate();
					}}
					variant="destructive"
				>
					<LogOutIcon className="size-5" />
					<span>{logout.isPending ? "Signing out…" : "Logout"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
