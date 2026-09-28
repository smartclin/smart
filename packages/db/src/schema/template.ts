// ============================================================
// UI BUILDER TEMPLATES
// Stores reusable UI component templates from the shadcn UI builder

import { createId } from "@smart/utils";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ============================================================
// Layer tree
// ============================================================

/** A single node in the component tree produced by the UI builder. */
export interface TemplateLayer {
	/** Nested children. Empty array for leaf nodes. */
	children: TemplateLayer[];
	/** Unique id within the template (builder-generated). */
	id: string;
	/** Arbitrary props for the component (opaque to the DB layer). */
	props: Record<string, unknown>;
	/** Component kind, e.g. "text", "image", "container", "row". */
	type: string;
}

// ============================================================
// Variables
// ============================================================

/**
 * Value types a template variable can hold.
 *
 * NOTE: adjust this union to match what your UI builder actually emits.
 * Common additions: "color", "image", "object", "array".
 */
export type TemplateVariableType =
	| "string"
	| "number"
	| "boolean"
	| "date"
	| "enum";

/** A variable declared by the builder and substituted at render time. */
export interface TemplateVariable {
	/** Default value when the variable is not supplied. */
	defaultValue?: string | number | boolean | null;
	/** Human label shown in the builder UI. */
	label: string;
	/** Template expression name, e.g. "patientName". */
	name: string;
	/** For `type: "enum"`, the permitted values. */
	options?: string[];
	/** Whether the variable must be supplied when rendering. */
	required?: boolean;
	/** Value type. */
	type: TemplateVariableType;
}

// ============================================================
// Table
// ============================================================

export const templates = pgTable(
	"templates",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId("template")),
		name: text("name").notNull(),
		category: text("category").notNull(),
		description: text("description").notNull(),
		/** ComponentLayer tree from the UI builder. */
		layers: jsonb("layers").$type<TemplateLayer[]>().notNull(),
		/** Variable definitions from the UI builder. */
		variables: jsonb("variables").$type<TemplateVariable[]>().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("idx_templates_category").on(table.category),
		index("idx_templates_updated_at").on(table.updatedAt),
	]
);

// ============================================================
// Inferred types
// ============================================================

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
