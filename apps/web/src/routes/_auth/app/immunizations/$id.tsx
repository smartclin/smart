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
import {
	ArrowLeft,
	Badge,
	Calendar,
	Pencil,
	Syringe,
	User,
} from "lucide-react";
import { useImmunizationById } from "@/hooks/use-immunizations";

export const Route = createFileRoute("/_auth/app/immunizations/$id")({
	component: ImmunizationDetailPage,
});

function ImmunizationDetailPage() {
	const { id: immunizationId } = Route.useParams();
	const { data: immunization, isLoading } =
		useImmunizationById(immunizationId);

	if (isLoading) return <Skeleton className="h-96" />;
	if (!immunization) return <p>Immunization not found</p>;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Button
					className="w-fit"
					render={<Link to="/app/immunizations" />}
					size="sm"
					variant="ghost"
				>
					<ArrowLeft className="mr-2 size-4" />
					Back to Immunizations
				</Button>

				<Button
					render={
						<Link
							params={{ id: immunizationId }}
							to="/app/immunizations/$id/edit"
						/>
					}
					variant="outline"
				>
					<Pencil className="mr-2 size-4" />
					Edit
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Syringe className="size-4 text-primary" />
							{immunization.vaccineName}
						</CardTitle>
						<Badge>{immunization.status}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<InfoRow
						icon={User}
						label="Patient ID"
						value={immunization.patientId}
					/>
					<InfoRow
						icon={Syringe}
						label="Vaccine Code"
						value={immunization.vaccineCode}
					/>
					<InfoRow
						icon={Syringe}
						label="Target Disease"
						value={immunization.targetDisease}
					/>
					<InfoRow
						icon={Syringe}
						label="Dose"
						value={`${immunization.doseNumber}`}
					/>
					<InfoRow
						icon={Calendar}
						label="Due Date"
						value={new Date(
							immunization.dueDate
						).toLocaleDateString()}
					/>
					{immunization.administeredDate && (
						<InfoRow
							icon={Calendar}
							label="Administered"
							value={new Date(
								immunization.administeredDate
							).toLocaleDateString()}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
