import { cn } from "@smart/ui/lib/utils";
import {
	createFileRoute,
	Link,
	Outlet,
	useMatchRoute,
} from "@tanstack/react-router";
import {
	CreditCardIcon,
	SettingsIcon,
	ShieldCheckIcon,
	UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/_auth/app/settings")({
	component: SettingsLayout,
});

const TABS = [
	{ to: "/app/settings", label: "My account", icon: UserIcon, exact: true },
	{
		to: "/app/settings/preferences",
		label: "Preferences",
		icon: SettingsIcon,
		exact: false,
	},
	{
		to: "/app/settings/billing",
		label: "Clinic billing",
		icon: CreditCardIcon,
		exact: false,
	},
	{
		to: "/app/settings/audit",
		label: "Audit log",
		icon: ShieldCheckIcon,
		exact: false,
	},
] as const;

function SettingsLayout() {
	const matchRoute = useMatchRoute();

	return (
		<div className="container mx-auto max-w-6xl py-8">
			<header className="mb-8">
				<h1 className="font-semibold text-3xl text-foreground">
					Settings
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Manage your account, clinic preferences, and billing.
				</p>
			</header>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
				{/* Sidebar nav */}
				<nav
					aria-label="Settings sections"
					className="flex flex-col gap-1"
				>
					{TABS.map(({ to, label, icon: Icon, exact }) => {
						const active = matchRoute({ to, fuzzy: !exact });
						return (
							<Link
								activeOptions={{ exact }}
								className={cn(
									"flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
									active
										? "bg-accent font-medium text-accent-foreground"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
								)}
								key={to}
								to={to}
							>
								<Icon className="size-4" />
								<span>{label}</span>
							</Link>
						);
					})}
				</nav>

				{/* Content */}
				<main className="min-w-0">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
