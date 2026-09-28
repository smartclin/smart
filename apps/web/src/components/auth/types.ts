// apps/web/src/components/auth/additional-field.types.ts
export type AdditionalFieldValue = string | number | boolean | Date | null;

export type AdditionalFieldConfig = {
	label: React.ReactNode;
	placeholder?: string;
	required?: boolean;
	readOnly?: boolean;
	defaultValue?: AdditionalFieldValue;
	type?: "text" | "number" | "email" | "tel" | "url";
	inputType?:
		| "input"
		| "textarea"
		| "number"
		| "slider"
		| "switch"
		| "checkbox"
		| "select"
		| "combobox"
		| "date"
		| "datetime"
		| "hidden";
	options?: { label: string; value: string }[];
	min?: number;
	max?: number;
	step?: number;
	prefix?: React.ReactNode | null;
	suffix?: React.ReactNode | null;
	copyable?: boolean;
	formatOptions?: Intl.NumberFormatOptions;
	render?: (args: {
		name: string;
		field: AdditionalFieldConfig;
		isPending?: boolean;
		value: AdditionalFieldValue;
		onBlur: () => void;
		onChange: () => void;
	}) => React.ReactNode;
};

export function resolveInputType(
	field: AdditionalFieldConfig
):
	| "input"
	| "textarea"
	| "number"
	| "slider"
	| "switch"
	| "checkbox"
	| "select"
	| "combobox"
	| "date"
	| "datetime"
	| "hidden" {
	if (field.inputType) return field.inputType;
	if (field.type === "number") return "number";
	if (field.options?.length) return "select";
	return "input";
}
