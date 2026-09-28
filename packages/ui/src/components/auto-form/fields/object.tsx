import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@smart/ui/components/accordion";
import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-form";
import type * as React from "react";
import * as z from "zod";
import { DEFAULT_ZOD_HANDLERS, INPUT_COMPONENTS } from "../config";
import resolveDependencies from "../dependencies";
import {
	beautifyObjectName,
	getBaseSchema,
	getBaseType,
	sortFieldsByOrder,
	zodToHtmlInputProps,
} from "../helpers";
import type {
	AutoFormInputComponentProps,
	Dependency,
	FieldConfig,
	FieldConfigItem,
} from "../types";
import AutoFormArray from "./array";

function DefaultParent({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

/**
 * The `AnyFormApi` type from @tanstack/react-form does not declare `Field`
 * on its public surface, even though the runtime object has it. This local
 * type captures the shape we rely on so we can render `<form.Field>` without
 * resorting to `as any` at every call site.
 */
type FormWithField = AnyFormApi & {
	Field: React.ComponentType<{
		name: string;
		children: (field: AnyFieldApi) => React.ReactNode;
		[key: string]: unknown;
	}>;
};

/* ------------------------------------------------------------------ */
/* Extracted render-prop components                                    */
/* ------------------------------------------------------------------ */

type CustomComponentRenderProps = {
	field: AnyFieldApi;
	fieldConfigItem: FieldConfigItem;
	zodInputProps: React.InputHTMLAttributes<HTMLInputElement>;
	zodItem: z.ZodType;
	itemName: string;
	isRequired: boolean;
	isDisabled: boolean | undefined;
	CustomComponent: React.FC<AutoFormInputComponentProps>;
	ParentElement: React.ComponentType<{ children: React.ReactNode }>;
};

function CustomFieldRender({
	field,
	fieldConfigItem,
	zodInputProps,
	zodItem,
	itemName,
	isRequired,
	isDisabled,
	CustomComponent,
	ParentElement,
}: CustomComponentRenderProps) {
	const value = useSelector(field.store, (s) => s.value);

	const fieldProps = {
		...zodInputProps,
		...fieldConfigItem.inputProps,
		disabled: fieldConfigItem.inputProps?.disabled || isDisabled,
		ref: undefined,
		value,
		onChange: field.handleChange,
		onBlur: field.handleBlur,
		name: field.name,
	};

	return (
		<ParentElement>
			<CustomComponent
				field={field}
				fieldConfigItem={fieldConfigItem}
				fieldProps={fieldProps}
				isRequired={isRequired}
				label={fieldConfigItem.label || itemName}
				zodInputProps={zodInputProps}
				zodItem={zodItem}
			/>
		</ParentElement>
	);
}

type DefaultFieldRenderProps = {
	field: AnyFieldApi;
	fieldConfigItem: FieldConfigItem;
	zodInputProps: React.InputHTMLAttributes<HTMLInputElement>;
	zodItem: z.ZodType;
	itemName: string;
	isRequired: boolean;
	isDisabled: boolean | undefined;
};

function DefaultFieldRender({
	field,
	fieldConfigItem,
	zodInputProps,
	zodItem,
	itemName,
	isRequired,
	isDisabled,
}: DefaultFieldRenderProps) {
	const zodBaseType = getBaseType(zodItem);
	const inputType =
		fieldConfigItem.fieldType ??
		DEFAULT_ZOD_HANDLERS[zodBaseType] ??
		"fallback";

	const InputComponent =
		typeof inputType === "function"
			? inputType
			: INPUT_COMPONENTS[inputType];

	const ParentElement = fieldConfigItem.renderParent ?? DefaultParent;

	const defaultValue = fieldConfigItem.inputProps?.defaultValue;
	const storedValue = useSelector(field.store, (s) => s.value);
	const value = storedValue ?? defaultValue ?? "";

	const fieldProps = {
		...zodToHtmlInputProps(zodItem),
		...fieldConfigItem.inputProps,
		disabled: fieldConfigItem.inputProps?.disabled || isDisabled,
		ref: undefined,
		value,
		onChange: field.handleChange,
		onBlur: field.handleBlur,
		name: field.name,
	};

	if (InputComponent === undefined) {
		return null;
	}

	return (
		<ParentElement>
			<InputComponent
				className={fieldProps.className}
				field={field}
				fieldConfigItem={fieldConfigItem}
				fieldProps={fieldProps}
				isRequired={isRequired}
				label={itemName}
				zodInputProps={zodInputProps}
				zodItem={zodItem}
			/>
		</ParentElement>
	);
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function AutoFormObject<SchemaType extends z.ZodObject<never>>({
	schema,
	form,
	fieldConfig,
	path = [],
	dependencies = [],
}: {
	schema: SchemaType | z.ZodType<z.infer<SchemaType>>;
	form: AnyFormApi;
	fieldConfig?: FieldConfig<z.infer<SchemaType>>;
	path?: string[];
	dependencies?: Dependency<z.infer<SchemaType>>[];
}) {
	// Subscribe to form values for dependency resolution
	const values = useSelector(form.store, (s) => s.values);

	// Resolve the runtime Field component from the form API once per render.
	// `AnyFormApi` doesn't type `Field`, so we widen through our local helper.
	const FormField = (form as FormWithField).Field;

	if (!schema) {
		return null;
	}
	const { shape } = getBaseSchema<SchemaType>(schema as SchemaType) ?? {};

	if (!shape) {
		return null;
	}

	const handleIfZodNumber = (item: z.ZodType) => {
		const def = (
			item as never as { _zod?: { def?: Record<string, unknown> } }
		)._zod?.def;
		const defType = def?.type as string | undefined;
		const innerDef = (
			def?.innerType as
				| { _zod?: { def?: Record<string, unknown> } }
				| undefined
		)?._zod?.def;
		const innerDefType = innerDef?.type as string | undefined;

		const isZodNumber =
			defType === "number" || defType === "int" || defType === "float";
		const isInnerZodNumber =
			innerDefType === "number" ||
			innerDefType === "int" ||
			innerDefType === "float";

		if (isZodNumber && def) {
			def.coerce = true;
		} else if (isInnerZodNumber && innerDef) {
			innerDef.coerce = true;
		}

		return item;
	};

	const sortedFieldKeys = sortFieldsByOrder(fieldConfig, Object.keys(shape));

	// Create a watch function compatible with the dependency resolver
	const watch = (name?: string) =>
		name === undefined
			? values
			: (values as Record<string, unknown> | undefined)?.[name];

	return (
		<Accordion className="space-y-5 border-none">
			{sortedFieldKeys.map((name) => {
				let item = shape[name] as z.ZodType;
				item = handleIfZodNumber(item);
				const zodBaseType = getBaseType(item);
				const itemName = beautifyObjectName(name);
				const key = [...path, name].join(".");

				const {
					isHidden,
					isDisabled,
					isRequired: isRequiredByDependency,
					overrideOptions,
				} = resolveDependencies(dependencies, name, watch as never);

				if (isHidden) {
					return null;
				}

				if (zodBaseType === "ZodObject") {
					const objectFieldConfig: FieldConfigItem =
						fieldConfig?.[name] ?? {};
					if (typeof objectFieldConfig.fieldType === "function") {
						const zodInputProps = zodToHtmlInputProps(item);
						let isRequired =
							Boolean(isRequiredByDependency) ||
							Boolean(zodInputProps.required);
						if (
							objectFieldConfig.inputProps?.required !== undefined
						) {
							isRequired = objectFieldConfig.inputProps.required;
						}
						const CustomComponent = objectFieldConfig.fieldType;
						const ParentElement =
							objectFieldConfig.renderParent ?? DefaultParent;
						return (
							<FormField
								key={key}
								name={key}
							>
								{(field: AnyFieldApi) => (
									<CustomFieldRender
										CustomComponent={CustomComponent}
										field={field}
										fieldConfigItem={objectFieldConfig}
										isDisabled={isDisabled}
										isRequired={isRequired}
										itemName={itemName}
										ParentElement={ParentElement}
										zodInputProps={zodInputProps}
										zodItem={item}
									/>
								)}
							</FormField>
						);
					}

					return (
						<AccordionItem
							className="border-none"
							key={key}
							value={name}
						>
							<AccordionTrigger>{itemName}</AccordionTrigger>
							<AccordionContent className="p-2">
								<AutoFormObject
									fieldConfig={
										(fieldConfig?.[name] ?? {}) as never
									}
									form={form}
									path={[...path, name]}
									schema={
										item as unknown as z.ZodObject<never>
									}
								/>
							</AccordionContent>
						</AccordionItem>
					);
				}

				if (zodBaseType === "ZodArray") {
					const arrayFieldConfig: FieldConfigItem =
						fieldConfig?.[name] ?? {};
					if (typeof arrayFieldConfig.fieldType === "function") {
						const zodInputProps = zodToHtmlInputProps(item);
						let isRequired =
							Boolean(isRequiredByDependency) ||
							Boolean(zodInputProps.required);
						if (
							arrayFieldConfig.inputProps?.required !== undefined
						) {
							isRequired = arrayFieldConfig.inputProps.required;
						}
						const CustomComponent = arrayFieldConfig.fieldType;
						const ParentElement =
							arrayFieldConfig.renderParent ?? DefaultParent;
						return (
							<FormField
								key={key}
								name={key}
							>
								{(field: AnyFieldApi) => (
									<CustomFieldRender
										CustomComponent={CustomComponent}
										field={field}
										fieldConfigItem={arrayFieldConfig}
										isDisabled={isDisabled}
										isRequired={isRequired}
										itemName={itemName}
										ParentElement={ParentElement}
										zodInputProps={zodInputProps}
										zodItem={item}
									/>
								)}
							</FormField>
						);
					}

					return (
						<AutoFormArray
							fieldConfig={arrayFieldConfig}
							form={form}
							item={item as unknown as z.ZodArray<z.ZodType>}
							key={key}
							name={name}
							path={[...path, name]}
						/>
					);
				}

				const fieldConfigItem: FieldConfigItem =
					fieldConfig?.[name] ?? {};
				const zodInputProps = zodToHtmlInputProps(item);

				let isRequired =
					Boolean(isRequiredByDependency) ||
					Boolean(zodInputProps.required);
				if (fieldConfigItem.inputProps?.required !== undefined) {
					isRequired = fieldConfigItem.inputProps.required;
				}

				if (overrideOptions) {
					item = z.enum(overrideOptions) as unknown as z.ZodType;
				}

				return (
					<FormField
						key={key}
						name={key}
					>
						{(field: AnyFieldApi) => (
							<DefaultFieldRender
								field={field}
								fieldConfigItem={fieldConfigItem}
								isDisabled={isDisabled}
								isRequired={isRequired}
								itemName={itemName}
								zodInputProps={zodInputProps}
								zodItem={item}
							/>
						)}
					</FormField>
				);
			})}
		</Accordion>
	);
}
