import { createFileRoute } from "@tanstack/react-router";
import { NoteTemplateEditor } from "@/components/note/note-template-editor";
import { noteTemplateByIdQueryOptions } from "@/hooks/use-note-templates";

export const Route = createFileRoute("/_auth/app/notes/$templetId")({
	component: NoteTemplateEditorRoute,
	loader: async ({ params, context: { queryClient } }) => {
		await queryClient.query(noteTemplateByIdQueryOptions(params.templetId));
	},
});

function NoteTemplateEditorRoute() {
	const { templetId } = Route.useParams();
	return <NoteTemplateEditor templateId={templetId} />;
}
