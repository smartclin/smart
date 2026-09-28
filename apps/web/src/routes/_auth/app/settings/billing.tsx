import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Separator } from "@smart/ui/components/separator";
import { createFileRoute } from "@tanstack/react-router";
import { DownloadIcon, PlusIcon } from "lucide-react";

export const Route = createFileRoute("/_auth/app/settings/billing")({
	component: BillingPage,
});

// Placeholder data — replace with a real orpc.billing.* query
const INVOICES = [
	{ id: "INV-2026-09", date: "2026-09-01", amount: 149, status: "paid" },
	{ id: "INV-2026-08", date: "2026-08-01", amount: 149, status: "paid" },
	{ id: "INV-2026-07", date: "2026-07-01", amount: 149, status: "paid" },
] as const;

function BillingPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Current plan</CardTitle>
					<CardDescription>
						Your clinic&apos;s subscription and renewal date.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col">
							<span className="font-semibold text-foreground text-lg">
								Clinic Pro
							</span>
							<span className="text-muted-foreground text-sm">
								Unlimited patients · 10 staff seats · Priority
								support
							</span>
						</div>
						<Badge variant="secondary">Active</Badge>
					</div>
					<Separator />
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col">
							<span className="text-muted-foreground text-xs">
								Next renewal
							</span>
							<span className="text-foreground text-sm">
								Oct 1, 2026
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-muted-foreground text-xs">
								Billing cycle
							</span>
							<span className="text-foreground text-sm">
								Monthly · $149
							</span>
						</div>
					</div>
					<div className="flex gap-2 pt-2">
						<Button
							size="sm"
							variant="outline"
						>
							Change plan
						</Button>
						<Button
							size="sm"
							variant="ghost"
						>
							Cancel subscription
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex-row items-center justify-between space-y-0">
					<div className="flex flex-col gap-1">
						<CardTitle>Payment method</CardTitle>
						<CardDescription>
							Card used for recurring charges.
						</CardDescription>
					</div>
					<Button
						size="sm"
						variant="outline"
					>
						<PlusIcon className="me-1.5 size-4" />
						Update card
					</Button>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between gap-4 rounded-md border bg-card p-3">
						<div className="flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
								VISA
							</div>
							<div className="flex flex-col">
								<span className="text-foreground text-sm">
									•••• •••• •••• 4242
								</span>
								<span className="text-muted-foreground text-xs">
									Expires 12 / 2028
								</span>
							</div>
						</div>
						<Badge variant="outline">Default</Badge>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Invoices</CardTitle>
					<CardDescription>
						Download receipts for your clinic&apos;s records.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col">
					{INVOICES.map((inv, i) => (
						<div key={inv.id}>
							{i > 0 && <Separator />}
							<div className="flex items-center justify-between gap-4 py-3">
								<div className="flex flex-col">
									<span className="font-mono text-foreground text-sm">
										{inv.id}
									</span>
									<span className="text-muted-foreground text-xs">
										{new Date(inv.date).toLocaleDateString(
											"en-US",
											{
												month: "short",
												day: "numeric",
												year: "numeric",
											}
										)}
									</span>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-foreground text-sm tabular-nums">
										${inv.amount}.00
									</span>
									<Badge
										className="capitalize"
										variant={
											inv.status === "paid"
												? "secondary"
												: "outline"
										}
									>
										{inv.status}
									</Badge>
									<Button
										aria-label={`Download ${inv.id}`}
										size="icon-sm"
										variant="ghost"
									>
										<DownloadIcon className="size-4" />
									</Button>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
