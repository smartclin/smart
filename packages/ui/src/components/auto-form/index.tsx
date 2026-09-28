import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@smart/ui/components/button";
import { cn } from "@smart/ui/lib/utils";
import React, { useCallback, useState } from "react";
import type {
	DefaultValues,
	FieldValues,
	FormState,
	UseFormReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import AutoFormObject from "./fields/object";
import type { ZodObjectOrWrapped } from "./helpers";
import { getDefaultValues, getObjectFormSchema } from "./helpers";
import type { Dependency, FieldConfig } from "./types";

export function AutoFormSubmit({
	children,
	className,
	disabled,
}: {
	children?: React.ReactNode;
	className?: string;
	disabled?: boolean;
}) {
	return (
		<Button
			className={className}
			disabled={disabled}
			type="submit"
		>
			{children ?? "Submit"}
		</Button>
	);
}

/**
 * The form-values type used internally by `useForm` and exposed through the
 * callback props.
 *
 * We deliberately use the concrete `FieldValues` (i.e. `Record<string, any>`)
 * rather than deriving from `z.infer<SchemaType>`. The reason is that
 * `SchemaType` is a union (`ZodObject<never> | ZodType<unknown>`), and any
 * conditional type that resolves `z.infer<SchemaType>` in either branch
 * distributes over that union, producing `FieldValues | unknown`. TypeScript
 * then refuses to satisfy `UseFormReturn<T>`'s `T extends FieldValues`
 * constraint, because `unknown` is not assignable to `FieldValues`.
 *
 * Using `FieldValues` directly:
 *   - keeps the public API identical (callers still receive `values` typed
 *     as `Partial<z.infer<SchemaType>>`, which is where the specific shape
 *     matters);
 *   - lets `form` be used as a black-box handle with `setValue` / `reset` /
 *     `getValues`, all of which are already generic over field names;
 *   - is a no-op for runtime behavior.
 *
 * Callers that need the specific schema shape on `form` can cast:
 *   `form as UseFormReturn<z.infer<typeof mySchema>>`
 */
type AutoFormFieldValues = FieldValues;

function AutoForm<SchemaType extends ZodObjectOrWrapped>({
	formSchema,
	values: valuesProp,
	onValuesChange: onValuesChangeProp,
	onParsedValuesChange,
	onSubmit: onSubmitProp,
	fieldConfig,
	children,
	className,
	dependencies,
}: {
	formSchema: SchemaType;
	values?: Partial<z.infer<SchemaType>>;
	onValuesChange?: (
		values: Partial<z.infer<SchemaType>>,
		form: UseFormReturn<AutoFormFieldValues>
	) => void;
	onParsedValuesChange?: (
		values: Partial<z.infer<SchemaType>>,
		form: UseFormReturn<AutoFormFieldValues>
	) => void;
	onSubmit?: (
		values: z.infer<SchemaType>,
		form: UseFormReturn<AutoFormFieldValues>
	) => void;
	fieldConfig?: FieldConfig<z.infer<any>>;
	children?:
		| React.ReactNode
		| ((formState: FormState<AutoFormFieldValues>) => React.ReactNode);
	className?: string;
	dependencies?: Dependency<z.infer<any>>[];
}) {
	type FormValues = AutoFormFieldValues;

	const objectFormSchema = getObjectFormSchema(formSchema);
	const defaultValues: DefaultValues<
		z.infer<typeof objectFormSchema>
	> | null = getDefaultValues(objectFormSchema, fieldConfig);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema as never) as never,
		defaultValues: (defaultValues ?? undefined) as never,
		values: valuesProp as never,
	});

	const [schemaSubmitError, setSchemaSubmitError] = useState<string | null>(
		null
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setSchemaSubmitError(null);

			form.handleSubmit(
				(values) => {
					const parsedValues = formSchema.safeParse(values);
					if (parsedValues.success) {
						onSubmitProp?.(
							parsedValues.data as z.infer<SchemaType>,
							form
						);
					} else {
						const message = parsedValues.error.issues
							.map(
								(issue) =>
									`${issue.path.length ? `${issue.path.join(".")}: ` : ""}${issue.message}`
							)
							.join(" · ");
						setSchemaSubmitError(message);
					}
				},
				() => setSchemaSubmitError(null)
			)(e);
		},
		[form, formSchema, onSubmitProp]
	);

	React.useEffect(() => {
		const subscription = form.watch((values) => {
			onValuesChangeProp?.(values as Partial<z.infer<SchemaType>>, form);
			const parsedValues = formSchema.safeParse(values);
			if (parsedValues.success) {
				onParsedValuesChange?.(
					parsedValues.data as Partial<z.infer<SchemaType>>,
					form
				);
			}
		});

		return () => subscription.unsubscribe();
	}, [form, formSchema, onValuesChangeProp, onParsedValuesChange]);

	const renderChildren =
		typeof children === "function" ? children(form.formState) : children;

	return (
		<div className="w-full">
			<form
				className={cn("space-y-5", className)}
				onSubmit={handleSubmit}
			>
				<AutoFormObject
					dependencies={dependencies as never}
					fieldConfig={fieldConfig as never}
					form={form as never}
					schema={objectFormSchema}
				/>

				{schemaSubmitError ? (
					<div
						className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm"
						role="alert"
					>
						{schemaSubmitError}
					</div>
				) : null}

				{renderChildren}
			</form>
		</div>
	);
}

export default AutoForm;
