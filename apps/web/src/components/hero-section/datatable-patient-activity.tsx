// apps/web/src/components/dashboard/patient-activity-datatable.tsx

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@smart/ui/components/avatar";
import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import { DataTable } from "@smart/ui/components/table/components/data-table";
import { createAppColumnHelper } from "@smart/ui/table";
import { Link } from "@tanstack/react-router";
import { FileTextIcon, UserIcon } from "lucide-react";
import { memo } from "react";

// ─── Row type ───────────────────────────────────────────────────────────────

export type PatientActivityRow = {
	avatarUrl: string | null;
	id: string;
	mrn: string;
	paidBy: "insurance" | "cash";
	patientId: string;
	patientName: string;
	providerName: string | null;
	scheduledAt: Date;
	status:
		| "scheduled"
		| "checked-in"
		| "in-progress"
		| "completed"
		| "cancelled"
		| "no-show";
	visitType: string;
	amount: number; // ← was amountCents; match the server
};

// ─── Module-level formatters (hoisted, reused) ──────────────────────────────

/**
 * Hoisted so a 500-row table doesn't allocate 500 Intl.NumberFormat
 * instances per render. Change the locale/currency to match your clinic.
 */
const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

/** "checked-in" → "Checked in", "no-show" → "No show" */
function formatStatus(status: PatientActivityRow["status"]) {
	const spaced = status.replaceAll("-", " ");
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** "Jane Doe" → "JD" */
function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

// ─── Column helper ──────────────────────────────────────────────────────────

const columnHelper = createAppColumnHelper<PatientActivityRow>();

const STATUS_VARIANTS: Record<
	PatientActivityRow["status"],
	"default" | "secondary" | "destructive" | "outline"
> = {
	cancelled: "destructive",
	"checked-in": "secondary",
	completed: "default",
	"in-progress": "default",
	"no-show": "destructive",
	scheduled: "outline",
};

export const columns = columnHelper.columns([
	columnHelper.accessor("patientName", {
		header: "Patient",
		cell: ({ row }) => {
			const { patientName, mrn, avatarUrl } = row.original;
			return (
				<div className="flex items-center gap-2">
					<Avatar className="size-9">
						<AvatarImage
							alt={patientName}
							src={avatarUrl ?? undefined}
						/>
						<AvatarFallback className="text-xs">
							{getInitials(patientName)}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col text-sm">
						<span className="font-medium text-card-foreground">
							{patientName}
						</span>
						<span className="font-mono text-muted-foreground text-xs">
							{mrn}
						</span>
					</div>
				</div>
			);
		},
	}),

	columnHelper.accessor("visitType", {
		header: "Visit Type",
		cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
	}),

	columnHelper.accessor("amount", {
		header: "Amount",
		cell: ({ getValue }) => (
			<span className="tabular-nums">
				{currencyFormatter.format(getValue())}
			</span>
		),
	}),

	columnHelper.accessor("status", {
		header: "Status",
		cell: ({ getValue }) => {
			const status = getValue();
			return (
				<Badge
					className="h-auto rounded-sm px-1.5"
					variant={STATUS_VARIANTS[status]}
				>
					{formatStatus(status)}
				</Badge>
			);
		},
	}),

	columnHelper.accessor("paidBy", {
		header: "Payment",
		cell: ({ getValue }) => (
			<Badge
				className="capitalize"
				variant="outline"
			>
				{getValue()}
			</Badge>
		),
	}),

	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		size: 120,
		enableHiding: false,
		cell: ({ row }) => <RowActions row={row.original} />,
	}),
]);

// ─── Row actions ────────────────────────────────────────────────────────────

/**
 * Extracted and memoized: DataTable may re-render rows when unrelated
 * columns change, but the actions column only cares about `patientId`.
 */
const RowActions = memo(function RowActions({
	row,
}: {
	row: PatientActivityRow;
}) {
	const { patientId } = row;

	return (
		<div className="flex items-center gap-1">
			<Button
				className="h-8 px-2 text-xs"
				render={
					<Link
						params={{ id: patientId }}
						to="/app/patients/$id"
					>
						<UserIcon className="me-1.5 size-3.5" />
						Chart
					</Link>
				}
				size="sm"
				variant="ghost"
			/>
			<Button
				className="h-8 px-2 text-xs"
				render={
					<Link
						search={{ patientId }}
						to="/app/encounters/new"
					>
						<FileTextIcon className="me-1.5 size-3.5" />
						Visit
					</Link>
				}
				size="sm"
				variant="ghost"
			/>
		</div>
	);
});

// ─── Main component ─────────────────────────────────────────────────────────

const PatientActivityDatatable = ({
	data,
	isLoading = false,
}: {
	data: PatientActivityRow[];
	isLoading?: boolean;
}) => (
	<DataTable
		columns={columns}
		data={data}
		emptyMessage="No patient activity recorded today."
		isLoading={isLoading}
		pageSize={5}
	/>
);

export default PatientActivityDatatable;
