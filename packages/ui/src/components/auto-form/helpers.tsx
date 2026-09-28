import type React from "react";
import type { DefaultValues } from "react-hook-form";
import { z } from "zod";
import type { JSONSchemaPropertyBase } from "./shared-form-types";
import type { AutoFormInputComponentProps, FieldConfig } from "./types";

export const BUILTIN_FIELD_TYPES = [
	"checkbox",
	"date",
	"select",
	"radio",
	"switch",
	"textarea",
	"number",
	"fallback",
] as const;

type ZodDef = {
	type?: string;
	defaultValue?: unknown;
	innerType?: z.ZodType;
	schema?: z.ZodType;
	out?: z.ZodType;
	in?: z.ZodType;
	checks?: Array<{
		kind?: string;
		type?: string;
		value?: number;
		minimum?: number;
		maximum?: number;
	}>;
	description?: string;
};

type ZodWithInternals = z.ZodType & { _zod?: { def?: ZodDef } };

function getDef(schema: z.ZodType): ZodDef | undefined {
	return (schema as ZodWithInternals)._zod?.def;
}

export type ZodObjectOrWrapped = z.ZodObject<never> | z.ZodType<unknown>;

export function beautifyObjectName(string: string): string {
	let output = string.replace(/([A-Z])/g, " $1");
	output = output.charAt(0).toUpperCase() + output.slice(1);
	return output;
}

export function getBaseSchema<ChildType extends z.ZodType = z.ZodType>(
	schema: ChildType
): ChildType | null {
	if (!schema) return null;

	const def = getDef(schema);
	if (!def) return schema;

	const { innerType, out, schema: innerSchema } = def;
	if (innerType) return getBaseSchema(innerType as ChildType);
	if (out) return getBaseSchema(out as ChildType);
	if (innerSchema) return getBaseSchema(innerSchema as ChildType);

	return schema;
}

export function getBaseType(schema: z.ZodType): string {
	const baseSchema = getBaseSchema(schema);
	if (!baseSchema) return "";

	const typeName = getDef(baseSchema)?.type ?? "";

	const typeMap: Record<string, string> = {
		object: "ZodObject",
		array: "ZodArray",
		string: "ZodString",
		number: "ZodNumber",
		int: "ZodNumber",
		float: "ZodNumber",
		boolean: "ZodBoolean",
		date: "ZodDate",
		enum: "ZodEnum",
		nativeEnum: "ZodNativeEnum",
		literal: "ZodLiteral",
		union: "ZodUnion",
	};

	return typeMap[typeName] ?? typeName;
}

export function getDefaultValueInZodStack(schema: z.ZodType): unknown {
	const def = getDef(schema);
	if (!def) return undefined;

	if (def.type === "default") {
		const { defaultValue } = def;
		return typeof defaultValue === "function"
			? (defaultValue as () => unknown)()
			: defaultValue;
	}

	const { innerType, schema: innerSchema } = def;
	if (innerType) return getDefaultValueInZodStack(innerType);
	if (innerSchema) return getDefaultValueInZodStack(innerSchema);

	return undefined;
}

export function getDefaultValues<Schema extends z.ZodObject<never>>(
	schema: Schema,
	fieldConfig?: FieldConfig<z.infer<Schema>>
) {
	if (!schema) return null;
	const { shape } = schema;
	type DefaultValuesType = DefaultValues<Partial<z.infer<Schema>>>;
	const defaultValues = {} as DefaultValuesType;
	if (!shape) return defaultValues;

	for (const key of Object.keys(shape)) {
		const item = shape[key] as z.ZodType;

		if (getBaseType(item) === "ZodObject") {
			const defaultItems = getDefaultValues(
				getBaseSchema(item) as unknown as z.ZodObject<never>,
				fieldConfig?.[key] as FieldConfig<z.infer<Schema>>
			);

			if (defaultItems !== null) {
				for (const [defaultItemKey, defaultItemValue] of Object.entries(
					defaultItems as Record<string, unknown>
				)) {
					const pathKey = `${key}.${defaultItemKey}`;
					(defaultValues as Record<string, unknown>)[pathKey] =
						defaultItemValue;
				}
			}
		} else {
			let defaultValue = getDefaultValueInZodStack(item);
			const inputProps = fieldConfig?.[key]?.inputProps;
			if (
				(defaultValue === undefined ||
					defaultValue === null ||
					defaultValue === "") &&
				inputProps
			) {
				defaultValue = inputProps as { defaultValue?: unknown };
			}
			if (defaultValue !== undefined) {
				(defaultValues as Record<string, unknown>)[key] = defaultValue;
			}
		}
	}

	return defaultValues;
}

export function getObjectFormSchema(
	schema: ZodObjectOrWrapped
): z.ZodObject<never> {
	if (!schema) return schema as z.ZodObject<never>;

	const def = getDef(schema);
	if (!def) return schema as z.ZodObject<never>;

	const { type, in: inputSchema, innerType, schema: innerSchema } = def;

	if (type === "pipe" && inputSchema) {
		return getObjectFormSchema(inputSchema);
	}
	if (innerType) return getObjectFormSchema(innerType);
	if (innerSchema) return getObjectFormSchema(innerSchema);

	return schema as z.ZodObject<never>;
}

export function getSchemaDescription(schema: z.ZodType): string | undefined {
	const registered = z.globalRegistry.get(schema);
	if (registered?.description) {
		return registered.description;
	}

	return getDef(schema)?.description;
}

export function zodToHtmlInputProps(
	schema: z.ZodType
): React.InputHTMLAttributes<HTMLInputElement> {
	const def = getDef(schema);
	const defType = def?.type ?? "";

	if (defType === "optional" || defType === "nullable") {
		const { innerType } = def ?? {};
		if (!innerType) return { required: false };
		return { ...zodToHtmlInputProps(innerType), required: false };
	}

	if (defType === "default") {
		const { innerType } = def ?? {};
		if (!innerType) return { required: false };
		return { ...zodToHtmlInputProps(innerType), required: false };
	}

	const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
		required: true,
	};

	const checks = def?.checks;
	if (!Array.isArray(checks)) return inputProps;

	const type = getBaseType(schema);

	for (const check of checks) {
		const checkKind = check.kind ?? check.type;
		const { value, minimum, maximum } = check;

		if (checkKind === "min" || checkKind === "min_length") {
			if (type === "ZodString") {
				inputProps.minLength = (value ?? minimum) as number;
			} else {
				inputProps.min = String(value ?? minimum);
			}
		}
		if (checkKind === "max" || checkKind === "max_length") {
			if (type === "ZodString") {
				inputProps.maxLength = (value ?? maximum) as number;
			} else {
				inputProps.max = String(value ?? maximum);
			}
		}
	}

	return inputProps;
}

export function sortFieldsByOrder<SchemaType extends z.ZodObject<any>>(
	fieldConfig: FieldConfig<z.infer<SchemaType>> | undefined,
	keys: string[]
): string[] {
	return keys.sort((a, b) => {
		const configRecord = fieldConfig as
			| Record<string, { order?: number } | undefined>
			| undefined;
		const fieldA = configRecord?.[a]?.order ?? 0;
		const fieldB = configRecord?.[b]?.order ?? 0;
		return fieldA - fieldB;
	});
}

type JsonSchemaProperty = JSONSchemaPropertyBase;

export function buildFieldConfigFromJsonSchema(
	jsonSchema: Record<string, unknown>,
	fieldComponents?: Record<
		string,
		React.ComponentType<AutoFormInputComponentProps>
	>
): FieldConfig<Record<string, unknown>> {
	const fieldConfig: FieldConfig<Record<string, unknown>> = {};
	const properties = jsonSchema.properties as Record<
		string,
		JsonSchemaProperty
	>;

	if (!properties) return fieldConfig;

	for (const [key, value] of Object.entries(properties)) {
		const config: Record<string, unknown> = {};

		const {
			label,
			title,
			description,
			inputProps,
			placeholder,
			default: defaultValue,
			order,
			fieldType,
			format,
			type,
			properties: nestedProperties,
		} = value;

		if (label) {
			config.label = label;
		} else if (title) {
			config.label = title;
		}

		if (description) {
			config.description = description;
		}

		const mergedInputProps: Record<string, unknown> = inputProps
			? { ...inputProps }
			: {};

		if (placeholder) {
			mergedInputProps.placeholder = placeholder;
		}

		if (defaultValue !== undefined) {
			mergedInputProps.defaultValue = defaultValue;
			mergedInputProps.required = false;
		}

		if (Object.keys(mergedInputProps).length > 0) {
			config.inputProps = mergedInputProps;
		}

		if (order !== undefined) {
			config.order = order;
		}

		let resolvedFieldType = fieldType;

		if (!resolvedFieldType && type === "string" && format === "date-time") {
			resolvedFieldType = "date";
		}

		if (resolvedFieldType) {
			const CustomComponent = fieldComponents?.[resolvedFieldType];
			if (CustomComponent) {
				config.fieldType = (props: AutoFormInputComponentProps) => (
					<CustomComponent {...props} />
				);
			} else if (
				BUILTIN_FIELD_TYPES.includes(
					resolvedFieldType as (typeof BUILTIN_FIELD_TYPES)[number]
				)
			) {
				config.fieldType = resolvedFieldType;
			} else {
				console.warn(
					`CMS: Unknown fieldType "${resolvedFieldType}" for field "${key}". ` +
						"Provide a component via fieldComponents override or use a built-in type."
				);
			}
		}

		if (nestedProperties) {
			const nestedConfig = buildFieldConfigFromJsonSchema(
				{ properties: nestedProperties } as Record<string, unknown>,
				fieldComponents
			);

			const reservedProps = new Set([
				"description",
				"label",
				"inputProps",
				"fieldType",
				"renderParent",
				"order",
			]);

			for (const [nestedKey, nestedValue] of Object.entries(
				nestedConfig
			)) {
				if (reservedProps.has(nestedKey)) {
					console.warn(
						`Field "${key}" has a nested field named "${nestedKey}" which conflicts with a reserved FieldConfigItem property. ` +
							`The nested field's config will not be accessible at the parent level.`
					);
				} else {
					config[nestedKey] = nestedValue;
				}
			}
		}

		if (Object.keys(config).length > 0) {
			fieldConfig[key] = config;
		}
	}

	return fieldConfig;
}
