import { FormControl, FormItem, FormMessage } from "@smart/ui/components/form";
import { Input } from "@smart/ui/components/input";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import type { AutoFormInputComponentProps } from "../types";

export default function AutoFormInput({
	label,
	isRequired,
	fieldConfigItem,
	fieldProps,
}: AutoFormInputComponentProps) {
	const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
	const showLabel = _showLabel === undefined ? true : _showLabel;
	const type = fieldProps.type || "text";

	return (
		<div className="flex flex-row items-center space-x-2">
			<FormItem className="flex w-full flex-col justify-start">
				{!showLabel && (
					<AutoFormLabel
						isRequired={isRequired}
						label={fieldConfigItem?.label || label}
					/>
				)}
				<FormControl>
					<Input
						type={type}
						{...fieldPropsWithoutShowLabel}
					/>
				</FormControl>
				<AutoFormTooltip fieldConfigItem={fieldConfigItem} />
				<FormMessage field={fieldPropsWithoutShowLabel.field} />
			</FormItem>
		</div>
	);
}
