import { cn } from "@smart/ui/lib/utils";
import type { usePatientById } from "@/hooks/use-patients";

type Patient = NonNullable<ReturnType<typeof usePatientById>["data"]>;

export function PatientBadge({ patient }: { patient: Patient }) {
	const isMale = patient.gender === "male";
	const initials =
		`${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`.toUpperCase();

	return (
		<div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
			<div
				className={cn(
					"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-sm",
					isMale
						? "border border-primary/20 bg-primary/10 text-primary"
						: "border border-module-prescriptions/20 bg-module-prescriptions/10 text-module-prescriptions"
				)}
			>
				{initials}
			</div>
			<div>
				<p className="font-bold">
					{patient.firstName} {patient.lastName}
				</p>
				<p className="text-muted-foreground text-xs">
					MRN: {patient.mrn}
				</p>
			</div>
		</div>
	);
}
