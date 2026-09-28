// src/components/growth/growth-history-table.tsx

import { Button } from "@smart/ui/components/button";
import {
	DataTable,
	DataTableEmptyState,
	DataTableLoading,
} from "@smart/ui/table";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw, Ruler } from "lucide-react";
import { useState } from "react";

import { useGrowthMeasurementList } from "@/hooks/use-growth";
import { growthColumns } from "./columns";

const PAGE_SIZE = 20;

interface GrowthHistoryTableProps {
	/**
	 * Hide the heading + "Record Measurement" button. Useful when the
	 * parent already provides a header. Default: false.
	 */
	compact?: boolean;
	/** Required — the table is always scoped to a single patient. */
	patientId: string;
	/**
	 * Show the "Record Measurement" button in the heading. Default: true.
	 * Ignored when `compact` is true.
	 */
	showAddButton?: boolean;
}

export function GrowthHistoryTable({
	patientId,
	compact = false,
	showAddButton = true,
}: GrowthHistoryTableProps) {
	const navigate = useNavigate();
	const [pageIndex, setPageIndex] = useState(0);

	const {
		data: result,
		isLoading,
		isError,
		error,
		refetch,
	} = useGrowthMeasurementList({
		patientId,
		limit: PAGE_SIZE,
		offset: pageIndex * PAGE_SIZE,
		// Newest first — the hook should pass this to the server so the
		// first page is always the most recent measurements.
		orderBy: "ageMonths",
		orderDirection: "desc",
	});

	const measurements = result?.data ?? [];
	const total = result?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	// ─── Error ─────────────────────────────────────────────────────────────

	if (isError) {
		return (
			<div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
				<p className="font-medium text-destructive">
					Could not load growth history
				</p>
				<p className="mt-1 text-muted-foreground text-sm">
					{error?.message}
				</p>
				<Button
					className="mt-4"
					onClick={() => void refetch()}
					variant="outline"
				>
					<RefreshCw className="mr-2 size-4" />
					Try again
				</Button>
			</div>
		);
	}

	// ─── Empty (before we know the count, we still want a friendly state) ──

	// Note: the empty state is only shown when loading is finished AND
	// there are zero measurements. Because the query always includes the
	// patient, `measurements.length === 0` means the patient has no data.

	return (
		<div className="space-y-4">
			{/* ─── Heading ─────────────────────────────────────────────── */}
			{!compact && (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="flex items-center gap-2 font-semibold text-lg">
							<Ruler className="size-4 text-primary" />
							Growth History
						</h2>
						<p className="text-muted-foreground text-sm">
							{total.toLocaleString()} measurement
							{total === 1 ? "" : "s"} recorded
						</p>
					</div>
					{showAddButton && (
						<Button
							render={
								<Link
									search={{ patientId }}
									to="/app/growth/new"
								/>
							}
						>
							<Plus className="mr-2 size-4" />
							Record Measurement
						</Button>
					)}
				</div>
			)}

			{/* ─── Table ───────────────────────────────────────────────── */}
			{isLoading ? (
				<DataTableLoading
					columns={growthColumns.length}
					rows={5}
				/>
			) : measurements.length === 0 ? (
				<DataTableEmptyState
					actionLabel={compact ? undefined : "Record Measurement"}
					icon="activity"
					message="Record this patient's first growth measurement to start tracking their growth curve."
					onAction={
						compact
							? undefined
							: () =>
									void navigate({
										to: "/app/growth/new",
										search: { patientId },
									})
					}
					title="No measurements yet"
				/>
			) : (
				<DataTable
					columns={growthColumns}
					data={measurements}
					manualPagination
					onPageChange={setPageIndex}
					pageCount={pageCount}
					pageIndex={pageIndex}
					pageSize={PAGE_SIZE}
					refetch={refetch}
				/>
			)}
		</div>
	);
}
