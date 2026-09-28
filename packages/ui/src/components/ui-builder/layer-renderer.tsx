import { DevProfiler } from "@smart/ui/components/ui-builder/internal/components/dev-profiler";

import {
	type EditorConfig,
	RenderLayer,
} from "@smart/ui/components/ui-builder/internal/utils/render-utils";
import type {
	ComponentLayer,
	ComponentRegistry,
	FunctionRegistry,
	PropValue,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import React from "react";

interface LayerRendererProps<
	TRegistry extends ComponentRegistry = ComponentRegistry,
> {
	className?: string;
	componentRegistry: TRegistry;
	editorConfig?: EditorConfig;
	/** Optional function registry for resolving function-type variables */
	functionRegistry?: FunctionRegistry;
	page: ComponentLayer;
	/** Optional variable definitions */
	variables?: Variable[];
	/** Optional variable values to override defaults */
	variableValues?: Record<string, PropValue>;
}

const LayerRenderer = React.memo<LayerRendererProps>(function LayerRenderer({
	className,
	page,
	editorConfig,
	componentRegistry,
	variables,
	variableValues,
	functionRegistry,
}) {
	return (
		<DevProfiler
			id="LayerRenderer"
			threshold={30}
		>
			<div className={className}>
				<RenderLayer
					componentRegistry={componentRegistry}
					editorConfig={editorConfig}
					functionRegistry={functionRegistry}
					layer={page}
					variables={variables}
					variableValues={variableValues}
				/>
			</div>
		</DevProfiler>
	);
}) as <TRegistry extends ComponentRegistry = ComponentRegistry>(
	props: LayerRendererProps<TRegistry>
) => React.JSX.Element;

export default LayerRenderer;
