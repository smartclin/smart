import { DatePicker } from "@smart/ui/components/date-picker";
import { FormControl, FormItem, FormMessage } from "@smart/ui/components/form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-form";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import { getBaseType } from "../helpers";
import type { AutoFormInputComponentProps } from "../types";

/**
 * Convert a value to a Date object if needed.
 * Handles both Date objects (from z.date()) and ISO strings (from z.fromJSONSchema with format: date-time)
 */
function toDate(value: unknown): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === "string") {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? undefined : date;
	}
	return undefined;
}

export default function AutoFormDate({
	label,
	isRequired,
	field,
	fieldConfigItem,
	fieldProps,
	zodItem,
}: AutoFormInputComponentProps) {
	// Determine if the underlying schema expects a Date object or string
	// z.date() has base type "ZodDate", while z.fromJSONSchema with format: date-time creates a ZodString
	const baseType = getBaseType(zodItem);
	const expectsDateObject = baseType === "ZodDate";

	const fieldValue = useSelector(
		(field as AnyFieldApi).store,
		(s: { value: unknown }) => s.value
	);

	const handleChange = (date: Date | undefined) => {
		if (!date) {
			(field as AnyFieldApi).handleChange(undefined);
			return;
		}
		// If the schema is z.date(), pass Date object
		// If the schema is string (from JSON Schema), pass ISO string
		if (expectsDateObject) {
			(field as AnyFieldApi).handleChange(date);
		} else {
			(field as AnyFieldApi).handleChange(date.toISOString());
		}
	};

	return (
		<FormItem>
			<AutoFormLabel
				isRequired={isRequired}
				label={fieldConfigItem?.label || label}
			/>
			<FormControl>
				<DatePicker
					date={toDate(fieldValue)}
					setDate={handleChange}
					{...fieldProps}
				/>
			</FormControl>
			<AutoFormTooltip fieldConfigItem={fieldConfigItem} />

			<FormMessage field={fieldProps.field} />
		</FormItem>
	);
}
