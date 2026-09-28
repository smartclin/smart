import { FormLabel } from "@smart/ui/components/form";
import { cn } from "@smart/ui/lib/utils";

function AutoFormLabel({
	label,
	isRequired,
	className,
}: {
	label: string;
	isRequired: boolean;
	className?: string;
}) {
	return (
		<FormLabel className={cn(className)}>
			{label}
			{isRequired && <span className="text-destructive"> *</span>}
		</FormLabel>
	);
}

export default AutoFormLabel;
