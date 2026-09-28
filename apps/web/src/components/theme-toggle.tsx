import { Button } from "@smart/ui/components/button";
import { useTheme } from "@smart/ui/components/theme-provider";
import { Moon, Sun, Sunrise } from "lucide-react";
import type * as React from "react";

export function ThemeToggle() {
	const { themeMode, resolvedTheme, toggleMode } = useTheme();

	const handleToggleMode = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		toggleMode();
	};

	const label =
		themeMode === "auto"
			? "Auto"
			: themeMode === "light"
				? "Light"
				: "Dark";

	const nextLabel =
		themeMode === "auto"
			? "light"
			: themeMode === "light"
				? "dark"
				: "auto";

	const activeIcon = themeMode === "auto" ? "auto" : resolvedTheme;

	const getIconClassName = (icon: typeof activeIcon) =>
		[
			"col-start-1 row-start-1 size-[18px] shrink-0 transition-opacity motion-reduce:transition-none",
			activeIcon === icon ? "opacity-100" : "opacity-0",
		].join(" ");

	return (
		<Button
			aria-label={`Theme: ${label}. Switch to ${nextLabel} mode.`}
			className="h-8 w-8 shrink-0 rounded-md border-0 p-0 text-icon-default leading-none shadow-none hover:bg-surface-state-hover hover:text-text-primary"
			onClick={handleToggleMode}
			size="icon-sm"
			title={`Theme: ${label}. Switch to ${nextLabel} mode.`}
			type="button"
			variant="icon"
		>
			<span
				aria-hidden="true"
				className="grid size-[18px] shrink-0 place-items-center"
			>
				<Sunrise
					className={getIconClassName("auto")}
					strokeWidth={2.5}
				/>
				<Sun
					className={getIconClassName("light")}
					strokeWidth={2.5}
				/>
				<Moon
					className={getIconClassName("dark")}
					strokeWidth={2.5}
				/>
			</span>
		</Button>
	);
}
