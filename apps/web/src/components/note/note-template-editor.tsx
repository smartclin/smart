import { Button } from "@smart/ui/components/button";
import UIBuilder from "@smart/ui/components/ui-builder";
import type {
	ComponentLayer,
	ComponentRegistry,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Save } from "lucide-react";
import { useCallback, useState } from "react";
import {
	useNoteTemplate,
	useUpdateNoteTemplate,
} from "@/hooks/use-note-templates.ts";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import { clinicalComponentDefinitions } from "@/lib/ui-builder/registry/clinical-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";
import { APPOINTMENT_TYPES } from "./note-template-list.tsx";

const clinicComponentRegistry: ComponentRegistry = {
	...primitiveComponentDefinitions,
	...complexComponentDefinitions,
	...shadcnComponentDefinitions,
	...clinicalComponentDefinitions,
};

interface Props {
	templateId: string;
}

export function NoteTemplateEditor({ templateId }: Props) {
	const navigate = useNavigate();
	const { data: template } = useNoteTemplate(templateId);
	const updateTemplate = useUpdateNoteTemplate(templateId);

	// Local editor state — synced on save.
	const [layers, setLayers] = useState<ComponentLayer[]>([]);
	const [variables, setVariables] = useState<Variable[]>([]);

	// Hydrate local state from the loaded template once.
	// `useNoteTemplate` guarantees data is cached by the loader.
	if (template && layers.length === 0 && template.layers.length > 0) {
		setLayers(template.layers);
		setVariables(template.variables);
	}

	const handleLayersChange = useCallback((next: ComponentLayer[]) => {
		setLayers(next);
	}, []);

	const handleVariablesChange = useCallback((next: Variable[]) => {
		setVariables(next);
	}, []);

	const handleSave = useCallback(() => {
		if (!template) return;
		updateTemplate.mutate({
			...template,
			layers,
			variables,
			updatedAt: new Date().toISOString(),
		});
	}, [template, layers, variables, updateTemplate]);

	if (!template) return null;

	const appointmentLabel =
		APPOINTMENT_TYPES.find((t) => t.value === template.appointmentType)
			?.label ?? template.appointmentType;

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b bg-background px-4 py-2">
				<div className="flex items-center gap-4">
					<Button
						onClick={() => void navigate({ to: "/app/notes" })}
						variant="ghost"
					>
						← Back
					</Button>
					<div>
						<h2 className="font-semibold">{template.name}</h2>
						<p className="text-muted-foreground text-xs">
							{appointmentLabel}
						</p>
					</div>
				</div>
				<Button
					disabled={updateTemplate.isPending}
					onClick={handleSave}
				>
					{updateTemplate.isPending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Save className="mr-2 h-4 w-4" />
					)}
					Save Template
				</Button>
			</div>

			<div className="flex-1 overflow-hidden">
				<UIBuilder
					blocks={blockDefinitions}
					componentRegistry={clinicComponentRegistry}
					initialLayers={layers}
					initialVariables={variables}
					onChange={handleLayersChange}
					onVariablesChange={handleVariablesChange}
					persistLayerStore={false}
					showExport={false}
				/>
			</div>
		</div>
	);
}
