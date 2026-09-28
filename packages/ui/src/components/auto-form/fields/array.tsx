import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@smart/ui/components/accordion";
import { Button } from "@smart/ui/components/button";
import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@smart/ui/components/form";
import { Input } from "@smart/ui/components/input";
import { Separator } from "@smart/ui/components/separator";
import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { Plus, Trash } from "lucide-react";
import type * as React from "react";
import { useCallback } from "react";
import type * as z from "zod";
import { beautifyObjectName, getBaseSchema, getBaseType } from "../helpers";
import AutoFormObject from "./object";

function getDefType(schema: z.ZodType): string {
	return (
		(schema as { _zod?: { def?: { type?: string } } })._zod?.def?.type ?? ""
	);
}

function getArrayElementType(item: z.ZodType): z.ZodType | null {
	const def = (
		item as unknown as {
			_zod?: { def?: { element?: z.ZodType; innerType?: z.ZodType } };
		}
	)._zod?.def;
	const defType = getDefType(item);

	if (defType === "array") {
		return def?.element ?? null;
	}

	if (["default", "optional", "nullable"].includes(defType)) {
		const innerType = def?.innerType;
		if (innerType) {
			return getArrayElementType(innerType);
		}
	}

	return null;
}

function getPrimitiveDefault(itemSchema: z.ZodType): unknown {
	const base = getBaseSchema(itemSchema as z.ZodType);
	if (!base) return "";
	switch (getBaseType(base)) {
		case "ZodBoolean":
			return false;
		case "ZodNumber":
			return 0;
		default:
			return "";
	}
}

/**
 * Local type capture of the runtime `Field` component exposed on the form API.
 * `AnyFormApi` does not declare `Field` in its public type surface.
 */
type FormWithField = AnyFormApi & {
	Field: React.ComponentType<{
		name: string;
		mode?: "value" | "array";
		children: (field: AnyFieldApi) => React.ReactNode;
	}>;
};

interface AutoFormArrayProps {
	fieldConfig?: unknown;
	form: AnyFormApi;
	item: z.ZodArray<z.ZodType> | z.ZodDefault<z.ZodType>;
	name: string;
	path?: string[];
}

export default function AutoFormArray({
	name,
	item,
	form,
	path = [],
	fieldConfig,
}: AutoFormArrayProps) {
	const itemDefType = getArrayElementType(item);
	const elementBaseSchema = itemDefType
		? getBaseSchema(itemDefType as z.ZodType)
		: null;
	const elementPrimitiveType = elementBaseSchema
		? getBaseType(elementBaseSchema as z.ZodType)
		: "";
	const isObjectArray = !!itemDefType && elementPrimitiveType === "ZodObject";

	const fc = fieldConfig as { label?: string } | undefined;
	const title = fc?.label ?? beautifyObjectName(name);

	if (isObjectArray) {
		return (
			<ObjectAutoFormArray
				fieldConfig={fieldConfig}
				form={form}
				itemDefType={itemDefType as z.ZodObject<any, any>}
				name={name}
				path={path}
				title={title}
			/>
		);
	}

	return (
		<PrimitiveAutoFormArray
			fieldConfig={fieldConfig}
			form={form}
			itemDefType={itemDefType}
			name={name}
			path={path}
			title={title}
		/>
	);
}

/* ------------------------------------------------------------------ */
/* ObjectArray                                                         */
/* ------------------------------------------------------------------ */

interface ObjectAutoFormArrayProps {
	fieldConfig?: unknown;
	form: AnyFormApi;
	itemDefType: z.ZodObject<any, any>;
	name: string;
	path?: string[];
	title: string;
}

function ObjectAutoFormArray({
	name,
	form,
	path = [],
	fieldConfig,
	itemDefType,
	title,
}: ObjectAutoFormArrayProps) {
	const fieldPath = path.length > 0 ? `${path.join(".")}.${name}` : name;
	const FormField = (form as FormWithField).Field;

	const handleRemove = useCallback((field: AnyFieldApi, index: number) => {
		field.removeValue(index);
	}, []);

	const handleAdd = useCallback((field: AnyFieldApi) => {
		field.pushValue({});
	}, []);

	return (
		<AccordionItem
			className="border-none"
			value={name}
		>
			<AccordionTrigger>{title}</AccordionTrigger>
			<AccordionContent>
				<FormField
					mode="array"
					name={fieldPath}
				>
					{(field: AnyFieldApi) => {
						const items = field.state.value as unknown[];
						return (
							<>
								{items.map((_, index) => (
									<div
										className="mt-4 flex flex-col"
										key={`${fieldPath}-${index}`}
									>
										<AutoFormObject
											fieldConfig={fieldConfig as never}
											form={form}
											path={[
												...path,
												name,
												index.toString(),
											]}
											schema={
												itemDefType as unknown as z.ZodObject<never>
											}
										/>
										<div className="my-4 flex justify-end">
											<Button
												onClick={() =>
													handleRemove(field, index)
												}
												size="icon"
												type="button"
												variant="secondary"
											>
												<Trash className="size-4" />
											</Button>
										</div>
										<Separator />
									</div>
								))}
								<Button
									className="mt-4 flex items-center"
									onClick={() => handleAdd(field)}
									type="button"
									variant="secondary"
								>
									<Plus
										className="mr-2"
										size={16}
									/>
									Add
								</Button>
							</>
						);
					}}
				</FormField>
			</AccordionContent>
		</AccordionItem>
	);
}

/* ------------------------------------------------------------------ */
/* PrimitiveArray                                                      */
/* ------------------------------------------------------------------ */

interface PrimitiveAutoFormArrayProps {
	fieldConfig?: unknown;
	form: AnyFormApi;
	itemDefType: z.ZodType | null;
	name: string;
	path?: string[];
	title: string;
}

function PrimitiveAutoFormArray({
	name,
	form,
	path = [],
	itemDefType,
	title,
}: PrimitiveAutoFormArrayProps) {
	const fieldPath = path.length > 0 ? `${path.join(".")}.${name}` : name;
	const FormField = (form as FormWithField).Field;

	const handleRemove = useCallback((field: AnyFieldApi, index: number) => {
		field.removeValue(index);
	}, []);

	const handleAdd = useCallback(
		(field: AnyFieldApi) => {
			const def = itemDefType ? getPrimitiveDefault(itemDefType) : "";
			field.pushValue(def);
		},
		[itemDefType]
	);

	return (
		<AccordionItem
			className="border-none"
			value={name}
		>
			<AccordionTrigger>{title}</AccordionTrigger>
			<AccordionContent>
				<FormField
					mode="array"
					name={fieldPath}
				>
					{(field: AnyFieldApi) => {
						const values = field.state.value as unknown[];
						return (
							<>
								{values.map((_, index) => (
									<div
										className="mt-4 flex flex-col"
										key={`${fieldPath}-${index}`}
									>
										{itemDefType ? (
											<PrimitiveArrayRow
												cellPath={`${fieldPath}.${index}`}
												field={field}
												form={form}
												index={index}
												itemSchema={itemDefType}
											/>
										) : null}
										<div className="my-4 flex justify-end">
											<Button
												onClick={() =>
													handleRemove(field, index)
												}
												size="icon"
												type="button"
												variant="secondary"
											>
												<Trash className="size-4" />
											</Button>
										</div>
										<Separator />
									</div>
								))}
								<Button
									className="mt-4 flex items-center"
									onClick={() => handleAdd(field)}
									type="button"
									variant="secondary"
								>
									<Plus
										className="mr-2"
										size={16}
									/>
									Add
								</Button>
							</>
						);
					}}
				</FormField>
			</AccordionContent>
		</AccordionItem>
	);
}

/* ------------------------------------------------------------------ */
/* PrimitiveRow                                                        */
/* ------------------------------------------------------------------ */

interface PrimitiveArrayRowProps {
	cellPath: string;
	field: AnyFieldApi;
	form: AnyFormApi;
	index: number;
	itemSchema: z.ZodType;
}

function PrimitiveArrayRow({
	cellPath,
	field: arrayField,
	form,
	index,
	itemSchema,
}: PrimitiveArrayRowProps) {
	const setIndexValue = useCallback(
		(value: unknown) => {
			const current = arrayField.state.value as unknown[];
			const next = [...current];
			next[index] = value;
			arrayField.setValue(next);
		},
		[arrayField, index]
	);
	const baseSchema = getBaseSchema(itemSchema) as z.ZodType | null;
	const t = baseSchema ? getBaseType(baseSchema) : "";
	const FormField = (form as FormWithField).Field;

	const inputType =
		t === "ZodNumber" ? ("number" as const) : ("text" as const);

	const handleOnChange = useCallback(
		(ev: React.ChangeEvent<HTMLInputElement>) => {
			const v =
				inputType === "number"
					? Number.isNaN(ev.target.valueAsNumber)
						? undefined
						: ev.target.valueAsNumber
					: ev.target.value;
			setIndexValue(v);
		},
		[setIndexValue, inputType]
	);

	// Set the field value at the given index within the array

	if (t === "ZodBoolean") {
		return (
			<FormField name={cellPath}>
				{(field: AnyFieldApi) => (
					<FormItem className="flex flex-row items-center gap-2 space-y-0">
						<FormControl>
							<input
								aria-label="Toggle"
								checked={Boolean(field.state.value)}
								onChange={(e) =>
									setIndexValue(e.target.checked)
								}
								type="checkbox"
							/>
						</FormControl>
						<FormLabel className="cursor-pointer font-normal">
							{field.state.value ? "Selected" : "Not selected"}
						</FormLabel>
						<FormMessage field={field} />
					</FormItem>
				)}
			</FormField>
		);
	}

	return (
		<FormField name={cellPath}>
			{(field: AnyFieldApi) => (
				<FormItem className="space-y-2">
					<FormLabel className="sr-only">Row value</FormLabel>
					<FormControl>
						<Input
							name={field.name}
							onBlur={field.handleBlur}
							onChange={handleOnChange}
							type={inputType}
							value={
								field.state.value === undefined ||
								field.state.value === null
									? ""
									: String(field.state.value)
							}
						/>
					</FormControl>
					<FormMessage field={field} />
				</FormItem>
			)}
		</FormField>
	);
}
