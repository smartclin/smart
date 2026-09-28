import StatisticsCard from "@smart/ui/components/shadcn-studio/blocks/statistics-card-01";
import { Skeleton } from "@smart/ui/components/skeleton";
import {
	BabyIcon,
	CalendarCheckIcon,
	CalendarX2Icon,
	SyringeIcon,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useAllOverdueImmunizations } from "@/hooks/use-immunizations";
import { usePatientCount } from "@/hooks/use-patients";

function StatisticsCardSkeleton() {
	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="size-4 rounded" />
			</div>
			<div className="mt-4 space-y-2">
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-3 w-16" />
			</div>
		</div>
	);
}
export function ClinicStatisticsCards() {
	const { data: patientCount, isLoading: loadingCount } = usePatientCount();
	const { data: stats, isLoading: loadingStats } = useDashboardStats();
	const { data: overdue, isLoading: loadingOverdue } =
		useAllOverdueImmunizations();

	return (
		<div className="col-span-full grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{loadingCount ? (
				<StatisticsCardSkeleton />
			) : (
				<StatisticsCard
					changePercentage="+12.4%"
					icon={<BabyIcon className="size-4" />}
					title="Active patients"
					value={String(patientCount ?? 0)}
				/>
			)}

			{loadingStats ? (
				<StatisticsCardSkeleton />
			) : (
				<StatisticsCard
					changePercentage="+18.2%"
					icon={<CalendarCheckIcon className="size-4" />}
					title="Appointments today"
					value={String(stats?.todayAppointments ?? 0)}
				/>
			)}

			{loadingOverdue ? (
				<StatisticsCardSkeleton />
			) : (
				<StatisticsCard
					changePercentage="+25.0%"
					icon={<SyringeIcon className="size-4" />}
					title="Overdue vaccines"
					value={String(overdue?.length ?? 0)}
				/>
			)}

			<StatisticsCard
				changePercentage="-8.7%"
				icon={<CalendarX2Icon className="size-4" />}
				title="Missed visits"
				value="0"
			/>
		</div>
	);
}
