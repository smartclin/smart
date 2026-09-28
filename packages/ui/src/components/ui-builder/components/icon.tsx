import { cn } from "@smart/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
	Activity,
	AlertCircle,
	ArrowRight,
	Bell,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	CircleAlert,
	CircleCheck,
	Copy,
	ExternalLink,
	Heart,
	Home,
	Info,
	Loader2,
	Menu,
	MoreHorizontal,
	Plus,
	Search,
	Settings,
	Star,
	Trash2,
	User,
	X,
} from "lucide-react";
import type * as React from "react";

/**
 * Curated set of Lucide icons exposed by the UI Builder.
 *
 * Using an explicit map (instead of `import * as LucideIcons`) is required
 * for tree-shaking: bundlers cannot statically analyze dynamic namespace
 * access (`LucideIcons[iconName]`), so they end up shipping the entire
 * ~1MB lucide-react catalog. With an explicit map, only the icons listed
 * here are bundled.
 *
 * To add a new icon:
 *   1. Import it from "lucide-react" above.
 *   2. Add it to `iconMap` below.
 * That's it — `LucideIconName` and `iconNames` derive from the map.
 */
const iconMap = {
	Activity,
	AlertCircle,
	ArrowRight,
	Bell,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	CircleAlert,
	CircleCheck,
	Copy,
	ExternalLink,
	Heart,
	Home,
	Info,
	Loader2,
	Menu,
	MoreHorizontal,
	Plus,
	Search,
	Settings,
	Star,
	Trash2,
	User,
	X,
} as const;

export type LucideIconName = keyof typeof iconMap;
type LucideIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const iconVariants = cva("inline-flex", {
	variants: {
		size: {
			small: "h-4 w-4",
			medium: "h-6 w-6",
			large: "h-8 w-8",
		},
		color: {
			accent: "text-accent",
			accentForeground: "text-accent-foreground",
			primary: "text-primary",
			primaryForeground: "text-primary-foreground",
			secondary: "text-secondary",
			secondaryForeground: "text-secondary-foreground",
			destructive: "text-destructive",
			destructiveForeground: "text-destructive-foreground",
			muted: "text-muted",
			mutedForeground: "text-muted-foreground",
			background: "text-background",
			foreground: "text-foreground",
		},
		rotate: {
			none: "rotate-0",
			"90": "rotate-90",
			"180": "rotate-180",
			"270": "rotate-270",
		},
	},
	defaultVariants: {
		size: "medium",
		color: "primary",
		rotate: "none",
	},
});

export interface IconProps
	extends Omit<React.HTMLAttributes<SVGElement>, "color">,
		VariantProps<typeof iconVariants> {
	iconName: LucideIconName;
}

const Icon = ({
	className,
	iconName,
	size,
	color,
	rotate,
	ref,
	...props
}: IconProps & { ref?: React.RefObject<SVGSVGElement | null> }) => {
	const IconComponent = iconMap[iconName] as LucideIconComponent | undefined;

	if (!IconComponent) {
		console.error(
			`Icon "${iconName}" does not exist in the icon map. ` +
				"Add it to `iconMap` in components/ui-builder/components/icon.tsx."
		);
		return null;
	}

	return (
		<IconComponent
			className={cn(iconVariants({ size, color, rotate, className }))}
			ref={ref}
			{...props}
		/>
	);
};

Icon.displayName = "Icon";

export const iconNames = Object.keys(iconMap) as [
	LucideIconName | "image",
	...LucideIconName[],
];
export { Icon, iconVariants };
