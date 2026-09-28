// src/components/dashboard/today-schedule-card.tsx

import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Skeleton } from "@smart/ui/components/skeleton";
import { Link } from "@tanstack/react-router";
import { CalendarDaysIcon } from "lucide-react";
import * as React from "react";
import { useTodaySchedule } from "../../hooks/use-patient-activity";

type TodayScheduleItem = {
	id: string;
	isOverdue: boolean;
	isUrgent: boolean;
	notes?: string;
	patientId: string;
	patientName: string;
	providerName?: string;
	status:
		| "scheduled"
		| "confirmed"
		| "in_progress"
		| "completed"
		| "cancelled"
		| "no_show";
	time: string;
	type: string;
};

export type TodayScheduleCardProps = {
	className?: string;
	date?: Date;
	limit?: number;
};

export function TodayScheduleCard({
	className,
	date,
	limit = 4,
}: TodayScheduleCardProps) {
	const queryParams = React.useMemo(
		() => ({ ...(date ? { date } : {}), limit }),
		[date, limit]
	);

	const { data, isLoading, isError } = useTodaySchedule(queryParams);

	const appointments = data?.schedule ?? [];

	return (
		<Card className={className}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-semibold text-lg">
					Today&apos;s Schedule
				</CardTitle>
				<Button
					nativeButton={false}
					render={
						<Link
							className="flex items-center gap-2"
							to="/app/appointments"
						>
							View all
						</Link>
					}
					size="sm"
					variant="ghost"
				/>
			</CardHeader>

			<CardContent className="space-y-3">
				{isLoading ? (
					Array.from({ length: limit }).map((_, i) => (
						<div
							className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
							key={i}
						>
							<Skeleton className="size-10 shrink-0 rounded-md" />
							<div className="min-w-0 flex-1 space-y-1.5">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-48" />
							</div>
						</div>
					))
				) : isError ? (
					<p className="py-6 text-center text-destructive text-sm">
						Could not load today&apos;s schedule.
					</p>
				) : appointments.length === 0 ? (
					<p className="py-6 text-center text-muted-foreground text-sm">
						No appointments scheduled for today.
					</p>
				) : (
					appointments.map((apt: TodayScheduleItem) => (
						<Link
							className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
							key={apt.id}
							params={{ id: apt.id }}
							to="/app/appointments/$id"
						>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono font-semibold text-primary text-xs">
								{apt.time}
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm">
									{apt.patientName}
								</p>
								<p className="truncate text-muted-foreground text-xs">
									{apt.type}
									{apt.providerName
										? ` · ${apt.providerName}`
										: ""}
								</p>
							</div>
							<CalendarDaysIcon className="size-4 shrink-0 text-muted-foreground" />
						</Link>
					))
				)}
			</CardContent>
		</Card>
	);
}
