import { createFileRoute, redirect } from "@tanstack/react-router";

import DatabaseSettings from "@/components/settings/DatabaseSettings";
import { requireRole } from "@/functions/get-user";

export const Route = createFileRoute("/_auth/app/settings/database")({
	component: SettingsPage,
	beforeLoad: async () => {
		const user = await requireRole({ data: ["admin", "doctor"] });
		if (!user) {
			throw redirect({ to: "/login" });
		}
		return { role: user.role };
	},
});

function SettingsPage() {
	return <DatabaseSettings />;
}
