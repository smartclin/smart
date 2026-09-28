// packages/db/src/repositories/index.ts

// Re-export zod schemas for templates
export {
	createTemplateSchema,
	templateSchema,
	updateTemplateSchema,
} from "../zod/template";
export { ActivityRepository } from "./activity-repository";
export { appointmentRepository } from "./appointment.repository";
export { authRepository } from "./auth.repository";
export { dashboardRepository } from "./dashboard.repo";
export { encounterRepository } from "./encounter.repository";
export { growthRepository } from "./growth.repository";
export { immunizationRepository } from "./immunization.repository";
export { labRepository } from "./lab.repository";
export { patientRepository } from "./patient.repository";
export { prescriptionRepository } from "./prescription.repository";
export { staffRepository } from "./staff.repository";
export { templateRepository } from "./template.repository";
export { vitalRepository } from "./vital.repository";
export { whoGrowthRepository } from "./who.repository";

import { ActivityRepository } from "./activity-repository";
// Convenience object for all repositories
import { appointmentRepository } from "./appointment.repository";
import { encounterRepository } from "./encounter.repository";
import { growthRepository } from "./growth.repository";
import { immunizationRepository } from "./immunization.repository";
import { labRepository } from "./lab.repository";
import { patientRepository } from "./patient.repository";
import { prescriptionRepository } from "./prescription.repository";
import { staffRepository } from "./staff.repository";
import { templateRepository } from "./template.repository";
import { vitalRepository } from "./vital.repository";
import { whoGrowthRepository } from "./who.repository";

export const repositories = {
	appointment: appointmentRepository,
	encounter: encounterRepository,
	growth: growthRepository,
	immunization: immunizationRepository,
	lab: labRepository,
	activity: ActivityRepository,
	patient: patientRepository,
	prescription: prescriptionRepository,
	staff: staffRepository,
	template: templateRepository,
	vital: vitalRepository,
	whoGrowth: whoGrowthRepository,
};

export type Repositories = typeof repositories;
