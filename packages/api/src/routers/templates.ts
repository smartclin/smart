import { ORPCError } from "@orpc/server";
import {
	createTemplateSchema,
	templateRepository,
} from "@smart/db/repositories";
import { z } from "zod/v4";
import { protectedProcedure } from "../index";

export const templatesRouter = {
	list: protectedProcedure
		.input(z.object({ category: z.string().optional() }))
		.handler(async ({ input }) => {
			const { data } = await templateRepository.findAll(input);
			return data;
		}),

	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const template = await templateRepository.findById(input.id);
			if (!template) {
				throw new ORPCError("NOT_FOUND", {
					message: "Template not found",
				});
			}
			return template;
		}),

	create: protectedProcedure
		.input(createTemplateSchema)
		.handler(async ({ input }) => templateRepository.create(input)),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: createTemplateSchema.partial(),
			})
		)
		.handler(async ({ input }) => {
			const template = await templateRepository.update(
				input.id,
				input.data
			);
			if (!template) {
				throw new ORPCError("NOT_FOUND", {
					message: "Template not found",
				});
			}
			return template;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const success = await templateRepository.delete(input.id);
			if (!success) {
				throw new ORPCError("NOT_FOUND", {
					message: "Template not found",
				});
			}
			return { success: true };
		}),
};
