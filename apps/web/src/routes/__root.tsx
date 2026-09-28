import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense } from "react";
import Devtools from "@/components/providers/Devtools";
import { GlobalProviders } from "@/components/providers/global-providers";
import { queryPersister } from "@/lib/orpc/query-persister";
import type { orpc } from "@/lib/orpc/utils";
import { getCanonicalUrl, getSeoMeta } from "@/lib/seo";
import Header from "../components/header";
import appCss from "../index.css?url";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...getSeoMeta(),
		],
		links: [
			{ rel: "canonical", href: getCanonicalUrl() },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
		],
	}),
	errorComponent: ErrorComponent,
	notFoundComponent: NotFoundComponent,
	pendingComponent: RouteLoadingState,
	component: RootComponent,
});

// ─── Theme bootstrap (runs before React hydrates) ─────────────────────────────

const THEME_BOOTSTRAP = `
(function () {
	try {
		var stored = localStorage.getItem("theme");
		var mode = stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
		var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		var isDark = mode === "dark" || (mode === "auto" && prefersDark);
		var root = document.documentElement;
		root.classList.toggle("dark", isDark);
		root.classList.toggle("light", !isDark);
		root.style.colorScheme = isDark ? "dark" : "light";
		root.dataset.themeMode = mode;
	} catch (e) {}
})();
`.trim();

// ─── Root ─────────────────────────────────────────────────────────────────────

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
	const { queryClient } = Route.useRouteContext();

	return (
		<html
			className="scroll-smooth"
			lang="en"
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-contained theme bootstrap
					dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }}
				/>
			</head>
			<body
				className="min-h-svh bg-background font-sans text-foreground antialiased"
				suppressHydrationWarning
			>
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{
						persister: queryPersister,
						maxAge: 24 * 60 * 60 * 1000,
						dehydrateOptions: {
							shouldDehydrateQuery: (query) =>
								query.state.status === "success",
						},
					}}
				>
					<GlobalProviders>
						<div className="grid min-h-svh grid-rows-[auto_1fr]">
							<Header />
							<main
								className="min-w-0"
								id="main-content"
							>
								{children}
							</main>
						</div>
					</GlobalProviders>

					{import.meta.env.DEV ? (
						<Suspense fallback={null}>
							<Devtools />
							<TanStackRouterDevtools position="bottom-left" />
							<ReactQueryDevtools
								buttonPosition="bottom-right"
								position="bottom"
							/>
						</Suspense>
					) : null}
				</PersistQueryClientProvider>

				<Scripts />
			</body>
		</html>
	);
}

// ─── Route-level fallbacks ────────────────────────────────────────────────────

function RouteLoadingState() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
		</div>
	);
}

function NotFoundComponent() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
			<p className="font-bold text-6xl text-primary">404</p>
			<h1 className="font-semibold text-xl">Page not found</h1>
			<p className="max-w-md text-muted-foreground text-sm">
				We couldn't find the page you were looking for.
			</p>
			<Link
				className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm transition-colors hover:bg-primary/90"
				to="/"
			>
				Go home
			</Link>
		</div>
	);
}

function ErrorComponent({
	error,
	reset,
}: {
	error: unknown;
	reset: () => void;
}) {
	const message =
		error instanceof Error
			? error.message
			: typeof error === "string"
				? error
				: "An unexpected error occurred.";

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="font-semibold text-xl">Something went wrong</h1>
			<p className="max-w-md text-muted-foreground text-sm">{message}</p>
			<button
				className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm transition-colors hover:bg-primary/90"
				onClick={reset}
				type="button"
			>
				Try again
			</button>
		</div>
	);
}
