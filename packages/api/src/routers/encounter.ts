// src/routers/encounter.ts

import { ORPCError } from "@orpc/server";
import { encounterRepository } from "@smart/db/repositories";
import {
	createEncounterSchema,
	updateEncounterSchema,
	visitTypeSchema,
} from "@smart/db/zod";
import { z } from "zod/v4";

import { adminProcedure, doctorProcedure } from "../index";

export const encounterRouter = {
	// ─── Queries ───

	getById: doctorProcedure.input(z.string()).handler(async ({ input }) => {
		const encounter = await encounterRepository.findById(input);
		if (!encounter) {
			throw new ORPCError("NOT_FOUND", {
				message: "Encounter not found",
			});
		}
		return encounter;
	}),

	findByPatientId: doctorProcedure
		.input(
			z.object({
				patientId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				visitType: visitTypeSchema.optional(),
				status: z
					.enum(["Draft", "Completed", "Signed", "Amended"])
					.optional(),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			})
		)
		.handler(async ({ input }) => {
			const { patientId, ...options } = input;
			return encounterRepository.findByPatientId(patientId, options);
		}),

	search: doctorProcedure
		.input(
			z.object({
				query: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
				patientId: z.string().optional(),
				providerId: z.string().optional(),
				visitType: visitTypeSchema,
				status: z.enum(["Draft", "Completed", "Signed", "Amended"]),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			})
		)
		.handler(async ({ input }) => encounterRepository.search(input)),

	getRecent: doctorProcedure
		.input(z.number().min(1).max(50).default(10))
		.handler(async ({ input }) =>
			encounterRepository.getRecentEncounters(input)
		),

	getStats: adminProcedure.handler(async () =>
		encounterRepository.getStats()
	),

	// ─── Mutations ───

	create: doctorProcedure
		.input(createEncounterSchema)
		.handler(async ({ input }) => encounterRepository.create(input)),

	createBatch: doctorProcedure
		.input(z.array(createEncounterSchema))
		.handler(async ({ input }) => encounterRepository.createBatch(input)),

	update: doctorProcedure
		.input(updateEncounterSchema)
		.handler(async ({ input }) => {
			const { id, ...data } = input;
			const updated = await encounterRepository.update(id, data);
			if (!updated) {
				throw new ORPCError("NOT_FOUND", {
					message: "Encounter not found",
				});
			}
			return updated;
		}),
	addVitals: doctorProcedure
		.input(
			z.object({
				encounterId: z.string(),
				temperatureC: z.number().min(25).max(45),
				heartRateBpm: z.number().int().min(20).max(300),
				respiratoryRateBpm: z.number().int().min(5).max(150),
				systolicBp: z.number().int().min(30).max(250).optional(),
				diastolicBp: z.number().int().min(20).max(200).optional(),
				oxygenSaturationPercent: z.number().int().min(50).max(100),
				painScore: z.number().int().min(0).max(10).default(0),
				weightKg: z.number().positive().max(300).optional(),
				heightCm: z.number().positive().max(250).optional(),
				notes: z.string().optional(),
			})
		)
		.handler(async ({ input }) => {
			const updated = await encounterRepository.addVitals(
				input.encounterId,
				{
					temperatureC: input.temperatureC,
					heartRateBpm: input.heartRateBpm,
					respiratoryRateBpm: input.respiratoryRateBpm,
					systolicBp: input.systolicBp,
					diastolicBp: input.diastolicBp,
					oxygenSaturationPercent: input.oxygenSaturationPercent,
					painScore: input.painScore,
					weightKg: input.weightKg,
					heightCm: input.heightCm,
					notes: input.notes,
					recordedAt: new Date(),
				}
			);
			if (!updated) {
				throw new ORPCError("NOT_FOUND", {
					message: "Encounter not found",
				});
			}
			return updated;
		}),
	addDiagnosis: doctorProcedure
		.input(
			z.object({
				encounterId: z.string(),
				name: z.string().min(1).max(300),
				icdCode: z.string().optional(),
				primary: z.boolean().default(false),
			})
		)
		.handler(async ({ input }) => {
			const updated = await encounterRepository.addDiagnosis(
				input.encounterId,
				{
					name: input.name,
					icdCode: input.icdCode,
					primary: input.primary,
				}
			);
			if (!updated) {
				throw new ORPCError("NOT_FOUND", {
					message: "Encounter not found",
				});
			}
			return updated;
		}),

	// ✅ ADD: Add treatment plan
	addTreatmentPlan: doctorProcedure
		.input(
			z.object({
				encounterId: z.string(),
				treatments: z.array(z.string()).default([]),
				medications: z.array(z.string()).default([]),
				investigations: z.array(z.string()).default([]),
				patientEducation: z.array(z.string()).default([]),
				followUpDate: z.string().optional(),
				notes: z.string().optional(),
			})
		)
		.handler(async ({ input }) => {
			const updated = await encounterRepository.addTreatmentPlan(
				input.encounterId,
				{
					treatments: input.treatments,
					medications: input.medications,
					investigations: input.investigations,
					patientEducation: input.patientEducation,
					followUpDate: input.followUpDate,
					notes: input.notes,
				}
			);
			if (!updated) {
				throw new ORPCError("NOT_FOUND", {
					message: "Encounter not found",
				});
			}
			return updated;
		}),

	// ✅ ADD: Sign encounter
	sign: doctorProcedure
		.input(z.object({ id: z.string(), signedBy: z.string() }))
		.handler(async ({ input }) => {
			const updated = await encounterRepository.sign(
				input.id,
				input.signedBy
			);
			if (!updated) {
				throw new ORPCError("NOT_FOUND", {
					message: "Encounter not found",
				});
			}
			return updated;
		}),

	delete: adminProcedure
		.input(z.string())
		.handler(async ({ input }) => encounterRepository.delete(input)),
};
