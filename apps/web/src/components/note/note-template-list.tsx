import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Loader2, Trash2 } from "lucide-react";
import {
	type NoteTemplate,
	useDeleteNoteTemplate,
	useNoteTemplates,
} from "@/hooks/use-note-templates";

export const APPOINTMENT_TYPES = [
	{ value: "well-child", label: "Well-Child Visit" },
	{ value: "sick-visit", label: "Sick Visit" },
	{ value: "2-year-checkup", label: "2-Year Checkup" },
	{ value: "ear-infection", label: "Ear Infection Visit" },
	{ value: "asthma-followup", label: "Asthma Follow-up" },
	{ value: "adhd-followup", label: "ADHD Follow-up" },
	{ value: "immunization", label: "Immunization Visit" },
	{ value: "sports-physical", label: "Sports Physical" },
] as const;

function appointmentLabel(value: string): string {
	return APPOINTMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function NoteTemplateList() {
	const navigate = useNavigate();
	const { data: templates = [], isLoading } = useNoteTemplates();
	const deleteTemplate = useDeleteNoteTemplate();

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (templates.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold">No templates yet</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Create your first note template to get started.
					</p>
					<Button
						nativeButton={false}
						render={<a href="/app/note-templates/new" />}
					>
						Create Template
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{templates.map((template: NoteTemplate) => (
				<Card
					className="cursor-pointer transition-shadow hover:shadow-md"
					key={template.id}
					onClick={() =>
						void navigate({
							to: "/app/notes/$templetId",
							params: { templetId: template.id },
						})
					}
				>
					<CardHeader className="pb-2">
						<div className="flex items-start justify-between">
							<CardTitle className="text-base">
								{template.name}
							</CardTitle>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									deleteTemplate.mutate(template.id);
								}}
								size="icon-sm"
								variant="ghost"
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<Badge
							className="text-xs"
							variant="secondary"
						>
							{appointmentLabel(template.appointmentType)}
						</Badge>
						<p className="mt-2 text-muted-foreground text-xs">
							Updated{" "}
							{new Date(template.updatedAt).toLocaleDateString()}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
