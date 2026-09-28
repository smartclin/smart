// src/routes/_auth/app/patients/$id/growth.tsx
import { Skeleton } from "@smart/ui/components/skeleton";
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { usePatientById } from "@/hooks/use-patients";

export const Route = createFileRoute("/_auth/app/patients/$id/growth")({
	component: GrowthLayout,
});

const TABS = [
	{ segment: "", label: "Dashboard" },
	{ segment: "chart", label: "Chart" },
	{ segment: "history", label: "History" },
] as const;

function GrowthLayout() {
	const { id: patientId } = Route.useParams();
	const { data: patient, isLoading } = usePatientById(patientId);
	const location = useLocation();

	if (isLoading) return <GrowthHeaderSkeleton />;
	if (!patient) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-6">
				<p className="text-muted-foreground text-sm">
					Patient not found.
				</p>
			</div>
		);
	}

	const basePath = `/app/patients/${patientId}/growth`;

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
			<header>
				<h1 className="font-bold text-2xl">
					Growth — {patient.firstName} {patient.lastName}
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					MRN: {patient.mrn} ·{" "}
					{patient.gender === "male" ? "Boys" : "Girls"} WHO curves
				</p>
			</header>

			<nav
				aria-label="Growth sections"
				className="flex gap-1 overflow-x-auto border-border border-b pb-px"
			>
				{TABS.map((tab) => {
					const to = tab.segment
						? `${basePath}/${tab.segment}`
						: basePath;
					const isActive = tab.segment
						? location.pathname.startsWith(to)
						: location.pathname === basePath;

					return (
						<Link
							className={
								isActive
									? "shrink-0 border-primary border-b-2 px-4 py-2 font-medium text-primary text-sm"
									: "shrink-0 border-transparent border-b-2 px-4 py-2 font-medium text-muted-foreground text-sm transition-colors hover:border-border hover:text-foreground"
							}
							key={tab.segment}
							params={{ id: patientId }}
							to={to}
						>
							{tab.label}
						</Link>
					);
				})}
			</nav>

			<Outlet />
		</div>
	);
}

function GrowthHeaderSkeleton() {
	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96" />
			</div>
			<Skeleton className="h-10 w-full" />
		</div>
	);
}
