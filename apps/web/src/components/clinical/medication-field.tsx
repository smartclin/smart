import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import { Card, CardContent } from "@smart/ui/components/card";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import { cn } from "@smart/ui/lib/utils";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

interface Medication {
	dosage?: string;
	duration?: string;
	frequency?: string;
	id: string;
	instructions?: string;
	name: string;
}

interface MedicationFieldProps {
	className?: string;
	onChange?: (medications: Medication[]) => void;
	required?: boolean;
	showDosageCalculator?: boolean;
	showDuration?: boolean;
	showFrequency?: boolean;
	showInstructions?: boolean;
	weightBased?: boolean;
}

const COMMON_FREQUENCIES = [
	"Once daily",
	"Twice daily",
	"Three times daily",
	"Four times daily",
	"Every 4 hours",
	"Every 6 hours",
	"Every 8 hours",
	"As needed",
];

const COMMON_DURATIONS = [
	"3 days",
	"5 days",
	"7 days",
	"10 days",
	"14 days",
	"30 days",
];

export function MedicationField({
	className,
	showDosageCalculator = true,
	showFrequency = true,
	showDuration = true,
	showInstructions = true,
	weightBased = true,
	required = false,
	onChange,
}: MedicationFieldProps) {
	const [medications, setMedications] = useState<Medication[]>([
		{ id: crypto.randomUUID(), name: "" },
	]);

	const handleUpdate = useCallback(
		(id: string, field: keyof Medication, value: string) => {
			const updated = medications.map((med) =>
				med.id === id ? { ...med, [field]: value } : med
			);
			setMedications(updated);
			onChange?.(updated);
		},
		[medications, onChange]
	);

	const handleAdd = useCallback(() => {
		const updated = [...medications, { id: crypto.randomUUID(), name: "" }];
		setMedications(updated);
		onChange?.(updated);
	}, [medications, onChange]);

	const handleRemove = useCallback(
		(id: string) => {
			if (medications.length <= 1) return;
			const updated = medications.filter((med) => med.id !== id);
			setMedications(updated);
			onChange?.(updated);
		},
		[medications, onChange]
	);

	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="space-y-4 p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h4 className="font-semibold text-sm">Medications</h4>
						{required && (
							<Badge variant="destructive">Required</Badge>
						)}
					</div>
					<Button
						onClick={handleAdd}
						size="sm"
						type="button"
						variant="outline"
					>
						<Plus className="mr-1 h-4 w-4" />
						Add
					</Button>
				</div>

				{medications.map((med, index) => (
					<div
						className="space-y-3 rounded-lg border bg-muted/30 p-3"
						key={med.id}
					>
						<div className="flex items-center justify-between">
							<span className="font-medium text-muted-foreground text-xs">
								Medication #{index + 1}
							</span>
							{medications.length > 1 && (
								<Button
									onClick={() => handleRemove(med.id)}
									size="icon-sm"
									type="button"
									variant="ghost"
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							)}
						</div>

						{/* Medication Name */}
						<div className="space-y-1">
							<Label className="text-xs">Medication Name</Label>
							<div className="flex gap-2">
								<Input
									onChange={(e) =>
										handleUpdate(
											med.id,
											"name",
											e.target.value
										)
									}
									placeholder="e.g., Amoxicillin"
									value={med.name}
								/>
								{showDosageCalculator && (
									<Button
										size="icon"
										title="Calculate dosage"
										type="button"
										variant="outline"
									>
										<Calculator className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							{/* Dosage */}
							<div className="space-y-1">
								<Label className="text-xs">
									Dosage {weightBased && "(mg/kg)"}
								</Label>
								<Input
									onChange={(e) =>
										handleUpdate(
											med.id,
											"dosage",
											e.target.value
										)
									}
									placeholder={
										weightBased
											? "e.g., 45 mg/kg"
											: "e.g., 500 mg"
									}
									value={med.dosage || ""}
								/>
							</div>

							{/* Frequency */}
							{showFrequency && (
								<div className="space-y-1">
									<Label className="text-xs">Frequency</Label>
									<select
										className="w-full rounded-md border px-3 py-2 text-sm"
										onChange={(e) =>
											handleUpdate(
												med.id,
												"frequency",
												e.target.value
											)
										}
										value={med.frequency || ""}
									>
										<option value="">
											Select frequency...
										</option>
										{COMMON_FREQUENCIES.map((freq) => (
											<option
												key={freq}
												value={freq}
											>
												{freq}
											</option>
										))}
									</select>
								</div>
							)}

							{/* Duration */}
							{showDuration && (
								<div className="space-y-1">
									<Label className="text-xs">Duration</Label>
									<select
										className="w-full rounded-md border px-3 py-2 text-sm"
										onChange={(e) =>
											handleUpdate(
												med.id,
												"duration",
												e.target.value
											)
										}
										value={med.duration || ""}
									>
										<option value="">
											Select duration...
										</option>
										{COMMON_DURATIONS.map((dur) => (
											<option
												key={dur}
												value={dur}
											>
												{dur}
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						{/* Instructions */}
						{showInstructions && (
							<div className="space-y-1">
								<Label className="text-xs">
									Special Instructions
								</Label>
								<Input
									onChange={(e) =>
										handleUpdate(
											med.id,
											"instructions",
											e.target.value
										)
									}
									placeholder="e.g., Take with food, complete full course"
									value={med.instructions || ""}
								/>
							</div>
						)}
					</div>
				))}
			</CardContent>
		</Card>
	);
}

export type { Medication };
