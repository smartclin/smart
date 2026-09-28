import { cn } from "@smart/ui/lib/utils";
import type * as React from "react";

interface ResizeProps extends React.ComponentProps<"div"> {
	isResizing?: boolean;
}

export const ResizeHandle = ({
	ref,
	className,
	isResizing = false,
	...props
}: ResizeProps) => (
	<div
		className={cn(
			"absolute top-1/2 h-10 max-h-full w-1.5 -translate-y-1/2 transform cursor-col-resize rounded border border-[var(--mt-transparent-foreground)] border-solid bg-[var(--mt-bg-secondary)] p-px transition-all",
			"opacity-0 [backdrop-filter:saturate(1.8)_blur(20px)]",
			{
				"opacity-80": isResizing,
				"group-hover/node-image:opacity-80": !isResizing,
			},
			"before:absolute before:inset-y-0 before:-right-1 before:-left-1",
			className
		)}
		ref={ref}
		{...props}
	/>
);

ResizeHandle.displayName = "ResizeHandle";
