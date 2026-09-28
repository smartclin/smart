// src/routers/growth.ts

import { ORPCError } from "@orpc/server";
import { growthRepository, whoGrowthRepository } from "@smart/db/repositories";
import {
	createGrowthMeasurementSchema,
	genderSchema,
	metricTypeSchema,
	updateGrowthMeasurementSchema,
} from "@smart/db/zod";
import { z } from "zod/v4";

import { adminProcedure, doctorProcedure } from "../index";

export const growthRouter = {
	// ─── Patient Growth Queries ───

	getById: doctorProcedure.input(z.string()).handler(async ({ input }) => {
		const measurement = await growthRepository.findById(input);
		if (!measurement) {
			throw new ORPCError("NOT_FOUND", {
				message: "Growth measurement not found",
			});
		}
		return measurement;
	}),

	getByPatientId: doctorProcedure
		.input(
			z.object({
				patientId: z.string(),
				limit: z.number().int().positive().optional(),
				offset: z.number().int().nonnegative().optional(),
				orderBy: z.enum(["ageMonths", "recordedAt"]).optional(),
				orderDirection: z.enum(["asc", "desc"]).optional(),
				query: z.string().optional(),
				ageGroup: z
					.enum([
						"Newborn",
						"Infant",
						"Toddler",
						"Preschool",
						"School-Age",
						"Adolescent",
					])
					.optional(),
				percentileBand: z
					.enum(["severeLow", "low", "normal", "high", "severeHigh"])
					.optional(),
			})
		)
		.handler(async ({ input }) => {
			const { patientId, ...options } = input;
			return growthRepository.findByPatientId(patientId, options);
		}),

	getLatest: doctorProcedure
		.input(z.string())
		.handler(async ({ input }) =>
			growthRepository.findLatestByPatientId(input)
		),
	findWhoReference: doctorProcedure
		.input(
			z.object({
				gender: genderSchema,
				metricType: metricTypeSchema,
				maxAgeMonths: z.number().int().min(0).max(240).default(60),
			})
		)
		.handler(async ({ input }) =>
			growthRepository.findWhoReference({
				gender: input.gender,
				metricType: input.metricType,
				maxAgeMonths: input.maxAgeMonths,
			})
		),
	getChartData: doctorProcedure
		.input(
			z.object({
				patientId: z.string(),
				metric: z
					.enum(["weight", "height", "head_circumference", "bmi"])
					.default("weight"),
			})
		)
		.handler(async ({ input }) =>
			growthRepository.getGrowthChartData(input.patientId, input.metric)
		),

	getStats: doctorProcedure
		.input(z.string())
		.handler(async ({ input }) => growthRepository.getGrowthStats(input)),

	getPercentiles: doctorProcedure
		.input(z.string())
		.handler(async ({ input }) => growthRepository.getPercentiles(input)),

	// ─── WHO Growth Reference Queries ───

	getWHOData: doctorProcedure
		.input(
			z.object({
				gender: z.enum(["male", "female"]),
				metricType: z.enum([
					"weight",
					"height",
					"head_circumference",
					"bmi",
				]),
			})
		)
		.handler(async ({ input }) =>
			whoGrowthRepository.getByGenderAndMetric(
				input.gender,
				input.metricType
			)
		),

	getWHOPercentileCurve: doctorProcedure
		.input(
			z.object({
				gender: z.enum(["male", "female"]),
				metricType: z.enum([
					"weight",
					"height",
					"head_circumference",
					"bmi",
				]),
				ageMonths: z.array(z.number().min(0).max(240)),
			})
		)
		.handler(async ({ input }) =>
			whoGrowthRepository.getPercentileCurve(
				input.gender,
				input.metricType,
				input.ageMonths
			)
		),

	getWHOLMSParameters: doctorProcedure
		.input(
			z.object({
				gender: z.enum(["male", "female"]),
				metricType: z.enum([
					"weight",
					"height",
					"head_circumference",
					"bmi",
				]),
				ageMonths: z.number().min(0).max(240),
			})
		)
		.handler(async ({ input }) =>
			whoGrowthRepository.getLMSParameters(
				input.gender,
				input.metricType,
				input.ageMonths
			)
		),

	getWHOAgeRange: doctorProcedure
		.input(
			z.object({
				gender: z.enum(["male", "female"]),
				metricType: z.enum([
					"weight",
					"height",
					"head_circumference",
					"bmi",
				]),
			})
		)
		.handler(async ({ input }) =>
			whoGrowthRepository.getAgeRange(input.gender, input.metricType)
		),

	// ─── Mutations ───

	create: doctorProcedure
		.input(createGrowthMeasurementSchema)
		.handler(async ({ input }) => growthRepository.create(input)),

	createBatch: doctorProcedure
		.input(z.array(createGrowthMeasurementSchema))
		.handler(async ({ input }) => growthRepository.createBatch(input)),

	update: doctorProcedure
		.input(updateGrowthMeasurementSchema)
		.handler(async ({ input }) => {
			const { id, ...data } = input;
			const updated = await growthRepository.update(id, data);
			if (!updated) {
				throw new ORPCError("NOT_FOUND", {
					message: "Growth measurement not found",
				});
			}
			return updated;
		}),

	delete: adminProcedure
		.input(z.string())
		.handler(async ({ input }) => growthRepository.delete(input)),
};
