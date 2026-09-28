// src/routers/vital.ts

import { ORPCError } from "@orpc/server";
import { vitalRepository } from "@smart/db/repositories";
import { createVitalsSchema, updateVitalsSchema } from "@smart/db/zod";
import { z } from "zod/v4";

import { adminProcedure, doctorProcedure } from "../index";

export const vitalRouter = {
	// ─── Queries ───
	getByDateRange: doctorProcedure
		.input(
			z.object({
				startDate: z.date(),
				endDate: z.date(),
				patientId: z.string().optional(),
			})
		)
		.handler(async ({ input }) => {
			const { startDate, endDate, patientId } = input;
			return vitalRepository.findByDateRange(
				startDate,
				endDate,
				patientId
			);
		}),

	getCount: doctorProcedure
		.input(
			z.object({
				patientId: z.string().optional(),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			})
		)
		.handler(async ({ input }) => {
			const { patientId, startDate, endDate } = input;
			return vitalRepository.countBy({
				patientId,
				startDate,
				endDate,
			});
		}),

	findAll: doctorProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
				patientId: z.string().optional(),
				encounterId: z.string().optional(),
			})
		)
		.handler(async ({ input }) =>
			vitalRepository.findAll(input.patientId ?? "", input)
		),

	getById: doctorProcedure.input(z.string()).handler(async ({ input }) => {
		const vital = await vitalRepository.findById(input);
		if (!vital) {
			throw new ORPCError("NOT_FOUND", {
				message: "Vital signs not found",
			});
		}
		return vital;
	}),

	getByPatientId: doctorProcedure
		.input(
			z.object({
				patientId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			})
		)
		.handler(async ({ input }) => {
			const { patientId, ...options } = input;
			return vitalRepository.findByPatientId(patientId, options);
		}),

	getByEncounterId: doctorProcedure
		.input(z.string())
		.handler(async ({ input }) => vitalRepository.findByEncounterId(input)),

	getLatest: doctorProcedure
		.input(z.string())
		.handler(async ({ input }) => vitalRepository.getLatestVital(input)),

	getAbnormal: doctorProcedure
		.input(
			z.object({
				patientId: z.string(),
				limit: z.number().min(1).max(100).default(20),
			})
		)
		.handler(async ({ input }) =>
			vitalRepository.getAbnormalVitals(input.patientId, {
				limit: input.limit,
			})
		),

	// ─── Mutations ───

	create: doctorProcedure
		.input(createVitalsSchema)
		.handler(async ({ input }) => vitalRepository.create(input)),

	update: doctorProcedure
		.input(updateVitalsSchema)
		.handler(async ({ input }) => {
			const { id, ...data } = input;
			const updated = await vitalRepository.update(id ?? "", data);
			if (!updated) {
				throw new ORPCError("NOT_FOUND", {
					message: "Vital signs not found",
				});
			}
			return updated;
		}),

	delete: adminProcedure
		.input(z.string())
		.handler(async ({ input }) => vitalRepository.delete(input)),
};
