import type { INPUT_COMPONENTS } from "./config";

// ============================================================================
// INPUT PROPS BY BACKING TYPE
// ============================================================================

/**
 * Common input props shared by all field types.
 */
export interface BaseInputProps {
	/** Whether the field is disabled */
	disabled?: boolean;
	/** Whether the field is read-only */
	readOnly?: boolean;
	/** Whether the field is required */
	required?: boolean;
	/** Whether to show the label (auto-form specific) */
	showLabel?: boolean;
}

/**
 * Input props for string-backed fields (text, email, password, url, phone, textarea).
 */
export interface StringInputProps extends BaseInputProps {
	/** Autocomplete hint */
	autoComplete?: string;
	/** Default value */
	defaultValue?: string;
	/** Maximum length */
	maxLength?: number;
	/** Minimum length */
	minLength?: number;
	/** Regex pattern for validation */
	pattern?: string;
	/** Placeholder text */
	placeholder?: string;
	/** HTML input type (text, email, password, tel, url) */
	type?: "text" | "email" | "password" | "tel" | "url" | string;
}

/**
 * Input props for number-backed fields.
 */
export interface NumberInputProps extends BaseInputProps {
	/** Default value */
	defaultValue?: number;
	/** Maximum value */
	max?: number;
	/** Minimum value */
	min?: number;
	/** Placeholder text */
	placeholder?: string;
	/** Step value for increment/decrement */
	step?: number;
}

/**
 * Input props for boolean-backed fields (checkbox, switch).
 */
export interface BooleanInputProps extends BaseInputProps {
	/** Default value */
	defaultValue?: boolean;
}

/**
 * Input props for date-backed fields.
 */
export interface DateInputProps extends BaseInputProps {
	/** Default value as ISO string or Date */
	defaultValue?: string | Date;
	/** Maximum date as ISO string */
	max?: string;
	/** Minimum date as ISO string */
	min?: string;
}

/**
 * Input props for enum-backed fields (select, radio).
 */
export interface EnumInputProps extends BaseInputProps {
	/** Default value (must match one of the enum options) */
	defaultValue?: string;
	/** Placeholder text (for select) */
	placeholder?: string;
}

/**
 * Union type of all input props by backing type.
 */
export type TypedInputProps =
	| StringInputProps
	| NumberInputProps
	| BooleanInputProps
	| DateInputProps
	| EnumInputProps;

/**
 * Generic input props that accept any field type.
 * Use this when the backing type is not known at compile time.
 *
 * This is the catch-all type used for runtime flexibility.
 */
export interface SerializableInputProps extends BaseInputProps {
	autoComplete?: string;
	defaultValue?: unknown;
	max?: number | string;
	maxLength?: number;
	min?: number | string;
	minLength?: number;
	pattern?: string;
	placeholder?: string;
	step?: number | string;
	type?: string;
	/** Allow additional props for extensibility */
	[key: string]: unknown;
}

// ============================================================================
// INPUT PROPS TYPE MAPPING
// ============================================================================

/**
 * Maps backing Zod types to their corresponding input props type.
 */
export interface InputPropsByBackingType {
	boolean: BooleanInputProps;
	date: DateInputProps;
	enum: EnumInputProps;
	number: NumberInputProps;
	string: StringInputProps;
}

/**
 * Get the correct input props type for a backing type.
 */
export type InputPropsFor<T extends keyof InputPropsByBackingType> =
	InputPropsByBackingType[T];

/**
 * Built-in field types supported by auto-form.
 */
export type AutoFormBuiltinFieldType = keyof typeof INPUT_COMPONENTS;

/**
 * Field types that can be specified in JSON Schema.
 * Either a built-in type name or a custom component.
 */
export type FieldType = AutoFormBuiltinFieldType | (string & {}); // allow any string for extensibility

/**
 * JSON Schema property with form-builder and auto-form metadata.
 *
 * This is the intermediate format used when:
 * - form-builder serializes field configurations
 * - auto-form parses JSON Schema to build field configs
 */
export interface JSONSchemaPropertyBase {
	/** Additional properties allowed for objects */
	additionalProperties?: boolean;
	/** Default value */
	default?: unknown;
	/** Description text */
	description?: string;
	/** Enum values for select/radio fields */
	enum?: (string | number | boolean | null)[];
	/** Exclusive maximum for numbers */
	exclusiveMaximum?: number;
	/** Exclusive minimum for numbers */
	exclusiveMinimum?: number;
	/** Field type override (checkbox, date, select, radio, switch, textarea, etc.) */
	fieldType?: FieldType;
	/** Format hint (email, uri, date-time, etc.) */
	format?: string;
	/** Maximum date as ISO string */
	formatMaximum?: string;

	// ========================
	// Date constraints (from zodToFormSchema)
	// ========================
	/** Minimum date as ISO string */
	formatMinimum?: string;
	/** Additional input props */
	inputProps?: SerializableInputProps;
	/** HTML input type (text, email, password, tel, etc.) */
	inputType?: string;
	/** Item schema for array types */
	items?: JSONSchemaPropertyBase;

	// ========================
	// Form metadata (via Zod .meta())
	// ========================
	/** Display label (form-builder/auto-form) */
	label?: string;
	/** Maximum value for numbers */
	maximum?: number;
	/** Maximum length for strings */
	maxLength?: number;
	/** Minimum value for numbers */
	minimum?: number;
	/** Minimum length for strings */
	minLength?: number;
	/** Multiple of constraint for numbers */
	multipleOf?: number;
	/** Display order */
	order?: number;
	/** Regex pattern for strings */
	pattern?: string;
	/** Placeholder text */
	placeholder?: string;

	// ========================
	// Nested structures
	// ========================
	/** Properties for object types */
	properties?: Record<string, JSONSchemaPropertyBase>;
	/** Required fields for object types */
	required?: string[];
	/** Human-readable title (JSON Schema standard) */
	title?: string;
	// ========================
	// Standard JSON Schema
	// ========================
	/** JSON Schema type */
	type?:
		| "string"
		| "number"
		| "integer"
		| "boolean"
		| "object"
		| "array"
		| "null";
}

/**
 * Field configuration item that auto-form uses to customize field rendering.
 * This is the target type when converting from JSON Schema.
 *
 * Note: This is kept in sync with auto-form/types.ts FieldConfigItem
 */
export interface FieldConfigItemBase {
	/** Description text or React node */
	description?: React.ReactNode;
	/** Field type override */
	fieldType?: FieldType | React.ComponentType<unknown>;
	/** Input props passed to the field component */
	inputProps?: SerializableInputProps;
	/** Display label */
	label?: string;
	/** Display order */
	order?: number;
	/** Wrapper component */
	renderParent?: (props: {
		children: React.ReactNode;
	}) => React.ReactElement | null;
}

/**
 * Mapping of JSON Schema property keys to FieldConfigItem keys.
 * Used when converting between formats.
 */
export const JSON_SCHEMA_TO_FIELD_CONFIG_MAP = {
	// Direct mappings
	label: "label",
	description: "description",
	fieldType: "fieldType",
	inputProps: "inputProps",
	order: "order",
	// Properties that go into inputProps
	placeholder: "inputProps.placeholder",
	inputType: "inputProps.type",
	default: "inputProps.defaultValue",
} as const;
