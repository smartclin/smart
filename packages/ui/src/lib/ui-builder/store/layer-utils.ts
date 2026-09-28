import { TAILWIND_V4_COLOR_KEYS } from "@smart/ui/components/ui-builder/internal/utils/base-colors";
import type {
	ComponentLayer,
	ComponentRegistry,
	PropValue,
	VariableReference,
} from "@smart/ui/components/ui-builder/types";
import type { LayerStore } from "../store/layer-store";
import { getDefaultProps } from "../store/schema-utils";

/**
 * Recursively visits each layer in the layer tree and applies the provided visitor function to each layer.
 */
export const visitLayer = (
	layer: ComponentLayer,
	parentLayer: ComponentLayer | null,
	visitor: (
		layer: ComponentLayer,
		parentLayer: ComponentLayer | null
	) => ComponentLayer
): ComponentLayer => {
	const updatedLayer = visitor(layer, parentLayer);

	if (hasLayerChildren(updatedLayer)) {
		const updatedChildren = updatedLayer.children.map((child) =>
			visitLayer(child, updatedLayer, visitor)
		);
		return { ...updatedLayer, children: updatedChildren };
	}

	return updatedLayer;
};

export const countLayers = (layers: ComponentLayer["children"]): number => {
	if (typeof layers === "string" || !Array.isArray(layers)) {
		return 0;
	}
	return layers.reduce((count, layer) => {
		if (hasLayerChildren(layer)) {
			return count + 1 + countLayers(layer.children);
		}
		return count + 1;
	}, 0);
};

export const addLayer = (
	layers: ComponentLayer[],
	newLayer: ComponentLayer,
	parentId?: string,
	parentPosition?: number
): ComponentLayer[] => {
	const updatedPages = layers.map((page) =>
		visitLayer(page, null, (layer) => {
			if (layer.id === parentId) {
				let updatedChildren: ComponentLayer[] = [];

				if (hasLayerChildren(layer)) {
					updatedChildren = [...layer.children];
				} else if (
					layer.children === undefined ||
					layer.children === null ||
					(Array.isArray(layer.children) &&
						layer.children.length === 0)
				) {
					updatedChildren = [];
				} else {
					return layer;
				}

				if (parentPosition === undefined) {
					updatedChildren = [...updatedChildren, newLayer];
				} else if (parentPosition < 0) {
					updatedChildren = [newLayer, ...updatedChildren];
				} else if (parentPosition >= updatedChildren.length) {
					updatedChildren = [...updatedChildren, newLayer];
				} else {
					updatedChildren = [
						...updatedChildren.slice(0, parentPosition),
						newLayer,
						...updatedChildren.slice(parentPosition),
					];
				}

				return { ...layer, children: updatedChildren };
			}

			return layer;
		})
	);
	return updatedPages;
};

export const findAllParentLayersRecursive = (
	layers: ComponentLayer[],
	layerId: string
): ComponentLayer[] => {
	const parents: ComponentLayer[] = [];

	const findParents = (
		layers: ComponentLayer[],
		targetId: string
	): boolean => {
		for (const layer of layers) {
			if (hasLayerChildren(layer)) {
				if (layer.children.some((child) => child.id === targetId)) {
					parents.push(layer);
					findParents(layers, layer.id);
					return true;
				}

				if (findParents(layer.children, targetId)) {
					parents.push(layer);
					return true;
				}
			}
		}
		return false;
	};

	findParents(layers, layerId);
	return parents;
};

export const findLayerRecursive = (
	layers: ComponentLayer[],
	layerId: string
): ComponentLayer | undefined => {
	for (const layer of layers) {
		if (layer.id === layerId) {
			return layer;
		}
		if (hasLayerChildren(layer)) {
			const foundInChildren = findLayerRecursive(layer.children, layerId);
			if (foundInChildren) {
				return foundInChildren;
			}
		}
	}
	return undefined;
};

export const duplicateWithNewIdsAndName = (
	layer: ComponentLayer,
	addCopySuffix = true
): ComponentLayer => {
	const newLayer: ComponentLayer = { ...layer, id: createId() };
	if (layer.name) {
		newLayer.name = `${layer.name}${addCopySuffix ? " (Copy)" : ""}`;
	}
	if (hasLayerChildren(newLayer) && hasLayerChildren(layer)) {
		newLayer.children = layer.children.map((child) =>
			duplicateWithNewIdsAndName(child, false)
		);
	}
	return newLayer;
};

export function createId(): string {
	const ALPHABET =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	const ID_LENGTH = 7;
	let result = "";
	const alphabetLength = ALPHABET.length;

	for (let i = 0; i < ID_LENGTH; i += 1) {
		const randomIndex = Math.floor(Math.random() * alphabetLength);
		result += ALPHABET.charAt(randomIndex);
	}

	return result;
}

/**
 * Checks if a layer has ComponentLayer[] children (not string or VariableReference)
 */
export const hasLayerChildren = (
	layer: ComponentLayer
): layer is ComponentLayer & { children: ComponentLayer[] } =>
	Array.isArray(layer.children) && typeof layer.children !== "string";

/* ------------------------------------------------------------------ */
/* Migrations                                                          */
/* ------------------------------------------------------------------ */

/**
 * Minimal shape of a v1 text layer used only during migration.
 * Props are `Record<string, unknown>` because the v1 format allowed
 * arbitrary keys that we don't attempt to type.
 */
interface LegacyTextLayer {
	id: string;
	name?: string;
	props: Record<string, unknown>;
	text: string;
	textType: "text" | "markdown";
	type: "_text_";
}

interface LegacyPageLayer {
	children: ComponentLayer[];
	id: string;
	name?: string;
	props: Record<string, unknown>;
	type: "_page_";
}

export function migrateV1ToV2(persistedState: unknown): LayerStore {
	console.log("Migrating store", { persistedState, version: 1 });

	const migratedState = persistedState as LayerStore;

	const transformLayer = (layer: ComponentLayer): ComponentLayer => {
		if (layer.type === "_text_") {
			const textLayer = layer as unknown as LegacyTextLayer;
			const transformedTextLayer: ComponentLayer = {
				type: textLayer.textType === "markdown" ? "Markdown" : "span",
				children: textLayer.text,
				id: textLayer.id,
				name: textLayer.name,
				props: textLayer.props as Record<string, PropValue>,
			};
			console.log("Transformed text layer", transformedTextLayer);
			return transformedTextLayer;
		}

		return layer;
	};

	const migratedPages = migratedState.pages.map((page: ComponentLayer) =>
		visitLayer(page, null, transformLayer)
	);

	return {
		...migratedState,
		pages: migratedPages,
	} satisfies LayerStore;
}

export function migrateV2ToV3(persistedState: unknown): LayerStore {
	console.log("Migrating store", { persistedState, version: 2 });

	const migratedState = persistedState as LayerStore;

	const keysToMap = {
		borderRadius: "data-border-radius",
		colorTheme: "data-color-theme",
		mode: "data-mode",
	} as const;

	type LegacyKey = keyof typeof keysToMap;

	const migratedPages = migratedState.pages.map((page: ComponentLayer) => {
		if (page.type === "_page_") {
			const pageLayer = page as unknown as LegacyPageLayer;
			const transformedPageLayer: ComponentLayer = {
				type: "div",
				children: pageLayer.children,
				id: pageLayer.id,
				name: pageLayer.name,
				props: Object.fromEntries(
					Object.entries(pageLayer.props).map(([key, value]) => {
						if (key in keysToMap) {
							return [keysToMap[key as LegacyKey], value];
						}
						return [key, value];
					})
				) as Record<string, PropValue>,
			};
			console.log("Transformed page layer", transformedPageLayer);
			return transformedPageLayer;
		}
		return page;
	});

	return {
		...migratedState,
		pages: migratedPages,
	} satisfies LayerStore;
}

/**
 * Converts old-format theme styles to Tailwind v4 format.
 */
function convertStyleToTailwindV4(
	oldStyle: Record<string, string>
): Record<string, string> {
	const newStyle: Record<string, string> = { ...oldStyle };

	for (const key of TAILWIND_V4_COLOR_KEYS) {
		const baseVar = `--${key}`;
		if (oldStyle[baseVar] && !oldStyle[`--color-${key}`]) {
			newStyle[`--color-${key}`] = `hsl(${oldStyle[baseVar]})`;
		}
	}

	const radiusValue = oldStyle["--radius"];
	if (radiusValue && !oldStyle["--radius-lg"]) {
		newStyle["--radius-lg"] = radiusValue;
		newStyle["--radius-md"] = `calc(${radiusValue} - 2px)`;
		newStyle["--radius-sm"] = `calc(${radiusValue} - 4px)`;
	}

	if (oldStyle["--background"] && !oldStyle["backgroundColor"]) {
		newStyle["backgroundColor"] = `hsl(${oldStyle["--background"]})`;
	}

	return newStyle;
}

/**
 * Migration from v5 to v6: Convert old-format theme styles to Tailwind v4 format.
 */
export function migrateV5ToV6(persistedState: unknown): LayerStore {
	console.log("Migrating store", { persistedState, version: 5 });

	const migratedState = persistedState as LayerStore;

	const migratedPages = migratedState.pages.map((page: ComponentLayer) => {
		if (page.type === "div" && page.props) {
			const hasStyle = "style" in page.props && page.props.style !== null;
			const hasCustomTheme =
				"data-color-theme" in page.props &&
				page.props["data-color-theme"] !== null;

			if (hasStyle && hasCustomTheme) {
				console.log("Converting style to Tailwind v4 format", {
					pageId: page.id,
					pageName: page.name,
					colorTheme: page.props["data-color-theme"],
				});
				const oldStyle = page.props.style as Record<string, string>;
				const newStyle = convertStyleToTailwindV4(oldStyle);
				return {
					...page,
					props: {
						...page.props,
						style: newStyle,
					},
				};
			}

			if (hasStyle && !hasCustomTheme) {
				console.log(
					"Removing old-format style from page (no custom theme)",
					{ pageId: page.id, pageName: page.name }
				);
				const { style: _removedStyle, ...restProps } = page.props;
				return {
					...page,
					props: restProps,
				};
			}
		}
		return page;
	});

	return {
		...migratedState,
		pages: migratedPages,
	} satisfies LayerStore;
}

/* ------------------------------------------------------------------ */
/* Layer creation                                                      */
/* ------------------------------------------------------------------ */

/**
 * Options for `createComponentLayer`.
 * `variables` only needs `id` and `defaultValue` — nothing else is read here.
 */
export interface CreateComponentLayerOptions {
	applyVariableBindings?: boolean;
	id?: string;
	name?: string;
	variables?: Array<{ id: string; defaultValue: unknown }>;
}

/**
 * Creates a new component layer with default props and children initialized from the component registry.
 */
export const createComponentLayer = (
	layerType: string,
	componentRegistry: ComponentRegistry,
	options: CreateComponentLayerOptions = {}
): ComponentLayer => {
	const { id, name, applyVariableBindings = false, variables = [] } = options;

	const componentDef =
		componentRegistry[layerType as keyof typeof componentRegistry];
	if (!componentDef) {
		throw new Error(
			`Component definition not found for type: ${layerType}`
		);
	}

	const { schema } = componentDef;

	// Safely check if schema has shape property (ZodObject)
	const defaultProps =
		"shape" in schema && schema.shape
			? getDefaultProps(schema as never)
			: {};

	// Note: the destructured `defaultChildren` from componentDef below
	// shadows nothing because we renamed the raw value to
	// `defaultChildrenRaw`. The final, normalized value is
	// `resolvedDefaultChildren`.
	const defaultChildrenRaw = componentDef.defaultChildren;

	let resolvedDefaultChildren: ComponentLayer["children"];
	if (typeof defaultChildrenRaw === "string") {
		resolvedDefaultChildren = defaultChildrenRaw;
	} else if (Array.isArray(defaultChildrenRaw)) {
		resolvedDefaultChildren = defaultChildrenRaw.map((child) =>
			duplicateWithNewIdsAndName(child, false)
		);
	} else if (defaultChildrenRaw === undefined) {
		resolvedDefaultChildren = [];
	} else {
		// VariableReference
		resolvedDefaultChildren = defaultChildrenRaw;
	}

	const initialProps = Object.entries(defaultProps).reduce<
		Record<string, PropValue>
	>((acc, [key, propDef]) => {
		if (key !== "children") {
			acc[key] = propDef as PropValue;
		}
		return acc;
	}, {});

	const newLayer: ComponentLayer = {
		id: id ?? createId(),
		type: layerType,
		name: name ?? layerType,
		props: initialProps,
		children: resolvedDefaultChildren,
	};

	if (applyVariableBindings) {
		const defaultVariableBindings =
			componentDef.defaultVariableBindings ?? [];

		for (const binding of defaultVariableBindings) {
			const variable = variables.find((v) => v.id === binding.variableId);
			if (variable) {
				newLayer.props[binding.propName] = {
					__variableRef: binding.variableId,
				} satisfies VariableReference;
			}
		}
	}

	return newLayer;
};

/* ------------------------------------------------------------------ */
/* Move / reorder                                                      */
/* ------------------------------------------------------------------ */

/**
 * Moves a layer from one position to another in the layer tree.
 */
export const moveLayer = (
	layers: ComponentLayer[],
	sourceLayerId: string,
	targetParentId: string,
	targetPosition: number
): ComponentLayer[] => {
	let layerToMove: ComponentLayer | null = null;

	const findLayerAndParent = (
		layers: ComponentLayer[],
		parentId: string | null = null
	): boolean => {
		for (let i = 0; i < layers.length; i += 1) {
			const layer = layers[i];
			if (!layer) continue;
			if (layer.id === sourceLayerId) {
				layerToMove = layer;
				// `parentId` and index `i` are intentionally discarded:
				// the removal pass below re-walks the tree, so capturing
				// them here would be dead state.
				void parentId;
				void i;
				return true;
			}
			if (
				hasLayerChildren(layer) &&
				layer.children &&
				findLayerAndParent(layer.children, layer.id)
			) {
				return true;
			}
		}
		return false;
	};

	findLayerAndParent(layers);

	if (!layerToMove) {
		console.warn(`Source layer with ID ${sourceLayerId} not found`);
		return layers;
	}

	const layersWithoutSource = layers.map((page) =>
		visitLayer(page, null, (layer) => {
			if (hasLayerChildren(layer)) {
				const updatedChildren = layer.children.filter(
					(child) => child.id !== sourceLayerId
				);
				return { ...layer, children: updatedChildren };
			}
			return layer;
		})
	);

	const updatedLayers = addLayer(
		layersWithoutSource,
		layerToMove,
		targetParentId,
		targetPosition
	);

	return updatedLayers;
};

/* ------------------------------------------------------------------ */
/* Schema helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Checks if a layer can accept children.
 */
export const canLayerAcceptChildren = (
	layer: ComponentLayer,
	componentRegistry: ComponentRegistry
): boolean => {
	const componentDef =
		componentRegistry[layer.type as keyof typeof componentRegistry];
	if (!componentDef) return false;

	const hasChildrenField =
		"shape" in componentDef.schema &&
		componentDef.schema.shape &&
		componentDef.schema.shape.children !== undefined;

	return hasChildrenField && hasLayerChildren(layer);
};
