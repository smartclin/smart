import { z } from "zod";

/**
 * Minimal structural type for the Zod v4 internal def object.
 *
 * Nested schema fields are typed as `unknown` because Zod v4's runtime `_zod.def`
 * exposes `$ZodType` instances, which are structurally incompatible with the
 * public `ZodType` generic at the type level (even though they behave
 * identically at runtime). We re-narrow them at each read site.
 */
interface ZodDef {
	defaultValue?: unknown;
	element?: unknown;
	innerType?: unknown;
	items?: unknown;
	options?: unknown;
	shape?: unknown;
	type?: string;
	value?: unknown;
	[key: string]: unknown;
}

interface ZodWithDef {
	_zod?: { def?: ZodDef };
}

/**
 * Helper to get the Zod v4 def type from a schema.
 */
function getDefType(schema: z.ZodType): string {
	return (schema as unknown as ZodWithDef)._zod?.def?.type ?? "";
}

/**
 * Helper to get the def object from a Zod v4 schema.
 */
function getDef(schema: z.ZodType): ZodDef | undefined {
	return (schema as unknown as ZodWithDef)._zod?.def;
}

/**
 * Narrow an `unknown` from a ZodDef field to a `z.ZodType`.
 * Returns `undefined` if the value isn't a valid Zod schema.
 */
function asZodType(value: unknown): z.ZodType | undefined {
	if (value && typeof value === "object" && "_zod" in value) {
		return value as z.ZodType;
	}
	return undefined;
}

/**
 * Narrow an `unknown` from a ZodDef field to a `z.ZodType[]`.
 */
function asZodTypeArray(value: unknown): z.ZodType[] | undefined {
	if (!Array.isArray(value)) return undefined;
	return value.filter(
		(item): item is z.ZodType =>
			item !== null && typeof item === "object" && "_zod" in item
	);
}

/**
 * Generates default props based on the provided Zod schema.
 * Supports boolean, date, number, string, enum, objects composed of these primitives, and arrays of these primitives.
 * Logs a warning for unsupported types.
 */
export function getDefaultProps(
	schema: z.ZodObject<z.ZodRawShape>
): Record<string, unknown> {
	const { shape } = schema;
	const defaultProps: Record<string, unknown> = {};

	for (const key in shape) {
		if (Object.hasOwn(shape, key)) {
			const fieldSchema = asZodType(shape[key]);
			if (fieldSchema) {
				const value = getDefaultValue(fieldSchema, key);
				if (value !== undefined) {
					defaultProps[key] = value;
				}
			}
		}
	}

	return defaultProps;
}

/**
 * Determines the default value for a given Zod schema.
 */
function getDefaultValue(schema: z.ZodType, fieldName: string): unknown {
	const defType = getDefType(schema);
	const def = getDef(schema);

	if (defType === "default" && def) {
		const { defaultValue } = def;
		if (typeof defaultValue === "function") {
			return (defaultValue as () => unknown)();
		}
		return defaultValue;
	}
	const isOptional = schema.safeParse(undefined).success;
	if (!isOptional) {
		console.warn(`No default value set for required field "${fieldName}".`);
	}
	return undefined;
}

/**
 * Patches the given Zod object schema by transforming unions of literals to enums,
 * coercing number and date types, and adding an optional `className` property.
 */
export function patchSchema(
	schema: z.ZodObject<z.ZodRawShape>
): z.ZodObject<z.ZodRawShape> {
	const schemaWithFixedEnums = transformUnionToEnum(schema);
	const schemaWithCoercedTypes =
		addCoerceToNumberAndDate(schemaWithFixedEnums);
	const schemaWithCommon = addCommon(schemaWithCoercedTypes);

	return schemaWithCommon;
}

/**
 * Extends the given Zod object schema by adding an optional `className` property.
 */
function addCommon<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
	return schema.extend({
		className: z.string().optional(),
	});
}

/**
 * Transforms a ZodUnion of ZodLiterals into a ZodEnum with a default value.
 */
function transformUnionToEnum<T extends z.ZodType>(schema: T): T {
	const defType = getDefType(schema);
	const def = getDef(schema);

	if (defType === "union" && def?.options) {
		const options = asZodTypeArray(def.options);
		if (!options || options.length === 0) return schema;

		const allStringLiterals = options.every((option) => {
			const optDef = getDef(option);
			return (
				optDef?.type === "literal" && typeof optDef?.value === "string"
			);
		});

		if (allStringLiterals) {
			const enumValues = options
				.map((option) => {
					const optDef = getDef(option);
					return optDef?.value as string;
				})
				.reverse();

			if (enumValues.length === 0) {
				throw new Error("Cannot create enum with no values.");
			}

			const enumSchema = z.enum(enumValues as [string, ...string[]]);

			let transformedSchema: z.ZodType = enumSchema;
			const [firstValue] = enumValues;
			if (firstValue !== undefined) {
				transformedSchema = enumSchema.default(firstValue);
			}

			const isNullable = schema.safeParse(null).success;
			if (isNullable) {
				transformedSchema = transformedSchema.nullable();
			}
			const isOptional = schema.safeParse(undefined).success;
			if (isOptional) {
				transformedSchema = transformedSchema.optional();
			}

			return transformedSchema as unknown as T;
		}
	}

	if (defType === "nullable") {
		const inner = asZodType(def?.innerType);
		if (!inner) return schema;
		const transformedInner = transformUnionToEnum(inner);
		return transformedInner.nullable() as unknown as T;
	}

	if (defType === "optional") {
		const inner = asZodType(def?.innerType);
		if (!inner) return schema;
		const transformedInner = transformUnionToEnum(inner);
		return transformedInner.optional() as unknown as T;
	}

	if (defType === "object") {
		const { shape } = schema as unknown as z.ZodObject<z.ZodRawShape>;
		const transformedShape: Record<string, z.ZodType> = {};

		for (const [key, value] of Object.entries(shape)) {
			const zodValue = asZodType(value);
			if (zodValue) {
				transformedShape[key] = transformUnionToEnum(zodValue);
			}
		}

		return z.object(transformedShape) as unknown as T;
	}

	if (defType === "array") {
		const element = asZodType(def?.element);
		if (!element) return schema;
		const transformedElement = transformUnionToEnum(element);
		return z.array(transformedElement) as unknown as T;
	}

	if (defType === "tuple") {
		const items = asZodTypeArray(def?.items);
		if (!items || items.length === 0) return schema;
		const transformedItems = items.map((item) =>
			transformUnionToEnum(item)
		);
		return z.tuple(
			transformedItems as [z.ZodType, ...z.ZodType[]]
		) as unknown as T;
	}

	return schema;
}

/**
 * Recursively applies coercion to number and date fields within the given Zod schema.
 */
function addCoerceToNumberAndDate<T extends z.ZodType>(schema: T): T {
	const defType = getDefType(schema);
	const def = getDef(schema);

	if (defType === "nullable") {
		const inner = asZodType(def?.innerType);
		if (!inner) return schema;
		return addCoerceToNumberAndDate(inner).nullable() as unknown as T;
	}

	if (defType === "optional") {
		const inner = asZodType(def?.innerType);
		if (!inner) return schema;
		return addCoerceToNumberAndDate(inner).optional() as unknown as T;
	}

	if (defType === "object") {
		const { shape } = schema as unknown as z.ZodObject<z.ZodRawShape>;
		const transformedShape: Record<string, z.ZodType> = {};

		for (const [key, value] of Object.entries(shape)) {
			const zodValue = asZodType(value);
			if (zodValue) {
				transformedShape[key] = addCoerceToNumberAndDate(zodValue);
			}
		}

		return z.object(transformedShape) as unknown as T;
	}

	if (defType === "array") {
		const element = asZodType(def?.element);
		if (!element) return schema;
		return z.array(addCoerceToNumberAndDate(element)) as unknown as T;
	}

	if (["number", "int", "float"].includes(defType)) {
		return z.coerce.number().optional() as unknown as T;
	}

	if (defType === "date") {
		return z.coerce.date().optional() as unknown as T;
	}

	if (defType === "union" && def?.options) {
		const options = asZodTypeArray(def.options);
		if (!options || options.length < 2) return schema;
		const transformedOptions = options.map((option) =>
			addCoerceToNumberAndDate(option)
		);
		return z.union(
			transformedOptions as [z.ZodType, z.ZodType, ...z.ZodType[]]
		) as unknown as T;
	}

	if (defType === "enum") {
		return schema;
	}

	return schema;
}

/**
 * Patch for autoform to respect existing values, specifically for enums.
 */
export function addDefaultValues<T extends z.ZodObject<z.ZodRawShape>>(
	schema: T,
	defaultValues: Partial<z.infer<T>>
): T {
	const { shape } = schema;
	const updatedShape = { ...shape };

	for (const key in defaultValues) {
		if (Object.hasOwn(defaultValues, key)) {
			const field = updatedShape[key];
			if (!field) {
				if (shouldWarnInDev()) {
					console.warn(
						`Key "${key}" does not exist in the schema and will be ignored.`
					);
				}
				continue;
			}

			// Zod v4's ZodType exposes `.default()` at runtime, but the base
			// `z.ZodType` type doesn't declare it (it lives on subtypes like
			// ZodString, ZodObject, etc.). Cast through a narrow structural shape.
			const defaultable = field as unknown as {
				default: (value: unknown) => z.ZodType;
			};
			updatedShape[key] = defaultable.default(
				defaultValues[key]
			) as unknown as (typeof updatedShape)[string];
		}
	}

	return z.object(updatedShape) as T;
}

/**
 * Dev-mode warning gate that works in any bundler/runtime.
 * Falls back to `true` if the environment can't be determined.
 */
function shouldWarnInDev(): boolean {
	try {
		// Vite / esbuild exposes `import.meta.env`; guard for safety.
		const meta = import.meta as unknown as {
			env?: { DEV?: boolean; MODE?: string };
		};
		if (meta.env)
			return meta.env.DEV === true || meta.env.MODE === "development";
	} catch {
		// ignore — fall through
	}
	// Fallback: assume not production when we can't tell.
	return true;
}

/**
 * Checks if a component schema can accept child components.
 */
export function canComponentAcceptChildren(schema: z.ZodType): boolean {
	if (!("shape" in schema)) {
		return false;
	}

	const objectSchema = schema as z.ZodObject<z.ZodRawShape>;
	return (
		hasAnyChildrenField(objectSchema) &&
		!hasChildrenFieldOfTypeString(objectSchema)
	);
}

/**
 * Checks if a Zod schema has a children field of type ANY.
 */
export function hasAnyChildrenField(
	schema: z.ZodObject<z.ZodRawShape>
): boolean {
	const { shape } = schema;
	if (!shape.children) {
		return false;
	}

	const childrenZod = asZodType(shape.children);
	if (!childrenZod) return false;
	let childrenSchema: z.ZodType = childrenZod;
	let childDefType = getDefType(childrenSchema);

	while (childDefType === "optional" || childDefType === "nullable") {
		const childDef = getDef(childrenSchema);
		const inner = asZodType(childDef?.innerType);
		if (!inner) break;
		childrenSchema = inner;
		childDefType = getDefType(childrenSchema);
	}

	return childDefType === "any";
}

/**
 * Checks if a Zod schema has a children field of type String.
 */
export function hasChildrenFieldOfTypeString(
	schema: z.ZodObject<z.ZodRawShape>
): boolean {
	const { shape } = schema;
	if (!shape.children) {
		return false;
	}

	const childrenZod = asZodType(shape.children);
	if (!childrenZod) return false;
	let childrenSchema: z.ZodType = childrenZod;
	let childDefType = getDefType(childrenSchema);

	while (childDefType === "optional" || childDefType === "nullable") {
		const childDef = getDef(childrenSchema);
		const inner = asZodType(childDef?.innerType);
		if (!inner) break;
		childrenSchema = inner;
		childDefType = getDefType(childrenSchema);
	}

	return childDefType === "string";
}
