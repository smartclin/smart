// src/routes/_auth/app/encounters/$id.edit.tsx

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { EncounterForm } from "@/components/forms/EncounterForm";
import { requireRole } from "@/functions/get-user";
import { useEncounterById } from "@/hooks/use-encounters";

export const Route = createFileRoute("/_auth/app/encounters/$id/edit")({
	component: EditEncounterPage,
	beforeLoad: async () => {
		const user = await requireRole({ data: ["admin", "doctor"] });
		if (!user) {
			throw redirect({ to: "/login" });
		}
		return { role: user.role };
	},
});

function EditEncounterPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { data: encounter, isLoading, isError } = useEncounterById(id);

	const handleClose = () => {
		navigate({ to: "/app/encounters/$id", params: { id } });
	};

	const handleSuccess = () => {
		navigate({ to: "/app/encounters/$id", params: { id } });
	};

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Loader2 className="size-8 animate-spin text-teal-600" />
			</div>
		);
	}

	if (isError || !encounter) {
		return (
			<div className="container mx-auto max-w-3xl py-6">
				<div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
					<h3 className="font-bold text-base text-slate-700">
						Encounter not found
					</h3>
					<p className="mt-1 text-slate-500 text-xs">
						This encounter no longer exists or could not be loaded.
					</p>
					<button
						className="mt-4 rounded-xl bg-teal-600 px-4 py-2 font-bold text-white text-xs"
						onClick={() => navigate({ to: "/app/encounters" })}
						type="button"
					>
						Back to Encounters
					</button>
				</div>
			</div>
		);
	}

	return (
		<EncounterForm
			encounterId={id}
			onClose={handleClose}
			onSuccess={handleSuccess}
		/>
	);
}
