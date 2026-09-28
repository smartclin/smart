import { Field } from "@base-ui/react/field";
import { cn } from "@smart/ui/lib/utils";
import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-form";
import * as React from "react";
import { useCallback } from "react";

// Re-export the existing context utilities so this file is self-contained
export {
	createFormField,
	FormErrors,
	FormField,
	FormFieldError,
	FormFieldSet,
	scrollToFirstError,
	typedField,
	useFieldContext,
	useFormContext,
} from "./tanform/core/context";

// ---------------------------------------------------------------------------
// Form shell — accepts a TanStack Form instance directly.
// ---------------------------------------------------------------------------

type FormProps = {
	form: AnyFormApi;
	children: React.ReactNode;
	className?: string;
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
};

function Form({ form, children, className, onSubmit }: FormProps) {
	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (onSubmit) {
				onSubmit(e);
			} else {
				void form.handleSubmit();
			}
		},
		[form, onSubmit]
	);

	return (
		<form
			className={cn(
				"mx-auto flex w-full flex-col gap-2 p-2 md:p-5",
				className
			)}
			noValidate
			onSubmit={handleSubmit}
		>
			{children}
		</form>
	);
}

// ---------------------------------------------------------------------------
// FormField — wraps Base UI's Field.Root with TanStack Form state.
// ---------------------------------------------------------------------------

type BaseFormFieldProps = {
	field: AnyFieldApi;
	children: React.ReactNode;
	className?: string;
};

function BaseFormField({ field, children, className }: BaseFormFieldProps) {
	const isTouched = useSelector(field.store, (s) => s.meta.isTouched);
	const hasSubmitted = useSelector(
		field.form.store,
		(s) => s.submissionAttempts > 0
	);
	const errors = useSelector(field.store, (s) => s.meta.errors);
	const hasVisibleErrors = errors.length > 0 && (isTouched || hasSubmitted);

	return (
		<Field.Root
			className={cn("grid gap-1", className)}
			dirty={field.state.meta.isDirty}
			invalid={hasVisibleErrors}
			name={field.name}
			touched={isTouched}
		>
			{children}
		</Field.Root>
	);
}

// ---------------------------------------------------------------------------
// FormItem — kept for API compatibility with the original shadcn surface.
// ---------------------------------------------------------------------------

function FormItem({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("space-y-2", className)}
			{...props}
		/>
	);
}

// ---------------------------------------------------------------------------
// FormLabel — Base UI's Field.Label connects to the control via context.
// ---------------------------------------------------------------------------

function FormLabel({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof Field.Label>) {
	return (
		<Field.Label
			className={cn(className)}
			{...props}
		/>
	);
}

// ---------------------------------------------------------------------------
// FormControl — Base UI's Field.Control wraps the actual input.
// ---------------------------------------------------------------------------

type FormControlProps = {
	children: React.ReactNode;
};

function FormControl({ children }: FormControlProps) {
	if (!React.isValidElement(children)) {
		return <>{children}</>;
	}
	return <Field.Control render={children} />;
}
// ---------------------------------------------------------------------------
// FormDescription
// ---------------------------------------------------------------------------

function FormDescription({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<Field.Description
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

// ---------------------------------------------------------------------------
// FormMessage — reads errors from the field API directly.
// ---------------------------------------------------------------------------

type FormMessageProps = {
	field: AnyFieldApi;
	className?: string;
	children?: React.ReactNode;
};

function FormMessage({ field, className, children }: FormMessageProps) {
	const isTouched = useSelector(field.store, (s) => s.meta.isTouched);
	const hasSubmitted = useSelector(
		field.form.store,
		(s) => s.submissionAttempts > 0
	);
	const errors = useSelector(field.store, (s) => s.meta.errors);

	const visible = isTouched || hasSubmitted;
	const [error] = errors;
	const body = error ? String(error) : children;

	if (!(visible && body)) {
		return null;
	}

	return (
		<Field.Error
			className={cn("font-medium text-destructive text-sm", className)}
		>
			{body}
		</Field.Error>
	);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
	BaseFormField as FormFieldBase,
	Form,
	FormControl,
	FormDescription,
	FormItem,
	FormLabel,
	FormMessage,
};
