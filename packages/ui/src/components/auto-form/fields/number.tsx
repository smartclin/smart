import { FormControl, FormItem, FormMessage } from "@smart/ui/components/form";
import { Input } from "@smart/ui/components/input";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import type { AutoFormInputComponentProps } from "../types";

export default function AutoFormNumber({
	label,
	isRequired,
	fieldConfigItem,
	fieldProps,
}: AutoFormInputComponentProps) {
	const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
	const showLabel = _showLabel === undefined ? true : _showLabel;

	return (
		<FormItem>
			{!showLabel && (
				<AutoFormLabel
					isRequired={isRequired}
					label={fieldConfigItem?.label || label}
				/>
			)}
			<FormControl>
				<Input
					type="number"
					{...fieldPropsWithoutShowLabel}
				/>
			</FormControl>
			<AutoFormTooltip fieldConfigItem={fieldConfigItem} />
			<FormMessage field={fieldPropsWithoutShowLabel.field} />
		</FormItem>
	);
}
