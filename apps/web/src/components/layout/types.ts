// src/components/layout/types.ts
import type { ReactNode } from "react";

export interface BreadcrumbItem {
	href?: string;
	label: string;
}

export interface NavItem {
	badge?: number;
	icon: React.ReactNode;
	label: string;
	to: string;
}

export interface AppLayoutProps {
	children?: React.ReactNode;
}

export interface AppShellProps {
	actions?: ReactNode;
	breadcrumbs?: BreadcrumbItem[];
	children: ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "full" | "prose";
	subtitle?: string;
	title?: string;
}
