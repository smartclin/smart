import { Link } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";

import { ClinicLogo } from "./logo";
import UserMenu from "./user-menu";

const links = [
	{ to: "/", label: "Home" },
	{ to: "/app", label: "Dashboard" },
	{ to: "/about", label: "About" },
	{ to: "/app/templates", label: "Templates" },
	{ to: "/support", label: "Support" },
] as const;

export default function Header() {
	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:backdrop-blur">
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-primary-foreground focus:text-sm"
				href="#main-content"
			>
				Skip to content
			</a>

			<div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
				{/* Brand */}
				<Link
					aria-label="Smart Clinic — home"
					className="flex shrink-0 items-center gap-2 font-semibold text-base tracking-tight"
					to="/"
				>
					<span
						aria-hidden
						className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
					>
						<ClinicLogo />
					</span>
					<span className="hidden sm:inline">Smart Clinic</span>
				</Link>

				{/* Desktop nav */}
				<HeaderNav className="ml-2 hidden items-center gap-1 md:flex" />

				{/* Right side */}
				<div className="ml-auto flex items-center gap-2">
					<Link
						className="hidden rounded-md px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent/50 hover:text-foreground sm:inline-flex"
						to="/login"
					>
						Sign in
					</Link>
					<UserMenu />

					{/* Mobile nav */}
					<details className="relative md:hidden">
						<summary
							aria-label="Open menu"
							className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground [&::-webkit-details-marker]:hidden"
						>
							<MenuIcon className="size-5" />
						</summary>
						<div className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">
							<HeaderNav className="flex flex-col items-stretch" />
						</div>
					</details>
				</div>
			</div>
		</header>
	);
}

function HeaderNav({ className }: { className?: string }) {
	return (
		<nav
			aria-label="Primary"
			className={className}
		>
			{links.map(({ to, label }) => (
				<Link
					activeOptions={{ exact: to === "/" }}
					activeProps={{
						className: "bg-accent text-accent-foreground",
					}}
					className="rounded-md px-3 py-1.5 font-medium text-sm transition-colors"
					inactiveProps={{
						className:
							"text-muted-foreground hover:bg-accent/50 hover:text-foreground",
					}}
					key={to}
					to={to}
				>
					{label}
				</Link>
			))}
		</nav>
	);
}
