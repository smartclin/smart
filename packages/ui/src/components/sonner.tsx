import { useTheme } from "@smart/ui/components/theme-provider";
import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { themeMode } = useTheme();

	// Sonner only understands "light" | "dark" | "system".
	// Our provider uses "auto" for system, so map it.
	const sonnerTheme: ToasterProps["theme"] =
		themeMode === "auto" ? "system" : themeMode;
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	if (!mounted) return null;
	return (
		<Sonner
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			theme={sonnerTheme}
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
