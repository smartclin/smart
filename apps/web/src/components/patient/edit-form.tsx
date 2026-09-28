import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import {
	FormActions,
	FormErrors,
	FormSection,
	useAppForm,
	useFormFields,
} from "@smart/ui/form";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import type { usePatientById } from "@/hooks/use-patients";

// Re-import schema + options from where they live.
// If you kept them inline in `edit.tsx`, move them here instead —
// `edit.tsx` should only contain the route component.

import { buildFormValues } from "@smart/db/zod";
import { type PatientFormValues, patientFormSchema } from "@/lib/schema";
import {
	BLOOD_GROUP_OPTIONS,
	DELIVERY_METHOD_OPTIONS,
	GENDER_OPTIONS,
	STATUS_OPTIONS,
} from "../table/columns";
import { PatientBadge } from "./badge";

type Patient = NonNullable<ReturnType<typeof usePatientById>["data"]>;

export function EditPatientForm({
	patient,
	patientId,
	onSave,
}: {
	patient: Patient;
	patientId: string;
	onSave: (value: PatientFormValues) => Promise<void>;
}) {
	const today = useMemo(() => new Date().toISOString(), []);
	const initialValues = useMemo(() => buildFormValues(patient), [patient]);

	const form = useAppForm({
		defaultValues: initialValues,
		validators: { onSubmit: patientFormSchema },
		onSubmit: async ({ value }) => {
			try {
				await onSave(value);
				toast.success(
					`Patient ${value.firstName} ${value.lastName} updated`
				);
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update patient."
				);
			}
		},
	});

	const { FormTextField, FormSelectField, FormDateField, FormTextareaField } =
		useFormFields<PatientFormValues>();

	const isSaving = form.state.isSubmitting;

	return (
		<div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Edit patient</h1>
					<p className="text-muted-foreground text-sm">
						{patient.firstName} {patient.lastName}
					</p>
				</div>
				<Link
					params={{ id: patientId }}
					to="/app/patients/$id"
				>
					<Button
						size="sm"
						variant="ghost"
					>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
				</Link>
			</div>

			<PatientBadge patient={patient} />

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Patient details</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form.Form className="space-y-6">
							<FormErrors />

							<FormSection
								columns={2}
								description="Basic identity and clinical identifiers."
								title="Demographics"
							>
								<FormTextField
									label="First name"
									name="firstName"
									placeholder="e.g. Layla"
									required
								/>
								<FormTextField
									label="Last name"
									name="lastName"
									placeholder="e.g. Hassan"
									required
								/>
								<FormDateField
									label="Date of birth"
									max={today}
									name="dateOfBirth"
									required
								/>
								<FormSelectField
									label="Gender"
									name="gender"
									options={[...GENDER_OPTIONS]}
									required
								/>
								<FormSelectField
									label="Blood group"
									name="bloodGroup"
									options={[...BLOOD_GROUP_OPTIONS]}
								/>
								<FormTextField
									label="Medical record number (MRN)"
									name="mrn"
									placeholder="e.g. MRN-00123"
									required
								/>
							</FormSection>

							<FormSection
								columns={2}
								description="Neonatal history, where relevant."
								title="Birth history"
							>
								<FormTextField
									label="Gestation at birth (weeks)"
									max={45}
									min={20}
									name="gestationWeeksAtBirth"
									placeholder="e.g. 39"
									step={0.5}
									type="number"
								/>
								<FormTextField
									label="Birth weight (kg)"
									max={10}
									min={0.5}
									name="birthWeightKg"
									placeholder="e.g. 3.4"
									step={0.01}
									type="number"
								/>
								<FormTextField
									label="Birth length (cm)"
									max={60}
									min={20}
									name="birthLengthCm"
									placeholder="e.g. 50"
									step={0.1}
									type="number"
								/>
								<FormSelectField
									label="Delivery method"
									name="deliveryMethod"
									options={[...DELIVERY_METHOD_OPTIONS]}
								/>
							</FormSection>

							<FormSection
								columns={2}
								description="How to reach the patient or guardian."
								title="Contact"
							>
								<FormTextField
									label="Contact number"
									name="contactNumber"
									placeholder="+20 100 000 0000"
									type="tel"
								/>
								<FormTextField
									label="Email"
									name="email"
									placeholder="guardian@example.com"
									type="email"
								/>
								<FormTextField
									label="Preferred language"
									name="preferredLanguage"
									placeholder="e.g. Arabic, English"
								/>
							</FormSection>

							<FormSection
								columns={2}
								description="Whether this patient is currently receiving care."
								title="Status"
							>
								<FormSelectField
									label="Active status"
									name="activeStatus"
									options={[...STATUS_OPTIONS]}
								/>
							</FormSection>

							<FormSection
								columns={1}
								description="Anything worth flagging for the care team."
								title="Notes"
							>
								<FormTextareaField
									label="Clinical notes"
									maxLength={2000}
									name="notes"
									placeholder="Allergies, preferences, anything the care team should know…"
								/>
							</FormSection>

							<FormActions
								isSubmitting={isSaving}
								onCancel={() => {
									window.history.back();
								}}
								submitLabel={
									isSaving ? "Saving…" : "Save changes"
								}
							/>
						</form.Form>
					</form.AppForm>
				</CardContent>
			</Card>
		</div>
	);
}
