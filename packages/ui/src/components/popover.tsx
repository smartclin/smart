import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "cn";
import * as React from "react";

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return (
		<PopoverPrimitive.Root
			data-slot="popover"
			{...props}
		/>
	);
}

function PopoverTrigger({
	asChild = false,
	render,
	children,
	...props
}: PopoverPrimitive.Trigger.Props & { asChild?: boolean }) {
	const resolved =
		asChild && React.isValidElement(children) ? children : render;
	return (
		<PopoverPrimitive.Trigger
			render={resolved}
			{...props}
		>
			{asChild ? children : null}
		</PopoverPrimitive.Trigger>
	);
}

function PopoverContent({
	className,
	align = "center",
	sideOffset = 4,
	collisionPadding, // add any other Positioner props you use
	side = "bottom",

	...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
	align?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";

	sideOffset?: number;
	collisionPadding?: number;
}) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				align={align}
				className="outline-hidden"
				collisionPadding={collisionPadding}
				side={side}
				sideOffset={sideOffset}
			>
				<PopoverPrimitive.Popup
					className={cn(
						"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-4 rounded-3xl bg-popover p-4 text-popover-foreground text-sm shadow-lg outline-hidden ring-1 ring-foreground/5 duration-100 data-closed:animate-out data-open:animate-in dark:ring-foreground/10",
						className
					)}
					data-slot="popover-content"
					{...props}
				/>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

function PopoverAnchor({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return (
		<PopoverPrimitive.Trigger
			data-slot="popover-anchor"
			{...props}
		/>
	);
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex flex-col gap-1 text-sm", className)}
			data-slot="popover-header"
			{...props}
		/>
	);
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
	return (
		<div
			className={cn("font-medium text-base", className)}
			data-slot="popover-title"
			{...props}
		/>
	);
}

function PopoverDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			className={cn("text-muted-foreground", className)}
			data-slot="popover-description"
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
};
