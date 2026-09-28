import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { analyticsRouter } from "./analytics";
import { appointmentRouter } from "./appointment";
import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { databaseRouter } from "./database";
import { encounterRouter } from "./encounter";
import { growthRouter } from "./growth";
import { immunizationRouter } from "./immunization";
import { labRouter } from "./lab";
import { patientRouter } from "./patient";
import { prescriptionRouter } from "./prescription";
import { staffRouter } from "./staff";
import { templatesRouter } from "./templates";
import { vitalRouter } from "./vitals";

export const appRouter = {
	analytics: analyticsRouter,
	auth: authRouter,
	patient: patientRouter,
	staff: staffRouter,
	database: databaseRouter,

	appointment: appointmentRouter,
	encounter: encounterRouter,
	vitals: vitalRouter,
	privateData: protectedProcedure.handler(({ context }) => ({
		message: "This is private",
		user: context.user,
	})),
	growth: growthRouter,
	immunization: immunizationRouter,
	lab: labRouter,
	prescription: prescriptionRouter,
	dashboard: dashboardRouter,
	templates: templatesRouter,
	healthCheck: publicProcedure.handler(() => "OK"),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
