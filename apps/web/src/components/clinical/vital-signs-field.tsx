import { Badge } from "@smart/ui/components/badge";
import { Card, CardContent } from "@smart/ui/components/card";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import { cn } from "@smart/ui/lib/utils";
import { useCallback, useMemo, useState } from "react";

interface VitalSignsFieldProps {
	className?: string;
	onChange?: (vitals: VitalSignsData) => void;
	required?: boolean;
	showBMI?: boolean;
	showHeadCircumference?: boolean;
	showPainScale?: boolean;
}

export interface VitalSignsData {
	bloodPressure?: { systolic: number; diastolic: number };
	headCircumference?: { value: number; unit: "cm" | "in" };
	heartRate?: number;
	height?: { value: number; unit: "cm" | "in" };
	oxygenSaturation?: number;
	painScale?: number;
	respiratoryRate?: number;
	temperature?: { value: number; unit: "C" | "F" };
	weight?: { value: number; unit: "kg" | "lbs" };
}

export function VitalSignsField({
	className,
	showBMI = true,
	showHeadCircumference = false,
	showPainScale = false,
	required = false,
	onChange,
}: VitalSignsFieldProps) {
	const [vitals, setVitals] = useState<VitalSignsData>({});

	const handleChange = useCallback(
		(field: keyof VitalSignsData, value: unknown) => {
			const updated = { ...vitals, [field]: value };
			setVitals(updated);
			onChange?.(updated);
		},
		[vitals, onChange]
	);

	const bmi = useMemo(() => {
		if (vitals.weight && vitals.height) {
			const weightKg =
				vitals.weight.unit === "kg"
					? vitals.weight.value
					: vitals.weight.value * 0.453_592;
			const heightM =
				vitals.height.unit === "cm"
					? vitals.height.value / 100
					: vitals.height.value * 0.0254;
			if (heightM > 0) {
				return (weightKg / (heightM * heightM)).toFixed(1);
			}
		}
		return null;
	}, [vitals.weight, vitals.height]);

	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="space-y-4 p-4">
				<div className="flex items-center justify-between">
					<h4 className="font-semibold text-sm">Vital Signs</h4>
					{required && <Badge variant="destructive">Required</Badge>}
				</div>

				<div className="grid grid-cols-2 gap-4">
					{/* Weight */}
					<div className="space-y-1">
						<Label className="text-xs">Weight</Label>
						<div className="flex gap-2">
							<Input
								className="flex-1"
								onChange={(e) =>
									handleChange("weight", {
										value: Number.parseFloat(
											e.target.value
										),
										unit: vitals.weight?.unit || "kg",
									})
								}
								placeholder="0"
								type="number"
							/>
							<select
								className="rounded-md border px-2 text-sm"
								onChange={(e) =>
									handleChange("weight", {
										value: vitals.weight?.value || 0,
										unit: e.target.value as "kg" | "lbs",
									})
								}
								value={vitals.weight?.unit || "kg"}
							>
								<option value="kg">kg</option>
								<option value="lbs">lbs</option>
							</select>
						</div>
					</div>

					{/* Height */}
					<div className="space-y-1">
						<Label className="text-xs">Height</Label>
						<div className="flex gap-2">
							<Input
								className="flex-1"
								onChange={(e) =>
									handleChange("height", {
										value: Number.parseFloat(
											e.target.value
										),
										unit: vitals.height?.unit || "cm",
									})
								}
								placeholder="0"
								type="number"
							/>
							<select
								className="rounded-md border px-2 text-sm"
								onChange={(e) =>
									handleChange("height", {
										value: vitals.height?.value || 0,
										unit: e.target.value as "cm" | "in",
									})
								}
								value={vitals.height?.unit || "cm"}
							>
								<option value="cm">cm</option>
								<option value="in">in</option>
							</select>
						</div>
					</div>

					{/* Head Circumference */}
					{showHeadCircumference && (
						<div className="space-y-1">
							<Label className="text-xs">
								Head Circumference
							</Label>
							<div className="flex gap-2">
								<Input
									className="flex-1"
									onChange={(e) =>
										handleChange("headCircumference", {
											value: Number.parseFloat(
												e.target.value
											),
											unit: "cm",
										})
									}
									placeholder="0"
									type="number"
								/>
								<span className="flex items-center text-muted-foreground text-sm">
									cm
								</span>
							</div>
						</div>
					)}

					{/* Temperature */}
					<div className="space-y-1">
						<Label className="text-xs">Temperature</Label>
						<div className="flex gap-2">
							<Input
								className="flex-1"
								onChange={(e) =>
									handleChange("temperature", {
										value: Number.parseFloat(
											e.target.value
										),
										unit: vitals.temperature?.unit || "F",
									})
								}
								placeholder="98.6"
								step="0.1"
								type="number"
							/>
							<select
								className="rounded-md border px-2 text-sm"
								onChange={(e) =>
									handleChange("temperature", {
										value: vitals.temperature?.value || 0,
										unit: e.target.value as "C" | "F",
									})
								}
								value={vitals.temperature?.unit || "F"}
							>
								<option value="F">°F</option>
								<option value="C">°C</option>
							</select>
						</div>
					</div>

					{/* Heart Rate */}
					<div className="space-y-1">
						<Label className="text-xs">Heart Rate (bpm)</Label>
						<Input
							onChange={(e) =>
								handleChange(
									"heartRate",
									Number.parseInt(e.target.value, 10)
								)
							}
							placeholder="80"
							type="number"
						/>
					</div>

					{/* Respiratory Rate */}
					<div className="space-y-1">
						<Label className="text-xs">Respiratory Rate</Label>
						<Input
							onChange={(e) =>
								handleChange(
									"respiratoryRate",
									Number.parseInt(e.target.value, 10)
								)
							}
							placeholder="20"
							type="number"
						/>
					</div>

					{/* Blood Pressure */}
					<div className="space-y-1">
						<Label className="text-xs">Blood Pressure</Label>
						<div className="flex items-center gap-1">
							<Input
								className="flex-1"
								onChange={(e) =>
									handleChange("bloodPressure", {
										systolic: Number.parseInt(
											e.target.value,
											10
										),
										diastolic:
											vitals.bloodPressure?.diastolic ||
											0,
									})
								}
								placeholder="Sys"
								type="number"
							/>
							<span className="text-muted-foreground">/</span>
							<Input
								className="flex-1"
								onChange={(e) =>
									handleChange("bloodPressure", {
										systolic:
											vitals.bloodPressure?.systolic || 0,
										diastolic: Number.parseInt(
											e.target.value,
											10
										),
									})
								}
								placeholder="Dia"
								type="number"
							/>
						</div>
					</div>

					{/* Oxygen Saturation */}
					<div className="space-y-1">
						<Label className="text-xs">O2 Saturation (%)</Label>
						<Input
							max="100"
							min="0"
							onChange={(e) =>
								handleChange(
									"oxygenSaturation",
									Number.parseInt(e.target.value, 10)
								)
							}
							placeholder="98"
							type="number"
						/>
					</div>
				</div>

				{/* Pain Scale */}
				{showPainScale && (
					<div className="space-y-2">
						<Label className="text-xs">Pain Scale (0-10)</Label>
						<div className="flex gap-1">
							{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
								<button
									className={cn(
										"h-8 w-8 rounded font-medium text-xs transition-colors",
										vitals.painScale === level
											? "bg-primary text-primary-foreground"
											: "bg-muted hover:bg-muted/80"
									)}
									key={level}
									onClick={() =>
										handleChange("painScale", level)
									}
									type="button"
								>
									{level}
								</button>
							))}
						</div>
					</div>
				)}

				{/* BMI Display */}
				{showBMI && bmi && (
					<div className="border-t pt-2">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								Calculated BMI
							</span>
							<Badge
								className="font-mono"
								variant="secondary"
							>
								{bmi} kg/m²
							</Badge>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
