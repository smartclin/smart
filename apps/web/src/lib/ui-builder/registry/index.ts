import type {
	ComponentRegistry,
	Variable,
	VariableValue,
	VariableValueType,
} from "@smart/ui/components/ui-builder/types";
import {
	FileText,
	Heart,
	Layout,
	type LucideIcon,
	Stethoscope,
} from "lucide-react";
import { blockDefinitions } from "./block-definitions";
import { clinicalBlockDefinitions } from "./clinical-block-definitions";
import { clinicalComponentDefinitions } from "./clinical-component-definitions";
import { complexComponentDefinitions } from "./complex-component-definitions";
import { customComponentDefinitions } from "./custom-component-definitions";
import { primitiveComponentDefinitions } from "./primitive-component-definitions";
import { shadcnComponentDefinitions } from "./shadcn-component-definitions";

export interface TemplateCategoryConfig {
	description: string;
	icon: LucideIcon;
	id: string;
	label: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategoryConfig[] = [
	{
		id: "clinical-notes",
		label: "Clinical Notes",
		icon: Stethoscope,
		description: "Templates for SOAP visits, consultations, and encounters",
	},
	{
		id: "patient-pages",
		label: "Patient Pages",
		icon: Heart,
		description:
			"Patient-facing discharge summaries, health plans, and portals",
	},
	{
		id: "forms",
		label: "Forms & Intake",
		icon: FileText,
		description: "Pediatric screening, consent, questionnaires, and intake",
	},
	{
		id: "marketing",
		label: "Clinic & Marketing",
		icon: Layout,
		description: "Service menus, clinic info, announcements, and banners",
	},
];

// Combined component registry with all primitives, complex, shadcn, custom, and clinical definitions
export const fullRegistry: ComponentRegistry = {
	...primitiveComponentDefinitions,
	...complexComponentDefinitions,
	...shadcnComponentDefinitions,
	...clinicalComponentDefinitions,
	...customComponentDefinitions,
};

// Combined block registry - standard + clinical blocks
export const allBlocks = {
	...blockDefinitions,
	...clinicalBlockDefinitions,
};

export interface ApiTemplateVariable {
	defaultValue?: string | number | boolean | null;
	label: string;
	name: string;
	options?: string[];
	required?: boolean;
	type: "string" | "number" | "boolean" | "date" | "enum";
}

/** Convert UIBuilder Variable[] to API / DB TemplateVariable[] */
export function toApiVariables(
	variables: Array<{
		defaultValue?: unknown;
		id?: string;
		label?: string;
		name: string;
		options?: string[];
		required?: boolean;
		type?: string;
	}>
): ApiTemplateVariable[] {
	return variables.map((v) => {
		const label = v.label || v.name;
		const validTypes = [
			"string",
			"number",
			"boolean",
			"date",
			"enum",
		] as const;
		const type = validTypes.includes(v.type as (typeof validTypes)[number])
			? (v.type as (typeof validTypes)[number])
			: "string";

		return {
			name: v.name,
			label,
			type,
			defaultValue:
				v.defaultValue === undefined || v.defaultValue === null
					? null
					: (v.defaultValue as string | number | boolean),
			options: Array.isArray(v.options) ? v.options : undefined,
			required: Boolean(v.required),
		};
	});
}

/** Convert API / DB TemplateVariable[] to UIBuilder Variable[] */
export function toUiVariables(
	variables: Array<{
		defaultValue?: unknown;
		id?: string;
		label?: string;
		name: string;
		options?: string[];
		required?: boolean;
		type?: string;
	}>
): Variable[] {
	const validTypes: VariableValueType[] = [
		"string",
		"number",
		"boolean",
		"array",
		"object",
		"function",
	];

	return variables.map((v) => {
		const varType: VariableValueType =
			v.type && validTypes.includes(v.type as VariableValueType)
				? (v.type as VariableValueType)
				: "string";

		return {
			id: v.id || v.name,
			name: v.name,
			type: varType,
			defaultValue: v.defaultValue as VariableValue<VariableValueType>,
		};
	});
}
