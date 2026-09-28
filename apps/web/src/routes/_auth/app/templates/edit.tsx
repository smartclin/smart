// src/routes/_auth/app/templates/edit.tsx

import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { templateQueryOptions, useTemplates } from "@/queries/templates";

export const Route = createFileRoute("/_auth/app/templates/edit")({
	validateSearch: (search: Record<string, unknown>): { id?: string } => ({
		id: typeof search.id === "string" ? search.id : undefined,
	}),
	beforeLoad: ({ search }) => {
		if (search.id) {
			throw redirect({
				to: "/app/templates/$id/edit",
				params: { id: search.id },
			});
		}
	},
	loader: ({ context: { queryClient } }) =>
		queryClient.query(templateQueryOptions.list()),
	component: EditTemplatePickerPage,
});

function EditTemplatePickerPage() {
	const navigate = useNavigate();
	const { data: templates = [], isLoading } = useTemplates();
	const [selectedId, setSelectedId] = useState<string>("");

	const handleProceed = () => {
		if (selectedId) {
			navigate({
				to: "/app/templates/$id/edit",
				params: { id: selectedId },
			});
		}
	};

	return (
		<div className="mx-auto max-w-xl px-6 py-12">
			<Card className="shadow-md">
				<CardHeader>
					<div className="mb-1 flex items-center gap-2 text-muted-foreground text-xs">
						<Button
							className="size-7 p-0"
							render={
								<Link to="/app/templates">
									<ArrowLeft className="size-3.5" />
								</Link>
							}
							size="icon"
							variant="ghost"
						/>
						<span>Templates Studio</span>
					</div>
					<CardTitle className="text-xl">
						Select a Template to Edit
					</CardTitle>
					<CardDescription className="text-xs">
						Choose an existing clinic template from your library to
						open in the UI Builder.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 pt-2">
					<div className="space-y-2">
						<Select
							onValueChange={(val) => {
								if (val) setSelectedId(val);
							}}
							value={selectedId}
						>
							<SelectTrigger className="h-10 text-sm">
								<SelectValue placeholder="Choose a template to edit…" />
							</SelectTrigger>
							<SelectContent>
								{templates.map((tpl) => (
									<SelectItem
										key={tpl.id}
										value={tpl.id}
									>
										{tpl.name} ({tpl.category})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between border-t pt-4">
						<Button
							render={
								<Link to="/app/templates/new">
									<Plus className="mr-1.5 size-4" />
									Create New Instead
								</Link>
							}
							variant="ghost"
						/>

						<Button
							disabled={!selectedId || isLoading}
							onClick={handleProceed}
						>
							<Pencil className="mr-1.5 size-4" />
							Open in Studio
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
