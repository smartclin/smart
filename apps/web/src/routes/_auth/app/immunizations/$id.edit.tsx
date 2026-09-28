// src/routes/_auth/app/immunizations/$id.edit.tsx

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { ImmunizationForm } from "@/components/forms/ImmunizationForm";
import { ImmunizationDetailSkeleton } from "@/components/skeletons";
import { requireRole } from "@/functions/get-user";

export const Route = createFileRoute("/_auth/app/immunizations/$id/edit")({
	component: EditImmunizationPage,
	pendingComponent: ImmunizationDetailSkeleton,
	beforeLoad: async () => {
		const user = await requireRole({ data: ["admin", "doctor"] });
		if (!user) {
			throw redirect({ to: "/login" });
		}
		return { role: user.role };
	},
});

function EditImmunizationPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const handleClose = () => {
		navigate({ to: "/app/immunizations/$id", params: { id } });
	};

	const handleSuccess = () => {
		navigate({ to: "/app/immunizations/$id", params: { id } });
	};

	return (
		<ImmunizationForm
			immunizationId={id}
			onClose={handleClose}
			onSuccess={handleSuccess}
			redirectTo="/app/immunizations"
		/>
	);
}
