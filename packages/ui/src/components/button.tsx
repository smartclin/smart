import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@smart/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
	[
		"group/button inline-flex shrink-0 select-none items-center justify-center",
		"whitespace-nowrap rounded-none border border-transparent bg-clip-padding",
		"font-medium text-xs outline-none transition-all",
		"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
		"active:not-aria-[haspopup]:translate-y-px",
		"disabled:pointer-events-none disabled:opacity-50",
		"aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
		"dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
		"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	].join(" "),
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-primary/80",
				outline:
					"border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
				ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
				destructive:
					"bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30",
				link: "text-primary underline-offset-4 hover:underline",
				icon: [
					"rounded-md text-icon-default",
					"hover:bg-surface-state-hover hover:text-text-primary",
					"aria-expanded:bg-surface-state-hover aria-expanded:text-text-primary",
				].join(" "),
			},
			tone: {
				blue: "text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30",
				green: "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30",
				red: "text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30",
				orange: "text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30",
				purple: "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30",
				gray: "text-text-muted hover:bg-background-subtle",
				emerald:
					"text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
				cyan: "text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30",
				yellow: "text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
			},
			size: {
				default:
					"h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				xs: "h-6 gap-1 rounded-none px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7 gap-1 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				icon: "size-8",
				"icon-xs":
					"size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-7 rounded-none",
				"icon-lg": "size-9",
			},
			rounded: {
				none: "rounded-none",
				md: "rounded-md",
				lg: "rounded-lg",
				full: "rounded-full",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

type ButtonProps = Omit<ButtonPrimitive.Props, "color"> &
	VariantProps<typeof buttonVariants> & {
		ref?: React.Ref<HTMLButtonElement>;
	};

function Button({
	className,
	variant,
	tone,
	size,
	rounded,
	...props
}: ButtonProps) {
	return (
		<ButtonPrimitive
			className={cn(
				buttonVariants({ variant, tone, size, rounded }),
				className
			)}
			data-slot="button"
			{...props}
		/>
	);
}

export type { ButtonProps };
export { Button, buttonVariants };
