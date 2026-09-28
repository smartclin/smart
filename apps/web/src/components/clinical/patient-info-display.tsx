import { Badge } from "@smart/ui/components/badge";
import { Card, CardContent } from "@smart/ui/components/card";
import { Skeleton } from "@smart/ui/components/skeleton";
import { cn } from "@smart/ui/lib/utils";
import {
	AlertTriangle,
	Calendar,
	FileText,
	Stethoscope,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PatientInfo {
	age?: string;
	allergies?: string[];
	dateOfBirth: string;
	firstName: string;
	gender?: string;
	id: string;
	lastName: string;
	mrn?: string;
	primaryCarePhysician?: string;
}

interface PatientInfoDisplayProps {
	className?: string;
	compact?: boolean;
	patientId?: string;
	showAge?: boolean;
	showAllergies?: boolean;
	showDOB?: boolean;
	showMRN?: boolean;
	showPrimaryCare?: boolean;
}

// Calculate age from DOB
function calculateAge(dateOfBirth: string): string {
	const dob = new Date(dateOfBirth);
	const today = new Date();
	let years = today.getFullYear() - dob.getFullYear();
	let months = today.getMonth() - dob.getMonth();

	if (months < 0) {
		years -= 1;
		months += 12;
	}

	if (years < 1) {
		return `${months} months`;
	}
	if (years < 2) {
		return `${years} year, ${months} months`;
	}
	return `${years} years`;
}

export function PatientInfoDisplay({
	className,
	patientId,
	showAge = true,
	showDOB = true,
	showMRN = true,
	showAllergies = true,
	showPrimaryCare = false,
	compact = false,
}: PatientInfoDisplayProps) {
	const [patient, setPatient] = useState<PatientInfo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadPatient() {
			if (!patientId) {
				// Demo data when no patientId provided
				setPatient({
					id: "demo",
					firstName: "Emma",
					lastName: "Johnson",
					dateOfBirth: "2022-03-15",
					mrn: "MRN-2024-001234",
					gender: "Female",
					allergies: ["Penicillin", "Peanuts"],
					primaryCarePhysician: "Dr. Sarah Smith",
				});
				setLoading(false);
				return;
			}

			try {
				// Fetch from your API
				const response = await fetch(`/api/patients/${patientId}`);
				const data = await response.json();
				setPatient(data);
			} catch (error) {
				console.error("Failed to load patient:", error);
			} finally {
				setLoading(false);
			}
		}

		loadPatient();
	}, [patientId]);

	if (loading) {
		return (
			<Card className={cn("w-full", className)}>
				<CardContent className="space-y-2 p-4">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-32" />
				</CardContent>
			</Card>
		);
	}

	if (!patient) {
		return (
			<Card className={cn("w-full", className)}>
				<CardContent className="p-4">
					<p className="text-muted-foreground text-sm">
						No patient selected
					</p>
				</CardContent>
			</Card>
		);
	}

	const age = calculateAge(patient.dateOfBirth);
	const hasAllergies = patient.allergies && patient.allergies.length > 0;

	if (compact) {
		return (
			<div
				className={cn(
					"flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2",
					className
				)}
			>
				<User className="h-4 w-4 text-muted-foreground" />
				<span className="font-medium">
					{patient.firstName} {patient.lastName}
				</span>
				<Badge
					className="text-xs"
					variant="secondary"
				>
					{age}
				</Badge>
				{hasAllergies && (
					<Badge
						className="text-xs"
						variant="destructive"
					>
						<AlertTriangle className="mr-1 h-3 w-3" />
						Allergies
					</Badge>
				)}
			</div>
		);
	}

	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="space-y-3 p-4">
				{/* Name and Age */}
				<div className="flex items-start justify-between">
					<div>
						<h3 className="font-semibold text-lg">
							{patient.firstName} {patient.lastName}
						</h3>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							{showAge && (
								<span className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{age}
								</span>
							)}
							{patient.gender && (
								<span className="text-muted-foreground">
									• {patient.gender}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Details Grid */}
				<div className="grid grid-cols-2 gap-2 text-sm">
					{showDOB && (
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">DOB:</span>
							<span>
								{new Date(
									patient.dateOfBirth
								).toLocaleDateString()}
							</span>
						</div>
					)}

					{showMRN && patient.mrn && (
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">MRN:</span>
							<span className="font-mono text-xs">
								{patient.mrn}
							</span>
						</div>
					)}

					{showPrimaryCare && patient.primaryCarePhysician && (
						<div className="col-span-2 flex items-center gap-2">
							<Stethoscope className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">PCP:</span>
							<span>{patient.primaryCarePhysician}</span>
						</div>
					)}
				</div>

				{/* Allergies */}
				{showAllergies && hasAllergies && (
					<div className="border-t pt-2">
						<div className="mb-1 flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-destructive" />
							<span className="font-medium text-destructive text-sm">
								Allergies
							</span>
						</div>
						<div className="flex flex-wrap gap-1">
							{patient.allergies?.map((allergy) => (
								<Badge
									className="text-xs"
									key={allergy}
									variant="destructive"
								>
									{allergy}
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
