// src/routes/_auth/app/route.tsx

import { Button } from "@smart/ui/components/button";
import { SidebarProvider } from "@smart/ui/components/sidebar";
import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/app-layout";
import { StaffAuthProvider } from "@/components/providers/staff-provider";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireRole } from "@/functions/get-user";

export const Route = createFileRoute("/_auth/app")({
	component: AppLayoutWrapper,
	beforeLoad: async () => {
		const user = await requireRole({ data: ["admin", "doctor"] });
		if (!user) {
			throw redirect({ to: "/login" });
		}
		// ✅ Return the full user, not just the role.
		// `AppLayoutWrapper` reads this via Route.useRouteContext() and
		// passes it to StaffAuthProvider — no store race, no throw.
		return { user };
	},
	pendingComponent: AppPending,
	errorComponent: AppError,
});

// ─────────────────────────────────────────────────────────────────────────────
// Fallbacks — unchanged
// ─────────────────────────────────────────────────────────────────────────────

function AppPending() {
	return (
		<div className="flex h-svh items-center justify-center">
			<span className="text-muted-foreground text-sm">Loading…</span>
		</div>
	);
}

function AppError({ error }: { error: unknown }) {
	const message =
		error instanceof Error ? error.message : "Something went wrong";

	return (
		<div className="flex h-svh flex-col items-center justify-center gap-2">
			<p className="text-destructive text-sm">{message}</p>
			<Button
				onClick={() => window.location.reload()}
				size="sm"
				variant="outline"
			>
				Retry
			</Button>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

function AppLayoutWrapper() {
	const { user } = Route.useRouteContext();

	return (
		<SidebarProvider>
			<StaffAuthProvider user={user}>
				<AppLayout>
					<AppHeader />
					<Outlet />
				</AppLayout>
			</StaffAuthProvider>
		</SidebarProvider>
	);
}

function AppHeader() {
	return (
		<header className="flex items-center justify-between border-b px-4 py-2">
			<div className="flex items-center gap-2">
				<Button
					nativeButton={false}
					render={<Link to="/app/templates">Go to Templates</Link>}
					size="sm"
				/>
			</div>
			<div className="flex items-center gap-2">
				<ThemeToggle />
				<SignOutButton />
			</div>
		</header>
	);
}
