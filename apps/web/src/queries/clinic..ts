// src/lib/hooks/clinic.ts

import type { Appointment, Patient, VitalSigns } from "@smart/db/schema";
import type {
	Encounter,
	GrowthMeasurement,
	Immunization,
	LabOrder,
	Prescription,
} from "@smart/db/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppointments } from "./appointments";
import { useRecentEncounters } from "./encounters";
import { useAllOverdueImmunizations } from "./immunizations";
import { usePatient, usePatients } from "./patients";
import { usePrescriptions } from "./prescriptions";

export type ClinicView =
	| "dashboard"
	| "patients"
	| "patient-detail"
	| "encounters"
	| "growth"
	| "immunizations"
	| "appointments"
	| "prescriptions"
	| "labs"
	| "analytics"
	| "settings";

export interface ToastMessage {
	id: string;
	message: string;
	title: string;
	type: "success" | "info" | "warning" | "error";
}

export type ModalType =
	| "new-patient"
	| "edit-patient"
	| "new-encounter"
	| "new-vitals"
	| "new-growth"
	| "new-vaccine"
	| "new-appointment"
	| "new-rx"
	| "edit-rx"
	| "dosage-calc"
	| "new-lab"
	| null;

export interface ClinicContextType {
	// Appointments
	appointments: Appointment[];
	appointmentsError: Error | null;
	appointmentsLoading: boolean;
	closeModal: () => void;
	// Navigation & View State
	currentView: ClinicView;
	deleteAppointment: (id: string) => Promise<boolean>;
	deletePatient: (id: string) => Promise<boolean>;
	dismissToast: (id: string) => void;

	// Encounters
	encounters: Encounter[];

	// Search & Filter
	globalSearch: string;

	// Growth
	growth: GrowthMeasurement[];

	// Immunizations
	immunizations: Immunization[];

	// Lab Orders
	labOrders: LabOrder[];
	modalState: {
		type: ModalType | null;
		data: Record<string, unknown> | null;
	};

	// Modal Management
	openModal: (type: ModalType, data?: Record<string, unknown>) => void;
	overdueCount: number;
	overdueImmunizations: Immunization[];

	// Live Data
	patients: Patient[];
	patientsError: Error | null;
	patientsLoading: boolean;

	// Prescriptions
	prescriptions: Prescription[];
	prescriptionsLoading: boolean;
	recentEncounters: Encounter[];
	recentEncountersLoading: boolean;
	refetchAppointments: () => void;
	refetchPatients: () => void;

	// Data Refresh
	refreshData: () => void;
	saveAppointment: (
		appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
	) => Promise<Appointment | null>;
	saveEncounter: (
		encounter: Omit<Encounter, "id" | "createdAt" | "updatedAt">
	) => Promise<Encounter | null>;
	saveGrowthMeasurement: (
		growth: Omit<GrowthMeasurement, "id" | "createdAt" | "updatedAt">
	) => Promise<GrowthMeasurement | null>;
	saveImmunization: (
		immunization: Omit<Immunization, "id" | "createdAt" | "updatedAt">
	) => Promise<Immunization | null>;
	saveLabOrder: (
		labOrder: Omit<LabOrder, "id" | "createdAt" | "updatedAt">
	) => Promise<LabOrder | null>;

	// CRUD Operations
	savePatient: (
		patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
	) => Promise<Patient | null>;
	savePrescription: (
		prescription: Omit<Prescription, "id" | "createdAt" | "updatedAt">
	) => Promise<Prescription | null>;
	saveVitals: (
		vitals: Omit<VitalSigns, "id" | "createdAt" | "updatedAt">
	) => Promise<VitalSigns | null>;
	selectedPatient: Patient | null;
	selectedPatientId: string | null;
	selectPatientAndNavigate: (id: string, view?: ClinicView) => void;
	setCurrentView: (view: ClinicView) => void;
	setGlobalSearch: (q: string) => void;
	setSelectedPatientId: (id: string | null) => void;
	showToast: (
		type: ToastMessage["type"],
		title: string,
		message: string
	) => void;

	// Toasts
	toasts: ToastMessage[];
}

// ============================================================
// Helpers
// ============================================================

// Query hooks return either a bare array or a { data, total } envelope.
function unwrapList<T>(raw: unknown): T[] {
	if (Array.isArray(raw)) return raw as T[];
	if (raw && typeof raw === "object" && "data" in raw) {
		const inner = (raw as { data: unknown }).data;
		if (Array.isArray(inner)) return inner as T[];
	}
	return [];
}

// ============================================================
// Hook Implementation
// ============================================================

export function useClinic(): ClinicContextType {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// ============================================================
	// State
	// ============================================================

	const [currentView, setCurrentView] = useState<ClinicView>("dashboard");
	const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
		null
	);
	const [globalSearch, setGlobalSearch] = useState("");
	const [toasts, setToasts] = useState<ToastMessage[]>([]);
	const [modalState, setModalState] = useState<{
		type: ModalType | null;
		data: Record<string, unknown> | null;
	}>({
		type: null,
		data: null,
	});

	// ============================================================
	// React Query Hooks
	// ============================================================

	// Patients
	const patientsQuery = usePatients({
		limit: 1000,
		activeStatus: "Active",
	});
	const patients = useMemo(
		() => unwrapList<Patient>(patientsQuery.data),
		[patientsQuery.data]
	);
	const patientsLoading = patientsQuery.isLoading;
	const patientsError = patientsQuery.error ?? null;

	// Appointments
	const appointmentsQuery = useAppointments({
		limit: 1000,
	});
	const appointments = useMemo(
		() => unwrapList<Appointment>(appointmentsQuery.data),
		[appointmentsQuery.data]
	);
	const appointmentsLoading = appointmentsQuery.isLoading;
	const appointmentsError = appointmentsQuery.error ?? null;

	// Selected Patient
	const selectedPatientQuery = usePatient(selectedPatientId || "");
	const selectedPatient = useMemo(() => {
		if (!selectedPatientId) return null;
		const found = patients.find((p) => p.id === selectedPatientId);
		if (found) return found;
		if (
			selectedPatientQuery.data &&
			typeof selectedPatientQuery.data === "object" &&
			"activeStatus" in selectedPatientQuery.data
		) {
			return selectedPatientQuery.data;
		}
		return null;
	}, [selectedPatientId, patients, selectedPatientQuery.data]);

	// Recent Encounters
	const recentEncountersQuery = useRecentEncounters(5);
	const recentEncounters = useMemo(
		() => unwrapList<Encounter>(recentEncountersQuery.data),
		[recentEncountersQuery.data]
	);
	const recentEncountersLoading = recentEncountersQuery.isLoading;

	// All Encounters - fetch when needed
	const [encounters, setEncounters] = useState<Encounter[]>([]);

	// Overdue Immunizations
	const overdueImmunizationsQuery = useAllOverdueImmunizations();
	const overdueImmunizations: Immunization[] = useMemo(
		() => unwrapList<Immunization>(overdueImmunizationsQuery.data),
		[overdueImmunizationsQuery.data]
	);
	const overdueCount = overdueImmunizations.length;

	// All Immunizations
	const [immunizations, setImmunizations] = useState<Immunization[]>([]);

	// Prescriptions
	const prescriptionsQuery = usePrescriptions({
		limit: 100,
	});
	const prescriptions = useMemo(
		() => unwrapList<Prescription>(prescriptionsQuery.data),
		[prescriptionsQuery.data]
	);
	const prescriptionsLoading = prescriptionsQuery.isLoading;

	// Growth measurements
	const [growth, setGrowth] = useState<GrowthMeasurement[]>([]);

	// Lab Orders - using a separate query or from context
	const [labOrders, setLabOrders] = useState<LabOrder[]>([]);

	// ============================================================
	// Load data on mount and when needed
	// ============================================================

	// Load encounters
	useEffect(() => {
		const loadEncounters = async () => {
			try {
				const response = await fetch("/api/encounters");
				if (response.ok) {
					const data = await response.json();
					setEncounters(data);
				}
			} catch (error) {
				console.error("Error loading encounters:", error);
			}
		};
		loadEncounters();
	}, []);

	// Load immunizations
	useEffect(() => {
		const loadImmunizations = async () => {
			try {
				const response = await fetch("/api/immunizations");
				if (response.ok) {
					const data = await response.json();
					setImmunizations(data);
				}
			} catch (error) {
				console.error("Error loading immunizations:", error);
			}
		};
		loadImmunizations();
	}, []);

	// Load growth measurements
	useEffect(() => {
		const loadGrowth = async () => {
			try {
				const response = await fetch("/api/growth");
				if (response.ok) {
					const data = await response.json();
					setGrowth(data);
				}
			} catch (error) {
				console.error("Error loading growth:", error);
			}
		};
		loadGrowth();
	}, []);

	// Load lab orders
	useEffect(() => {
		const loadLabOrders = async () => {
			try {
				const response = await fetch("/api/lab-orders");
				if (response.ok) {
					const data = await response.json();
					setLabOrders(data);
				}
			} catch (error) {
				console.error("Error loading lab orders:", error);
			}
		};
		loadLabOrders();
	}, []);

	// ============================================================
	// Navigation Actions
	// ============================================================

	const selectPatientAndNavigate = useCallback(
		(id: string, view: ClinicView = "patient-detail") => {
			setSelectedPatientId(id);
			setCurrentView(view);
			navigate({ to: "/app/patients/$id", params: { id } });
		},
		[navigate]
	);

	// ============================================================
	// Toast Management
	// ============================================================

	const dismissToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const showToast = useCallback(
		(type: ToastMessage["type"], title: string, message: string) => {
			const id = `toast-${Date.now()}-${Math.random().toString(36)}`;
			setToasts((prev) => [...prev, { id, type, title, message }]);

			// Also use the sonner toast system
			const toastMessage = `${title}: ${message}`;
			if (type === "success") {
				toast.success(toastMessage);
			} else if (type === "error") {
				toast.error(toastMessage);
			} else if (type === "warning") {
				toast.warning(toastMessage);
			} else {
				toast.info(toastMessage);
			}

			setTimeout(() => {
				dismissToast(id);
			}, 4500);
		},
		[dismissToast]
	);

	// ============================================================
	// Modal Management
	// ============================================================

	const openModal = useCallback(
		(type: ModalType, data?: Record<string, unknown>) => {
			setModalState({ type, data: data || null });
		},
		[]
	);

	const closeModal = useCallback(() => {
		setModalState({ type: null, data: null });
	}, []);

	// ============================================================
	// Data Refresh
	// ============================================================

	const refreshData = useCallback(() => {
		// Invalidate all queries
		queryClient.invalidateQueries({ queryKey: ["patients"] });
		queryClient.invalidateQueries({ queryKey: ["appointments"] });
		queryClient.invalidateQueries({ queryKey: ["encounters"] });
		queryClient.invalidateQueries({ queryKey: ["vitals"] });
		queryClient.invalidateQueries({ queryKey: ["growth"] });
		queryClient.invalidateQueries({ queryKey: ["immunizations"] });
		queryClient.invalidateQueries({ queryKey: ["staff"] });
		queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
		queryClient.invalidateQueries({ queryKey: ["labs"] });
	}, [queryClient]);

	// ============================================================
	// CRUD Operations
	// ============================================================

	const savePatient = useCallback(
		async (
			patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
		): Promise<Patient | null> => {
			try {
				const response = await fetch("/api/patients", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(patient),
				});

				if (!response.ok) {
					throw new Error("Failed to save patient");
				}

				const savedPatient: Patient = await response.json();
				queryClient.invalidateQueries({ queryKey: ["patients"] });
				showToast(
					"success",
					"Patient Saved",
					`${patient.firstName} ${patient.lastName} was saved.`
				);
				return savedPatient;
			} catch (error) {
				console.error("Error saving patient:", error);
				showToast("error", "Error", "Failed to save patient");
				return null;
			}
		},
		[queryClient, showToast]
	);

	const deletePatient = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				const response = await fetch(`/api/patients/${id}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error("Failed to delete patient");
				}

				queryClient.invalidateQueries({ queryKey: ["patients"] });
				showToast("info", "Patient Removed", "Patient was deleted.");
				return true;
			} catch (error) {
				console.error("Error deleting patient:", error);
				showToast("error", "Error", "Failed to delete patient");
				return false;
			}
		},
		[queryClient, showToast]
	);

	const saveEncounter = useCallback(
		async (
			encounter: Omit<Encounter, "id" | "createdAt" | "updatedAt">
		): Promise<Encounter | null> => {
			try {
				const response = await fetch("/api/encounters", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(encounter),
				});

				if (!response.ok) {
					throw new Error("Failed to save encounter");
				}

				const savedEncounter: Encounter = await response.json();
				setEncounters((prev) => [...prev, savedEncounter]);
				queryClient.invalidateQueries({ queryKey: ["encounters"] });
				showToast(
					"success",
					"Encounter Saved",
					`${encounter.visitType} encounter recorded.`
				);
				return savedEncounter;
			} catch (error) {
				console.error("Error saving encounter:", error);
				showToast("error", "Error", "Failed to save encounter");
				return null;
			}
		},
		[queryClient, showToast]
	);

	const saveVitals = useCallback(
		async (
			vitals: Omit<VitalSigns, "id" | "createdAt" | "updatedAt">
		): Promise<VitalSigns | null> => {
			try {
				const response = await fetch("/api/vitals", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(vitals),
				});

				if (!response.ok) {
					throw new Error("Failed to save vitals");
				}

				const savedVitals: VitalSigns = await response.json();
				queryClient.invalidateQueries({ queryKey: ["vitals"] });
				showToast(
					"success",
					"Vitals Recorded",
					`Temp ${vitals.temperatureC}°C, HR ${vitals.heartRateBpm} bpm.`
				);
				return savedVitals;
			} catch (error) {
				console.error("Error saving vitals:", error);
				showToast("error", "Error", "Failed to save vitals");
				return null;
			}
		},
		[queryClient, showToast]
	);

	const saveGrowthMeasurement = useCallback(
		async (
			growthMeasurement: Omit<
				GrowthMeasurement,
				"id" | "createdAt" | "updatedAt"
			>
		): Promise<GrowthMeasurement | null> => {
			try {
				const response = await fetch("/api/growth", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(growthMeasurement),
				});

				if (!response.ok) {
					throw new Error("Failed to save growth measurement");
				}

				const savedGrowth: GrowthMeasurement = await response.json();
				setGrowth((prev) => [...prev, savedGrowth]);
				queryClient.invalidateQueries({ queryKey: ["growth"] });
				showToast(
					"success",
					"Growth Saved",
					`${growthMeasurement.weightKg} kg, ${growthMeasurement.heightCm} cm.`
				);
				return savedGrowth;
			} catch (error) {
				console.error("Error saving growth:", error);
				showToast(
					"error",
					"Error",
					"Failed to save growth measurement"
				);
				return null;
			}
		},
		[queryClient, showToast]
	);

	const saveImmunization = useCallback(
		async (
			immunization: Omit<Immunization, "id" | "createdAt" | "updatedAt">
		): Promise<Immunization | null> => {
			try {
				const response = await fetch("/api/immunizations", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(immunization),
				});

				if (!response.ok) {
					throw new Error("Failed to save immunization");
				}

				const savedImmunization: Immunization = await response.json();
				setImmunizations((prev) => [...prev, savedImmunization]);
				queryClient.invalidateQueries({ queryKey: ["immunizations"] });
				showToast(
					"success",
					"Immunization Saved",
					`${immunization.vaccineName} recorded.`
				);
				return savedImmunization;
			} catch (error) {
				console.error("Error saving immunization:", error);
				showToast("error", "Error", "Failed to save immunization");
				return null;
			}
		},
		[queryClient, showToast]
	);

	const savePrescription = useCallback(
		async (
			prescription: Omit<Prescription, "id" | "createdAt" | "updatedAt">
		): Promise<Prescription | null> => {
			try {
				const response = await fetch("/api/prescriptions", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(prescription),
				});

				if (!response.ok) {
					throw new Error("Failed to save prescription");
				}

				const savedPrescription: Prescription = await response.json();
				queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
				showToast(
					"success",
					"Prescription Saved",
					"Prescription created."
				);
				return savedPrescription;
			} catch (error) {
				console.error("Error saving prescription:", error);
				showToast("error", "Error", "Failed to save prescription");
				return null;
			}
		},
		[queryClient, showToast]
	);

	const saveLabOrder = useCallback(
		async (
			labOrder: Omit<LabOrder, "id" | "createdAt" | "updatedAt">
		): Promise<LabOrder | null> => {
			try {
				const response = await fetch("/api/lab-orders", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(labOrder),
				});

				if (!response.ok) {
					throw new Error("Failed to save lab order");
				}

				const savedLabOrder: LabOrder = await response.json();
				setLabOrders((prev) => [...prev, savedLabOrder]);
				showToast(
					"success",
					"Lab Order Created",
					`${labOrder.orderNumber} created.`
				);
				return savedLabOrder;
			} catch (error) {
				console.error("Error saving lab order:", error);
				showToast("error", "Error", "Failed to save lab order");
				return null;
			}
		},
		[showToast]
	);

	const saveAppointment = useCallback(
		async (
			appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
		): Promise<Appointment | null> => {
			try {
				const response = await fetch("/api/appointments", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(appointment),
				});

				if (!response.ok) {
					throw new Error("Failed to save appointment");
				}

				const savedAppointment: Appointment = await response.json();
				queryClient.invalidateQueries({ queryKey: ["appointments"] });
				showToast(
					"success",
					"Appointment Scheduled",
					`Appointment for ${appointment.patientId} at ${new Date(appointment.startTime).toLocaleString()}`
				);
				return savedAppointment;
			} catch (error) {
				console.error("Error saving appointment:", error);
				showToast("error", "Error", "Failed to save appointment");
				return null;
			}
		},
		[queryClient, showToast]
	);

	const deleteAppointment = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				const response = await fetch(`/api/appointments/${id}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error("Failed to delete appointment");
				}

				queryClient.invalidateQueries({ queryKey: ["appointments"] });
				showToast(
					"info",
					"Appointment Removed",
					"Appointment was deleted."
				);
				return true;
			} catch (error) {
				console.error("Error deleting appointment:", error);
				showToast("error", "Error", "Failed to delete appointment");
				return false;
			}
		},
		[queryClient, showToast]
	);

	// ============================================================
	// Return Value
	// ============================================================

	return {
		// Navigation & View State
		currentView,
		setCurrentView,
		selectedPatientId,
		selectedPatient,
		setSelectedPatientId,
		selectPatientAndNavigate,

		patients,
		patientsLoading,
		patientsError,
		refetchPatients: () => {
			void patientsQuery.refetch();
		},

		// Appointments
		appointments,
		appointmentsLoading,
		appointmentsError,
		refetchAppointments: () => {
			void appointmentsQuery.refetch();
		},

		// Encounters
		encounters,
		recentEncounters,
		recentEncountersLoading,

		// Immunizations
		immunizations,
		overdueImmunizations,
		overdueCount,

		// Prescriptions
		prescriptions,
		prescriptionsLoading,

		// Lab Orders
		labOrders,

		// Growth
		growth,

		// Search & Filter
		globalSearch,
		setGlobalSearch,

		// Toasts
		toasts,
		showToast,
		dismissToast,

		// Modal Management
		openModal,
		closeModal,
		modalState,

		// Data Refresh
		refreshData,

		// CRUD Operations
		savePatient,
		deletePatient,
		saveEncounter,
		saveVitals,
		saveGrowthMeasurement,
		saveImmunization,
		savePrescription,
		saveLabOrder,
		saveAppointment,
		deleteAppointment,
	};
}
