// src/routes/_auth/app/staff/$staffId/index.tsx

import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { InfoRow } from "@smart/ui/components/info-row";
import { Skeleton } from "@smart/ui/components/skeleton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, Shield, User } from "lucide-react";

import { useStaffById } from "@/hooks/use-staff";

export const Route = createFileRoute("/_auth/app/staff/$staffId/")({
	component: StaffDetailPage,
});

function StaffDetailPage() {
	const { staffId } = Route.useParams();
	const { data: staff, isLoading } = useStaffById(staffId);

	if (isLoading) return <Skeleton className="h-96" />;
	if (!staff) return <p>Staff member not found</p>;

	return (
		<div className="space-y-6">
			<Button
				className="w-fit"
				render={
					<Link to="/app/staff">
						<ArrowLeft className="mr-2 size-4" />
						Back to Staff
					</Link>
				}
				size="sm"
				variant="ghost"
			/>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>{staff.name}</CardTitle>
						<Badge
							variant={staff.isActive ? "default" : "secondary"}
						>
							{staff.isActive ? "Active" : "Inactive"}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<InfoRow
						icon={User}
						label="Title"
						value={staff.title}
					/>
					<InfoRow
						icon={Shield}
						label="Role"
						value={staff.role}
					/>
					<InfoRow
						icon={Mail}
						label="Email"
						value={staff.email}
					/>

					{staff.phone && (
						<InfoRow
							icon={Phone}
							label="Phone"
							value={staff.phone}
						/>
					)}

					{staff.specialty && (
						<InfoRow
							icon={User}
							label="Specialty"
							value={staff.specialty}
						/>
					)}

					{staff.department && (
						<InfoRow
							icon={User}
							label="Department"
							value={staff.department}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
