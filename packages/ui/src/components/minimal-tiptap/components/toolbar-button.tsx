import { Toggle } from "@smart/ui/components/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@smart/ui/components/tooltip";
import { cn } from "@smart/ui/lib/utils";
import type * as React from "react";

/**
 * Props accepted by `TooltipContent` in the Base UI tooltip wrapper.
 * Derived from the wrapper's own `ComponentProps` so it stays in sync
 * automatically if the wrapper signature changes.
 */
type TooltipContentProps = React.ComponentProps<typeof TooltipContent>;

interface ToolbarButtonProps extends React.ComponentProps<typeof Toggle> {
	isActive?: boolean;
	tooltip?: string;
	tooltipOptions?: TooltipContentProps;
}

const ToolbarButton = ({
	isActive,
	children,
	tooltip,
	className,
	tooltipOptions,
	...props
}: ToolbarButtonProps) => {
	const toggleButton = (
		<Toggle
			className={cn({ "bg-accent": isActive }, className)}
			{...props}
		>
			{children}
		</Toggle>
	);

	if (!tooltip) {
		return toggleButton;
	}

	return (
		<Tooltip>
			<TooltipTrigger render={toggleButton} />
			<TooltipContent {...tooltipOptions}>
				<div className="flex flex-col items-center text-center">
					{tooltip}
				</div>
			</TooltipContent>
		</Tooltip>
	);
};

ToolbarButton.displayName = "ToolbarButton";

export default ToolbarButton;
