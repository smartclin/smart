// src/routes/_auth/app/templates.tsx

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/templates")({
	component: TemplatesLayout,
});

function TemplatesLayout() {
	return <Outlet />;
}
