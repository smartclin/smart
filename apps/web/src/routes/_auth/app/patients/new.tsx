// src/routes/_auth/app/patients/new.tsx

import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { toast } from "@smart/ui/components/toast";
import {
	FormActions,
	FormErrors,
	FormSection,
	useAppForm,
	useFormFields,
} from "@smart/ui/form";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { X } from "lucide-react";
import { useMemo } from "react";
import * as z from "zod";
import { requireRole } from "@/functions/get-user";
import { useAuth } from "@/hooks/auth";
import { useCreatePatient } from "@/hooks/use-mutations";

export const Route = createFileRoute("/_auth/app/patients/new")({
	component: NewPatientPage,
	beforeLoad: async () => {
		const user = await requireRole({ data: ["admin", "doctor"] });
		if (!user) {
			throw redirect({ to: "/login" });
		}
		return { role: user.role };
	},
});

// ─── Schema ──────────────────────────────────────────────────────────────────

const patientFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	gender: z.enum(["male", "female"]),
	bloodGroup: z.enum([
		"A+",
		"A-",
		"B+",
		"B-",
		"AB+",
		"AB-",
		"O+",
		"O-",
		"Unknown",
	]),
	mrn: z.string().min(1, "Medical record number is required"),
	gestationWeeksAtBirth: z.string().optional(),
	birthWeightKg: z.string().optional(),
	birthLengthCm: z.string().optional(),
	deliveryMethod: z.enum(["Vaginal", "Cesarean", "Assisted"]).optional(),
	contactNumber: z.string().optional(),
	email: z.string().email("Enter a valid email").optional().or(z.literal("")),
	preferredLanguage: z.string().optional(),
	notes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

// ─── Options ─────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
] as const;

const BLOOD_GROUP_OPTIONS = [
	{ value: "A+", label: "A+" },
	{ value: "A-", label: "A-" },
	{ value: "B+", label: "B+" },
	{ value: "B-", label: "B-" },
	{ value: "AB+", label: "AB+" },
	{ value: "AB-", label: "AB-" },
	{ value: "O+", label: "O+" },
	{ value: "O-", label: "O-" },
	{ value: "Unknown", label: "Unknown" },
] as const;

const DELIVERY_METHOD_OPTIONS = [
	{ value: "Vaginal", label: "Vaginal" },
	{ value: "Cesarean", label: "Cesarean" },
	{ value: "Assisted", label: "Assisted" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateMRN(): string {
	const year = new Date().getFullYear();
	const random = String(Math.floor(1000 + Math.random() * 9000)).padStart(
		4,
		"0"
	);
	return `PED-${year}-${random}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

function NewPatientPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const createPatient = useCreatePatient();

	const defaultMRN = useMemo(() => generateMRN(), []);
	const today = new Date().toISOString();

	const form = useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			dateOfBirth: "",
			gender: "male",
			bloodGroup: "Unknown",
			mrn: defaultMRN,
			gestationWeeksAtBirth: "",
			birthWeightKg: "",
			birthLengthCm: "",
			deliveryMethod: "Vaginal",
			contactNumber: "",
			email: "",
			preferredLanguage: "English",
			notes: "",
		} as PatientFormValues,
		validators: {
			onSubmit: patientFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!user) {
				toast.add({
					type: "error",
					description: "You must be signed in to register a patient.",
				});
				return;
			}

			try {
				const result = await createPatient.mutateAsync({
					patient: {
						mrn: value.mrn.trim(),
						firstName: value.firstName.trim(),
						lastName: value.lastName.trim(),
						dateOfBirth: value.dateOfBirth,
						gender: value.gender,
						bloodGroup: value.bloodGroup || "Unknown",
						userId: user.id,
						contactNumber: value.contactNumber?.trim() || undefined,
						preferredLanguage:
							value.preferredLanguage?.trim() || "English",
						activeStatus: "Active",
						notes: value.notes?.trim() || undefined,
						gestationWeeksAtBirth: Number.parseFloat(
							value.gestationWeeksAtBirth ?? ""
						),
						deliveryMethod: value.deliveryMethod || "Vaginal",
						birthWeightKg: value.birthWeightKg
							? Number.parseFloat(value.birthWeightKg)
							: undefined,
						birthLengthCm: value.birthLengthCm
							? Number.parseFloat(value.birthLengthCm)
							: undefined,
					},
				});

				if (result) {
					toast.add({
						type: "success",
						description: `${value.firstName} ${value.lastName} has been registered.`,
					});
					navigate({ to: "/app/patients" });
				}
			} catch (error) {
				toast.add({
					type: "error",
					description:
						error instanceof Error
							? error.message
							: "Failed to register patient.",
				});
			}
		},
	});

	const { FormTextField, FormSelectField, FormDateField, FormTextareaField } =
		useFormFields<PatientFormValues>();

	const isSaving = createPatient.isPending;

	return (
		<div className="container mx-auto max-w-2xl py-6">
			{/* ─── Header ──────────────────────────────────────────────────────── */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl text-slate-800">
						Register New Patient
					</h1>
					<p className="text-slate-500 text-sm">
						Enter demographics and birth history to create a new
						patient record.
					</p>
				</div>
				<Button
					render={
						<Link to="/app/patients">
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Link>
					}
					size="sm"
					variant="ghost"
				/>
			</div>

			{/* ─── Form ────────────────────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Patient Details</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form.Form className="space-y-6">
							<FormErrors />

							{/* ── Demographics ── */}
							<FormSection
								columns={2}
								description="Basic identifying information for the patient record."
								title="Demographics"
							>
								<FormTextField
									label="First Name"
									name="firstName"
									placeholder="Jane"
									required
									validators={{
										onBlur: z
											.string()
											.min(1, "First name is required"),
									}}
								/>

								<FormTextField
									label="Last Name"
									name="lastName"
									placeholder="Doe"
									required
									validators={{
										onBlur: z
											.string()
											.min(1, "Last name is required"),
									}}
								/>

								<FormDateField
									label="Date of Birth"
									max={today}
									name="dateOfBirth"
									required
									validators={{
										onBlur: z
											.string()
											.min(
												1,
												"Date of birth is required"
											),
									}}
								/>

								<FormSelectField
									label="Gender"
									name="gender"
									options={GENDER_OPTIONS}
									required
								/>

								<FormSelectField
									label="Blood Group"
									name="bloodGroup"
									options={BLOOD_GROUP_OPTIONS}
								/>

								<FormTextField
									label="Medical Record Number"
									name="mrn"
									placeholder="PED-2026-0001"
									required
									validators={{
										onBlur: z
											.string()
											.min(
												1,
												"Medical record number is required"
											),
									}}
								/>
							</FormSection>

							{/* ── Birth History ── */}
							<FormSection
								columns={2}
								description="Gestational and birth details. Optional, but useful for growth tracking."
								title="Birth History"
							>
								<FormTextField
									label="Gestation (weeks)"
									max={45}
									min={20}
									name="gestationWeeksAtBirth"
									placeholder="40"
									step={0.5}
									type="number"
								/>

								<FormTextField
									label="Birth Weight (kg)"
									max={10}
									min={0.5}
									name="birthWeightKg"
									placeholder="3.2"
									step={0.01}
									type="number"
								/>

								<FormTextField
									label="Birth Length (cm)"
									max={60}
									min={20}
									name="birthLengthCm"
									placeholder="50"
									step={0.1}
									type="number"
								/>

								<FormSelectField
									label="Delivery Method"
									name="deliveryMethod"
									options={DELIVERY_METHOD_OPTIONS}
								/>
							</FormSection>

							{/* ── Contact ── */}
							<FormSection
								columns={2}
								description="How to reach the family or guardian."
								title="Contact"
							>
								<FormTextField
									label="Contact Number"
									name="contactNumber"
									placeholder="+1 (555) 000-0000"
									type="tel"
								/>

								<FormTextField
									label="Email"
									name="email"
									placeholder="guardian@example.com"
									type="email"
									validators={{
										onBlur: z
											.string()
											.email("Enter a valid email")
											.optional()
											.or(z.literal("")),
									}}
								/>

								<FormTextField
									label="Preferred Language"
									name="preferredLanguage"
									placeholder="English"
								/>
							</FormSection>

							{/* ── Notes ── */}
							<FormSection
								columns={1}
								description="Any additional context for the patient's care team."
								title="Notes"
							>
								<FormTextareaField
									label="Clinical Notes"
									name="notes"
									placeholder="Allergies, family history, or anything the care team should know…"
									rows={3}
								/>
							</FormSection>

							{/* ── Actions ── */}
							<FormActions
								cancelLabel="Cancel"
								isSubmitting={isSaving}
								onCancel={() =>
									navigate({ to: "/app/patients" })
								}
								submitLabel={
									isSaving
										? "Registering…"
										: "Register Patient"
								}
							/>
						</form.Form>
					</form.AppForm>
				</CardContent>
			</Card>
		</div>
	);
}
