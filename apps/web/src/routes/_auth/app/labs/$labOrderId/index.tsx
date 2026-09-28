import { Badge } from "@smart/ui/components/badge.tsx";
import { buttonVariants } from "@smart/ui/components/button.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card.tsx";
import { Skeleton } from "@smart/ui/components/skeleton.tsx";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FlaskRound, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { useLabOrderById } from "@/hooks/use-labs";

export const Route = createFileRoute("/_auth/app/labs/$labOrderId/")({
	component: LabOrderDetailPage,
});

function LabOrderDetailPage() {
	const { labOrderId } = Route.useParams();
	const { data: labOrder, isLoading } = useLabOrderById(labOrderId);

	if (isLoading) return <Skeleton className="h-96" />;
	if (!labOrder) return <p>Lab order not found</p>;
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Link
					className={buttonVariants({ size: "sm", variant: "ghost" })}
					to="/app/labs"
				>
					<ArrowLeft className="mr-2 size-4" />
					Back to Lab Orders
				</Link>

				<Link
					className={buttonVariants({ variant: "outline" })}
					params={{ labOrderId }}
					to="/app/labs/$labOrderId/edit"
				>
					<Pencil className="mr-2 size-4" />
					Edit
				</Link>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<FlaskRound className="size-4 text-primary" />
							{labOrder.orderNumber}
						</CardTitle>
						<Badge>{labOrder.status}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<InfoRow
						label="Patient ID"
						value={labOrder.patientId}
					/>
					<InfoRow
						label="Ordered By"
						value={labOrder.orderedBy}
					/>
					<InfoRow
						label="Order Date"
						value={new Date(
							labOrder.orderDate
						).toLocaleDateString()}
					/>
					<InfoRow
						label="Priority"
						value={labOrder.priority}
					/>
					<InfoRow
						label="Clinical Indication"
						value={labOrder.clinicalIndication}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Local presentational helper ─────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="flex items-start justify-between gap-4 border-border border-b pb-2 last:border-b-0 last:pb-0">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className="text-right font-medium text-sm">{value}</span>
		</div>
	);
}
