import { Button } from "@smart/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@smart/ui/components/dialog";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { APPOINTMENT_TYPES } from "@/components/note/note-template-list";
import { useCreateNoteTemplate } from "@/hooks/use-note-templates";

export const Route = createFileRoute("/_auth/app/notes/new")({
	component: NewNoteTemplateRoute,
});

function NewNoteTemplateRoute() {
	const navigate = useNavigate();
	const createTemplate = useCreateNoteTemplate();

	const [name, setName] = useState("");
	const [type, setType] = useState<string>("well-child");

	const handleCreate = () => {
		if (!name.trim()) return;
		createTemplate.mutate(
			{ name, appointmentType: type },
			{
				onSuccess: (created) => {
					void navigate({
						to: "/app/notes/$templetId",
						params: { templetId: created.id },
					});
				},
			}
		);
	};

	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) void navigate({ to: "/app/notes" });
			}}
			open
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Template</DialogTitle>
					<DialogDescription>
						Create a new clinical note template for your clinic.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="template-name">Template Name</Label>
						<Input
							id="template-name"
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., 2-Year Well-Child Visit"
							value={name}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="appointment-type">
							Appointment Type
						</Label>
						<Select
							onValueChange={(v) => v && setType(v)}
							value={type}
						>
							<SelectTrigger id="appointment-type">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{APPOINTMENT_TYPES.map((t) => (
									<SelectItem
										key={t.value}
										value={t.value}
									>
										{t.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={() => void navigate({ to: "/app/notes" })}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={createTemplate.isPending}
						onClick={handleCreate}
					>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
