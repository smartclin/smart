import LayerRenderer from "@smart/ui/components/ui-builder/layer-renderer";
import type {
	ComponentLayer,
	ComponentRegistry,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import { clinicalComponentDefinitions } from "@/lib/ui-builder/registry/clinical-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";

const fullRegistry: ComponentRegistry = {
	...primitiveComponentDefinitions,
	...complexComponentDefinitions,
	...shadcnComponentDefinitions,
	...clinicalComponentDefinitions,
};

interface AppointmentNoteRendererProps {
	className?: string;
	/** The template layers saved from the editor */
	layers: ComponentLayer[];
	/** Called when form data changes */
	onChange?: (data: Record<string, unknown>) => void;
	/** Patient context for components that fetch by ID */
	patientId?: string;
	/** Variable definitions from the template */
	variables: Variable[];
	/** Runtime values to inject into variables */
	variableValues?: Record<string, unknown>;
}

export function AppointmentNoteRenderer({
	layers,
	variables,
	variableValues,
	patientId,
	className,
}: AppointmentNoteRendererProps) {
	// Merge patient ID into variable values
	const mergedVariableValues = {
		...variableValues,
		patientId,
	};

	if (!layers.length) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				No template layers to render
			</div>
		);
	}

	return (
		<div className={className}>
			{layers.map((layer) => (
				<LayerRenderer
					componentRegistry={fullRegistry}
					key={layer.id}
					page={layer}
					variables={variables}
					variableValues={mergedVariableValues}
				/>
			))}
		</div>
	);
}
