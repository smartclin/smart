import { THEME_COLORS } from "@smart/ui/lib/utils";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import * as React from "react";
import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { z } from "zod";

export const themeModeSchema = z.enum(["light", "dark", "auto"]);
export const resolvedThemeSchema = z.enum(["light", "dark"]);

export type ThemeMode = z.infer<typeof themeModeSchema>;
export type ResolvedTheme = z.infer<typeof resolvedThemeSchema>;

export const THEME_STORAGE_KEY = "theme";

type ThemeContextProps = {
	themeMode: ThemeMode;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: ThemeMode) => void;
	toggleMode: () => void;
};

export const ThemeContext = createContext<ThemeContextProps | undefined>(
	undefined
);

export const useTheme = () => {
	const context = React.useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

// ─── Isomorphic helpers ───────────────────────────────────────────────────────

const getStoredThemeMode = createIsomorphicFn()
	.server((): ThemeMode => "auto")
	.client((): ThemeMode => {
		try {
			const stored = localStorage.getItem(THEME_STORAGE_KEY);
			const parsed = themeModeSchema.safeParse(stored);
			return parsed.success ? parsed.data : "auto";
		} catch {
			return "auto";
		}
	});

const setStoredThemeMode = createClientOnlyFn((theme: ThemeMode) => {
	try {
		const parsed = themeModeSchema.safeParse(theme);
		if (parsed.success) {
			localStorage.setItem(THEME_STORAGE_KEY, parsed.data);
		}
	} catch {
		// storage unavailable
	}
});

const getSystemTheme = createIsomorphicFn()
	.server((): ResolvedTheme => "light")
	.client(
		(): ResolvedTheme =>
			window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
	);

const updateThemeClass = createClientOnlyFn((themeMode: ThemeMode) => {
	const root = document.documentElement;
	if (!root) return;

	root.classList.add("theme-switching");
	root.classList.remove("light", "dark", "auto");

	const newTheme = themeMode === "auto" ? getSystemTheme() : themeMode;
	root.classList.add(newTheme);
	root.style.colorScheme = newTheme;

	if (themeMode === "auto") {
		root.classList.add("auto");
	}

	root.dataset.themeMode = themeMode;

	// Sync <meta name="theme-color"> so the mobile browser chrome matches.
	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute(
			"content",
			newTheme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light
		);
	}

	// Force reflow so .theme-switching applies to the class change,
	// then drop it two frames later so user interactions animate normally.
	void root.offsetHeight;
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			root.classList.remove("theme-switching");
		});
	});
});

const getNextTheme = createClientOnlyFn((current: ThemeMode): ThemeMode => {
	const themes: ThemeMode[] =
		getSystemTheme() === "dark"
			? ["auto", "light", "dark"]
			: ["auto", "dark", "light"];
	return themes[(themes.indexOf(current) + 1) % themes.length] as ThemeMode;
});

// ─── Provider ─────────────────────────────────────────────────────────────────

type ThemeProviderProps = {
	children: React.ReactNode;
	/** Initial mode used during SSR + first render. Defaults to "auto". */
	defaultMode?: ThemeMode;
};

export function ThemeProvider({
	children,
	defaultMode = "auto",
}: ThemeProviderProps) {
	const [themeMode, setThemeMode] = useState<ThemeMode>(defaultMode);
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

	// Hydrate from storage + system on mount.
	useEffect(() => {
		const stored = getStoredThemeMode();
		setThemeMode(stored);
		updateThemeClass(stored);
		setResolvedTheme(stored === "auto" ? getSystemTheme() : stored);
	}, []);

	// Track system theme changes only while in "auto".
	useEffect(() => {
		if (themeMode !== "auto") return;
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			updateThemeClass("auto");
			setResolvedTheme(getSystemTheme());
		};
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [themeMode]);

	const setTheme = useCallback((next: ThemeMode) => {
		setThemeMode(next);
		setStoredThemeMode(next);
		updateThemeClass(next);
		setResolvedTheme(next === "auto" ? getSystemTheme() : next);
	}, []);

	const toggleMode = useCallback(() => {
		setThemeMode((current) => {
			const next = getNextTheme(current);
			setStoredThemeMode(next);
			updateThemeClass(next);
			setResolvedTheme(next === "auto" ? getSystemTheme() : next);
			return next;
		});
	}, []);

	const value = useMemo<ThemeContextProps>(
		() => ({ themeMode, resolvedTheme, setTheme, toggleMode }),
		[themeMode, resolvedTheme, setTheme, toggleMode]
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

// ─── Optional: read <html> class for hydration matching ───────────────────────

const getHtmlClass = createIsomorphicFn()
	.server(() => "")
	.client(() => document.documentElement?.className ?? "");

export function useHtmlClass(): string {
	return getHtmlClass();
}
