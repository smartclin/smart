// db/validation/template.ts

import { z } from "zod/v4";
import type { TemplateLayer } from "../schema/template";
import { idSchema, nonEmptyString } from "./common";

// Zod schema for ComponentLayer (simplified for validation)
const componentLayerSchema: z.ZodType<TemplateLayer> = z.lazy(() =>
	z.object({
		id: z.string(),
		type: z.string(),
		props: z.record(z.string(), z.any()),
		children: z.array(componentLayerSchema),
	})
);

const variableSchema = z.object({
	name: z.string(),
	label: z.string(),
	type: z.enum(["string", "number", "boolean", "date", "enum"]),
	defaultValue: z
		.union([z.string(), z.number(), z.boolean(), z.null()])
		.optional(),
	options: z.array(z.string()).optional(),
	required: z.boolean().optional(),
});

export const templateSchema = z.object({
	id: idSchema,
	name: nonEmptyString(200),
	category: nonEmptyString(100),
	description: nonEmptyString(500),
	layers: z.array(componentLayerSchema),
	variables: z.array(variableSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const createTemplateSchema = templateSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const updateTemplateSchema = templateSchema.partial().extend({
	id: idSchema,
});

export const templateFormSchema = templateSchema;

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
