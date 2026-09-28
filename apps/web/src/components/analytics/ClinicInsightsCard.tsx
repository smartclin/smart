// src/components/analytics/ClinicInsightsCard.tsx

import { Card, CardContent, CardHeader } from "@smart/ui/components/card";
import { Separator } from "@smart/ui/components/separator";
import { Skeleton } from "@smart/ui/components/skeleton";
import * as React from "react";
import { MiniBarChart } from "@/components/analytics/MiniBarChart";
import { TrendBadge } from "@/components/analytics/TrendBadge";
import type { ClinicInsight } from "@/types/insights";

export type ClinicInsightsCardProps = {
	insights: readonly ClinicInsight[];
	className?: string;
	isLoading?: boolean;
	publishedAt?: Date | string;
};

export function ClinicInsightsCard({
	insights,
	className,
	isLoading = false,
	publishedAt = new Date(),
}: ClinicInsightsCardProps) {
	// Move useMemo to the top before any conditional returns
	const formattedDate = React.useMemo(
		() =>
			new Date(publishedAt).toLocaleString("en-US", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
			}),
		[publishedAt]
	);

	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader className="flex items-center gap-2">
					<Skeleton className="size-8 rounded-sm" />
					<Skeleton className="h-8 w-16" />
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-40" />
				</CardContent>
			</Card>
		);
	}

	if (insights.length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<span className="font-semibold text-lg">
						Clinic insights
					</span>
					<span className="text-muted-foreground text-sm">
						Updated {formattedDate}
					</span>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Insights will appear once the clinic records activity.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader className="flex justify-between">
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-lg">
						Clinic insights
					</span>
					<span className="text-muted-foreground text-sm">
						Updated {formattedDate}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<Separator />
			</CardContent>
			<CardContent className="space-y-4">
				{insights.map((insight) => (
					<InsightRow
						insight={insight}
						key={insight.id}
					/>
				))}
			</CardContent>
		</Card>
	);
}

// ─── Insight row (memoized) ─────────────────────────────────────────────────

type InsightRowProps = {
	insight: ClinicInsight;
};

const InsightRow = React.memo(function InsightRow({
	insight,
}: InsightRowProps) {
	return (
		<div className="flex items-center justify-between gap-1">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<span className="text-xs">{insight.label}</span>
					{insight.trend ? (
						<TrendBadge
							direction={insight.trend.direction}
							value={insight.trend.value}
						/>
					) : null}
				</div>
				<span className="font-semibold text-2xl tabular-nums">
					{insight.value.toLocaleString()}
					{insight.unit ? (
						<span className="ml-1 font-normal text-muted-foreground text-sm">
							{insight.unit}
						</span>
					) : null}
				</span>
			</div>
			<MiniBarChart
				color={insight.color ?? "var(--primary)"}
				data={insight.series}
			/>
		</div>
	);
});
