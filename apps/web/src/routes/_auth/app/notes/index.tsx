import { Button } from "@smart/ui/components/button";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { NoteTemplateList } from "@/components/note/note-template-list";
import { noteTemplateListQueryOptions } from "@/hooks/use-note-templates";

export const Route = createFileRoute("/_auth/app/notes/")({
	component: NoteTemplatesRoute,
	loader: async ({ context: { queryClient } }) => {
		// Warm the list — component reads via useQuery, no flash.
		await queryClient.query(noteTemplateListQueryOptions());
	},
});

function NoteTemplatesRoute() {
	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Note Templates</h1>
					<p className="text-muted-foreground">
						Create and manage clinical note templates for your
						clinic.
					</p>
				</div>
				<Button
					nativeButton={false}
					render={<Link to="/app/notes/new" />}
				>
					<Plus className="mr-2 h-4 w-4" />
					New Template
				</Button>
			</header>

			<NoteTemplateList />
			<Outlet />
		</div>
	);
}
