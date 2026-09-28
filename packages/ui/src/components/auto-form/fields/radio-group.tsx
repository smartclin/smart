import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@smart/ui/components/form";
import { RadioGroup, RadioGroupItem } from "@smart/ui/components/radio-group";
import type * as z from "zod";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import { getBaseSchema } from "../helpers";
import type { AutoFormInputComponentProps } from "../types";

/**
 * Get enum values from a ZodEnum schema.
 * In Zod v4, enum values are accessed via the .options property or .enum property.
 */
function getEnumValues(schema: z.ZodEnum<any>): string[] {
	// Zod v4: use .options or .enum to get the array of enum values
	if (Array.isArray((schema as any).options)) {
		return (schema as any).options;
	}
	// Fallback: try the .enum property which contains {value: value} entries
	if ((schema as any).enum) {
		return Object.values((schema as any).enum);
	}
	// Last resort: check _zod.def.entries
	const def = (schema as any)._zod?.def;
	if (def?.entries) {
		return Object.values(def.entries);
	}
	return [];
}

export default function AutoFormRadioGroup({
	label,
	isRequired,
	field,
	zodItem,
	fieldProps,
	fieldConfigItem,
}: AutoFormInputComponentProps) {
	const baseSchema = getBaseSchema(zodItem) as unknown as z.ZodEnum<any>;
	const values = getEnumValues(baseSchema);

	return (
		<div>
			<FormItem>
				<AutoFormLabel
					isRequired={isRequired}
					label={fieldConfigItem?.label || label}
				/>
				<FormControl>
					<RadioGroup
						defaultValue={field.state.value}
						onValueChange={field.handleChange}
						{...fieldProps}
					>
						{values.map((value: string) => (
							<FormItem
								className="mb-2 flex items-center gap-3 space-y-0"
								key={value}
							>
								<FormControl>
									<RadioGroupItem value={value} />
								</FormControl>
								<FormLabel className="font-normal">
									{value}
								</FormLabel>
							</FormItem>
						))}
					</RadioGroup>
				</FormControl>
				<FormMessage field={field.name} />
			</FormItem>
			<AutoFormTooltip fieldConfigItem={fieldConfigItem} />
		</div>
	);
}
