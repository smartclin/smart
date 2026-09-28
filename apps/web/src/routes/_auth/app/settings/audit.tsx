import { Badge } from "@smart/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Input } from "@smart/ui/components/input";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_auth/app/settings/audit")({
	component: AuditLogPage,
});

type AuditAction =
	| "patient.created"
	| "patient.updated"
	| "patient.deleted"
	| "encounter.signed"
	| "prescription.created"
	| "prescription.discontinued"
	| "staff.invited"
	| "staff.deactivated"
	| "settings.updated"
	| "login.succeeded"
	| "login.failed";

type AuditEntry = {
	id: string;
	action: AuditAction;
	actorName: string;
	actorEmail: string;
	target: string;
	at: Date;
	ip: string;
};

// Placeholder — replace with orpc.audit.list.queryOptions()
const ENTRIES: AuditEntry[] = [
	{
		id: "a1",
		action: "encounter.signed",
		actorName: "Dr. Sarah Hassan",
		actorEmail: "s.hassan@clinic.test",
		target: "Encounter #ENC-1042 · Omar Khalil",
		at: new Date("2026-09-26T09:14:00Z"),
		ip: "10.0.0.42",
	},
	{
		id: "a2",
		action: "patient.created",
		actorName: "Mona Adel",
		actorEmail: "m.adel@clinic.test",
		target: "Patient #PT-2087 · Layla Mansour",
		at: new Date("2026-09-26T08:51:00Z"),
		ip: "10.0.0.17",
	},
	{
		id: "a3",
		action: "prescription.created",
		actorName: "Dr. Sarah Hassan",
		actorEmail: "s.hassan@clinic.test",
		target: "Rx #RX-3301 · Omar Khalil",
		at: new Date("2026-09-26T08:47:00Z"),
		ip: "10.0.0.42",
	},
	{
		id: "a4",
		action: "login.failed",
		actorName: "Unknown",
		actorEmail: "attacker@example.com",
		target: "—",
		at: new Date("2026-09-25T23:11:00Z"),
		ip: "203.0.113.9",
	},
	{
		id: "a5",
		action: "staff.invited",
		actorName: "Dr. Youssef Nabil",
		actorEmail: "y.nabil@clinic.test",
		target: "h.rahman@clinic.test",
		at: new Date("2026-09-25T16:30:00Z"),
		ip: "10.0.0.8",
	},
];

const ACTION_VARIANT: Record<
	AuditAction,
	"default" | "secondary" | "destructive" | "outline"
> = {
	"encounter.signed": "default",
	"login.failed": "destructive",
	"login.succeeded": "secondary",
	"patient.created": "secondary",
	"patient.deleted": "destructive",
	"patient.updated": "outline",
	"prescription.created": "secondary",
	"prescription.discontinued": "outline",
	"settings.updated": "outline",
	"staff.deactivated": "destructive",
	"staff.invited": "secondary",
};

function AuditLogPage() {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return ENTRIES;
		return ENTRIES.filter(
			(e) =>
				e.actorName.toLowerCase().includes(q) ||
				e.actorEmail.toLowerCase().includes(q) ||
				e.target.toLowerCase().includes(q) ||
				e.action.toLowerCase().includes(q)
		);
	}, [query]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Audit log</CardTitle>
				<CardDescription>
					Every action that modifies clinic data or authentication
					state.
				</CardDescription>
				<Input
					aria-label="Search audit log"
					className="mt-3 max-w-sm"
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search by actor, action, or target…"
					value={query}
				/>
			</CardHeader>
			<CardContent className="flex flex-col">
				{filtered.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-sm">
						No matching entries.
					</p>
				) : (
					filtered.map((entry, i) => (
						<div key={entry.id}>
							{i > 0 && (
								<div className="border-border border-t" />
							)}
							<div className="flex items-start justify-between gap-4 py-3">
								<div className="flex min-w-0 flex-col gap-1">
									<div className="flex items-center gap-2">
										<Badge
											className="font-mono text-[11px]"
											variant={
												ACTION_VARIANT[entry.action]
											}
										>
											{entry.action}
										</Badge>
										<span className="text-muted-foreground text-xs">
											{entry.at.toLocaleString("en-US", {
												dateStyle: "medium",
												timeStyle: "short",
											})}
										</span>
									</div>
									<span className="truncate text-foreground text-sm">
										{entry.actorName}{" "}
										<span className="text-muted-foreground">
											&lt;{entry.actorEmail}&gt;
										</span>
									</span>
									<span className="truncate text-muted-foreground text-xs">
										Target: {entry.target}
									</span>
								</div>
								<span className="shrink-0 font-mono text-muted-foreground text-xs">
									{entry.ip}
								</span>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
