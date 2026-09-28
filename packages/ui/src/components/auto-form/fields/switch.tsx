import { FormControl, FormItem } from "@smart/ui/components/form";
import { Switch } from "@smart/ui/components/switch";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import type { AutoFormInputComponentProps } from "../types";

export default function AutoFormSwitch({
	label,
	isRequired,
	field,
	fieldConfigItem,
	fieldProps,
}: AutoFormInputComponentProps) {
	return (
		<div>
			<FormItem>
				<div className="flex items-center gap-3">
					<FormControl>
						<Switch
							checked={field.state.value}
							onCheckedChange={field.handleChange}
							{...fieldProps}
						/>
					</FormControl>
					<AutoFormLabel
						isRequired={isRequired}
						label={fieldConfigItem?.label || label}
					/>
				</div>
			</FormItem>
			<AutoFormTooltip fieldConfigItem={fieldConfigItem} />
		</div>
	);
}
