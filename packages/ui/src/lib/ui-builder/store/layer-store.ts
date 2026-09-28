import type {
	ComponentLayer,
	PropValue,
	Variable,
	VariableValueType,
} from "@smart/ui/components/ui-builder/types";
import { isVariableReference } from "@smart/ui/components/ui-builder/types";
import isDeepEqual from "fast-deep-equal";
import { produce } from "immer";
import { temporal } from "zundo";
import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useEditorStore } from "../store/editor-store";
import {
	addLayer,
	countLayers,
	createComponentLayer,
	createId,
	duplicateWithNewIdsAndName,
	findAllParentLayersRecursive,
	findLayerRecursive,
	hasLayerChildren,
	migrateV1ToV2,
	migrateV2ToV3,
	migrateV5ToV6,
	moveLayer,
	visitLayer,
} from "../store/layer-utils";
import { getDefaultProps } from "../store/schema-utils";

const DEFAULT_PAGE_PROPS = {
	className:
		"h-screen p-4 flex flex-col gap-2 bg-background overflow-y-scroll",
};

/**
 * Minimal shape of a ZodObject-like schema. Used by the variable-removal
 * cleanup pass below; we only need `.shape` to test for the presence of
 * a defaulted field.
 */
interface SchemaWithShape {
	shape?: Record<string, unknown>;
}

/**
 * Narrow a component registry schema to the shape-bearing subset.
 * Returns `undefined` when the schema doesn't have a `shape` property.
 */
function asSchemaWithShape(schema: unknown): SchemaWithShape | undefined {
	if (schema && typeof schema === "object" && "shape" in schema) {
		return schema as SchemaWithShape;
	}
	return undefined;
}

export interface LayerStore {
	addComponentLayer: (
		layerType: string,
		parentId: string,
		parentPosition?: number
	) => void;
	addLayerDirect: (
		layer: ComponentLayer,
		parentId: string,
		parentPosition?: number
	) => void;
	addPageLayer: (
		pageId: string,
		pageType?: string,
		rootLayerType?: string,
		rootLayerProps?: Record<string, unknown>
	) => void;

	addVariable: <T extends VariableValueType>(
		name: string,
		type: T,
		defaultValue: Variable<T>["defaultValue"]
	) => void;
	bindChildrenToVariable: (layerId: string, variableId: string) => void;
	bindPropToVariable: (
		layerId: string,
		propName: string,
		variableId: string
	) => void;
	duplicateLayer: (layerId: string, parentId?: string) => void;
	findLayerById: (layerId: string | null) => ComponentLayer | undefined;
	findLayersForPageId: (pageId: string) => ComponentLayer[];
	immutableBindings: Record<string, Record<string, boolean>>;
	initialize: (
		pages: ComponentLayer[],
		selectedPageId?: string,
		selectedLayerId?: string,
		variables?: Variable[]
	) => void;
	isBindingImmutable: (layerId: string, propName: string) => boolean;
	isChildrenBindingImmutable: (layerId: string) => boolean;
	isLayerAPage: (layerId: string) => boolean;
	moveLayer: (
		sourceLayerId: string,
		targetParentId: string,
		targetPosition: number
	) => void;
	pages: ComponentLayer[];
	removeLayer: (layerId: string) => void;
	removeVariable: (variableId: string) => void;
	selectedLayerId: string | null;
	selectedPageId: string;
	selectLayer: (layerId: string) => void;
	selectPage: (pageId: string) => void;
	setImmutableBinding: (
		layerId: string,
		propName: string,
		isImmutable: boolean
	) => void;
	unbindChildrenFromVariable: (layerId: string) => void;
	unbindPropFromVariable: (layerId: string, propName: string) => void;
	updateLayer: (
		layerId: string,
		newProps: Record<string, PropValue>,
		layerRest?: Partial<Omit<ComponentLayer, "props">>
	) => void;
	updateVariable: (
		variableId: string,
		updates: Partial<Omit<Variable, "id">>
	) => void;
	variables: Variable[];
}

const store: StateCreator<LayerStore, [], []> = (set, get) => ({
	pages: [
		{
			id: "1",
			type: "div",
			name: "Page 1",
			props: DEFAULT_PAGE_PROPS,
			children: [],
		},
	],

	variables: [],
	immutableBindings: {},
	selectedLayerId: null,
	selectedPageId: "1",

	initialize: (
		pages: ComponentLayer[],
		selectedPageId?: string,
		selectedLayerId?: string,
		variables?: Variable[]
	) => {
		set(
			produce((state: LayerStore) => {
				state.pages = pages;
				state.selectedPageId = selectedPageId ?? pages[0]?.id ?? "";
				state.selectedLayerId = selectedLayerId ?? null;
				state.variables = variables ?? [];

				const { registry } = useEditorStore.getState();

				const setupImmutableBindings = (layer: ComponentLayer) => {
					const componentDef = registry[layer.type];
					const defaultVariableBindings =
						componentDef?.defaultVariableBindings ?? [];

					for (const binding of defaultVariableBindings) {
						const propValue = layer.props[binding.propName];

						if (
							isVariableReference(propValue) &&
							propValue.__variableRef === binding.variableId &&
							binding.immutable
						) {
							if (!state.immutableBindings[layer.id]) {
								state.immutableBindings[layer.id] = {};
							}
							const bindings = state.immutableBindings[layer.id]!;
							bindings[binding.propName] = true;
						}
					}

					return layer;
				};

				state.pages = state.pages.map((page) =>
					visitLayer(page, null, setupImmutableBindings)
				);
			})
		);
	},

	findLayerById: (layerId: string | null) => {
		const { selectedPageId, findLayersForPageId, pages } = get();
		if (!layerId) return undefined;
		if (layerId === selectedPageId) {
			return pages.find((page) => page.id === selectedPageId);
		}
		const layers = findLayersForPageId(selectedPageId);
		if (!layers) return undefined;
		return findLayerRecursive(layers, layerId);
	},

	findLayersForPageId: (pageId: string) => {
		const { pages } = get();
		const page = pages.find((p) => p.id === pageId);
		if (page && hasLayerChildren(page)) {
			return page.children;
		}
		return [];
	},

	isLayerAPage: (layerId: string) => {
		const { pages } = get();
		return pages.some((page) => page.id === layerId);
	},

	addComponentLayer: (
		layerType: string,
		parentId: string,
		parentPosition?: number
	) =>
		set(
			produce((state: LayerStore) => {
				const { registry } = useEditorStore.getState();

				const newLayer = createComponentLayer(layerType, registry, {
					applyVariableBindings: true,
					variables: state.variables,
				});

				const registryEntry = registry[layerType];
				const defaultVariableBindings =
					registryEntry?.defaultVariableBindings ?? [];
				for (const binding of defaultVariableBindings) {
					const variable = state.variables.find(
						(v) => v.id === binding.variableId
					);
					if (variable && binding.immutable) {
						if (!state.immutableBindings[newLayer.id]) {
							state.immutableBindings[newLayer.id] = {};
						}
						const bindings = state.immutableBindings[newLayer.id]!;
						bindings[binding.propName] = true;
					}
				}

				state.pages = addLayer(
					state.pages,
					newLayer,
					parentId,
					parentPosition
				);
				state.selectedLayerId = newLayer.id;
			})
		),

	addLayerDirect: (
		layer: ComponentLayer,
		parentId: string,
		parentPosition?: number
	) =>
		set(
			produce((state: LayerStore) => {
				state.pages = addLayer(
					state.pages,
					layer,
					parentId,
					parentPosition
				);
				state.selectedLayerId = layer.id;
			})
		),

	addPageLayer: (
		pageName: string,
		pageType?: string,
		rootLayerType?: string,
		rootLayerProps?: Record<string, unknown>
	) =>
		set(
			produce((state: LayerStore) => {
				const trimmedPageName = pageName.trim();
				if (!trimmedPageName) {
					return;
				}

				const isDefaultRoot =
					rootLayerType === undefined || rootLayerType === "div";

				const newPage: ComponentLayer = {
					id: createId(),
					type: rootLayerType ?? "div",
					name: trimmedPageName,
					...(pageType === undefined ? {} : { pageType }),
					props: (rootLayerProps ??
						(isDefaultRoot
							? DEFAULT_PAGE_PROPS
							: {})) as ComponentLayer["props"],
					children: [],
				};

				return {
					pages: [...state.pages, newPage],
					selectedPageId: newPage.id,
					selectedLayerId: newPage.id,
				};
			})
		),

	duplicateLayer: (layerId: string) =>
		set(
			produce((state: LayerStore) => {
				let layerToDuplicate: ComponentLayer | undefined;
				let parentId: string | undefined;
				let parentPosition: number | undefined;

				for (const page of state.pages) {
					visitLayer(page, null, (layer, parent) => {
						if (layer.id === layerId) {
							layerToDuplicate = layer;
							parentId = parent?.id;
							if (parent && hasLayerChildren(parent)) {
								parentPosition =
									parent.children.indexOf(layer) + 1;
							}
						}
						return layer;
					});
					if (layerToDuplicate) break;
				}

				if (!layerToDuplicate) {
					console.warn(`Layer with ID ${layerId} not found.`);
					return;
				}

				const isNewLayerAPage = state.pages.some(
					(page) => page.id === layerId
				);

				const newLayer = duplicateWithNewIdsAndName(
					layerToDuplicate,
					true
				);

				if (isNewLayerAPage) {
					return {
						...state,
						pages: [...state.pages, newLayer],
						selectedPageId: newLayer.id,
					};
				}

				return {
					...state,
					pages: addLayer(
						state.pages,
						newLayer,
						parentId,
						parentPosition
					),
				};
			})
		),

	removeLayer: (layerId: string) =>
		set(
			produce((state: LayerStore) => {
				const { selectedLayerId, pages } = get();

				let newSelectedLayerId = selectedLayerId;

				const isPage = state.pages.some((page) => page.id === layerId);
				if (isPage && pages.length > 1) {
					const newPages = state.pages.filter(
						(page) => page.id !== layerId
					);
					const firstPage = newPages[0];
					return {
						...state,
						pages: newPages,
						selectedPageId: firstPage?.id ?? "",
					};
				}

				const updatedPages = pages.map((page) =>
					visitLayer(page, null, (layer) => {
						if (hasLayerChildren(layer)) {
							const updatedChildren = layer.children.filter(
								(child) => child.id !== layerId
							);
							return { ...layer, children: updatedChildren };
						}
						return layer;
					})
				);

				if (selectedLayerId === layerId) {
					newSelectedLayerId = null;
				}

				return {
					...state,
					selectedLayerId: newSelectedLayerId,
					pages: updatedPages,
				};
			})
		),

	updateLayer: (
		layerId: string,
		newProps: ComponentLayer["props"],
		layerRest?: Partial<Omit<ComponentLayer, "props">>
	) =>
		set(
			produce((state: LayerStore) => {
				const { selectedPageId, findLayersForPageId, pages } = get();

				const pageExists = pages.some(
					(page) => page.id === selectedPageId
				);
				if (!pageExists) {
					console.warn(
						`No layers found for page ID: ${selectedPageId}`
					);
					return state;
				}

				if (layerId === selectedPageId) {
					const updatedPages = pages.map((page) =>
						page.id === selectedPageId
							? {
									...page,
									props: { ...page.props, ...newProps },
									...(layerRest ?? {}),
								}
							: page
					);
					return { ...state, pages: updatedPages };
				}

				const layers = findLayersForPageId(selectedPageId);

				const visitor = (layer: ComponentLayer): ComponentLayer => {
					if (layer.id === layerId) {
						return {
							...layer,
							...(layerRest ?? {}),
							props: { ...layer.props, ...newProps },
						} as ComponentLayer;
					}
					return layer;
				};

				const updatedLayers = layers.map((layer) =>
					visitLayer(layer, null, visitor)
				);

				const isUnchanged = updatedLayers.every(
					(layer, index) => layer === layers[index]
				);

				if (isUnchanged) {
					console.warn(`Layer with ID ${layerId} was not found.`);
					return state;
				}

				const updatedPages = state.pages.map((page) =>
					page.id === selectedPageId
						? { ...page, children: updatedLayers }
						: page
				);

				return { ...state, pages: updatedPages };
			})
		),

	selectLayer: (layerId: string) =>
		set(
			produce((state: LayerStore) => {
				const { selectedPageId, findLayersForPageId } = get();
				if (selectedPageId === layerId) {
					return { selectedLayerId: layerId };
				}
				const layers = findLayersForPageId(selectedPageId);
				if (!layers) return state;
				const layer = findLayerRecursive(layers, layerId);
				if (layer) {
					return { selectedLayerId: layer.id };
				}
				return {};
			})
		),

	selectPage: (pageId: string) =>
		set(
			produce((state: LayerStore) => {
				const page = state.pages.find((p) => p.id === pageId);
				if (!page) return state;
				return { selectedPageId: pageId };
			})
		),

	addVariable: (name, type, defaultValue) =>
		set(
			produce((state: LayerStore) => {
				state.variables.push({
					id: createId(),
					name,
					type,
					defaultValue,
				});
			})
		),

	updateVariable: (variableId, updates) =>
		set(
			produce((state: LayerStore) => {
				const v = state.variables.find((v) => v.id === variableId);
				if (v) Object.assign(v, updates);
			})
		),

	removeVariable: (variableId) =>
		set(
			produce((state: LayerStore) => {
				state.variables = state.variables.filter(
					(v) => v.id !== variableId
				);

				const { registry } = useEditorStore.getState();

				const cleanVariableReferences = (
					layer: ComponentLayer
				): ComponentLayer => {
					const updatedProps: Record<string, PropValue> = {
						...layer.props,
					};
					let hasChanges = false;
					let updatedChildren = layer.children;

					for (const [propName, propValue] of Object.entries(
						updatedProps
					)) {
						if (
							!isVariableReference(propValue) ||
							propValue.__variableRef !== variableId
						) {
							continue;
						}

						const layerSchema = asSchemaWithShape(
							registry[layer.type]?.schema
						);

						if (layerSchema?.shape?.[propName] === undefined) {
							delete updatedProps[propName];
							hasChanges = true;
						} else {
							const defaultProps = getDefaultProps(
								registry[layer.type]?.schema as never
							);
							updatedProps[propName] = defaultProps[
								propName
							] as PropValue;
							hasChanges = true;
						}
					}

					if (
						isVariableReference(layer.children) &&
						layer.children.__variableRef === variableId
					) {
						updatedChildren = "";
						hasChanges = true;
					}

					if (hasChanges) {
						return {
							...layer,
							props: updatedProps,
							children: updatedChildren,
						};
					}
					return layer;
				};

				state.pages = state.pages.map((page) =>
					visitLayer(page, null, cleanVariableReferences)
				);
			})
		),

	bindPropToVariable: (layerId, propName, variableId) => {
		get().updateLayer(layerId, {
			[propName]: { __variableRef: variableId },
			[`__function_${propName}`]: undefined,
		});
	},

	unbindPropFromVariable: (layerId, propName) => {
		if (get().isBindingImmutable(layerId, propName)) {
			console.warn(
				`Cannot unbind immutable variable binding for ${propName} on layer ${layerId}`
			);
			return;
		}

		const { registry } = useEditorStore.getState();
		const layer = get().findLayerById(layerId);

		if (!layer) {
			console.warn(`Layer with ID ${layerId} not found.`);
			return;
		}

		const layerSchema = asSchemaWithShape(registry[layer.type]?.schema);
		let defaultValue: PropValue = "";

		if (layerSchema?.shape?.[propName] !== undefined) {
			const defaultProps = getDefaultProps(
				registry[layer.type]?.schema as never
			);
			const candidate = defaultProps[propName];
			if (candidate !== undefined) {
				defaultValue = candidate as PropValue;
			}
		}

		get().updateLayer(layerId, { [propName]: defaultValue });
	},

	bindChildrenToVariable: (layerId, variableId) => {
		get().updateLayer(
			layerId,
			{},
			{ children: { __variableRef: variableId } }
		);
	},

	unbindChildrenFromVariable: (layerId) => {
		if (get().isChildrenBindingImmutable(layerId)) {
			console.warn(
				`Cannot unbind immutable children variable binding on layer ${layerId}`
			);
			return;
		}

		const layer = get().findLayerById(layerId);

		if (!layer) {
			console.warn(`Layer with ID ${layerId} not found.`);
			return;
		}

		get().updateLayer(layerId, {}, { children: "" });
	},

	isBindingImmutable: (layerId: string, propName: string) => {
		const { immutableBindings } = get();
		return immutableBindings[layerId]?.[propName] === true;
	},

	isChildrenBindingImmutable: (layerId: string) => {
		const { immutableBindings } = get();
		return immutableBindings[layerId]?.["__children__"] === true;
	},

	setImmutableBinding: (
		layerId: string,
		propName: string,
		isImmutable: boolean
	) => {
		set(
			produce((state: LayerStore) => {
				if (!state.immutableBindings[layerId]) {
					state.immutableBindings[layerId] = {};
				}
				const bindings = state.immutableBindings[layerId]!;
				bindings[propName] = isImmutable;
			})
		);
	},

	moveLayer: (
		sourceLayerId: string,
		targetParentId: string,
		targetPosition: number
	) => {
		set(
			produce((state: LayerStore) => {
				state.pages = moveLayer(
					state.pages,
					sourceLayerId,
					targetParentId,
					targetPosition
				);
			})
		);
	},
});

const conditionalLocalStorage = {
	getItem: (name: string): Promise<string | null> => {
		const { persistLayerStoreConfig } = useEditorStore.getState();
		if (!persistLayerStoreConfig) return Promise.resolve(null);
		return Promise.resolve(localStorage.getItem(name));
	},
	setItem: (name: string, value: string): Promise<void> => {
		const { persistLayerStoreConfig } = useEditorStore.getState();
		if (!persistLayerStoreConfig) return Promise.resolve();
		localStorage.setItem(name, value);
		return Promise.resolve();
	},
	removeItem: (name: string): Promise<void> => {
		const { persistLayerStoreConfig } = useEditorStore.getState();
		if (!persistLayerStoreConfig) return Promise.resolve();
		localStorage.removeItem(name);
		return Promise.resolve();
	},
};

const useLayerStore = create(
	persist(
		temporal<LayerStore>(store, {
			equality: (pastState, currentState) =>
				isDeepEqual(pastState, currentState),
		}),
		{
			name: "layer-store",
			version: 6,
			storage: createJSONStorage(() => conditionalLocalStorage),
			migrate: (persistedState: unknown, version: number) => {
				let state = persistedState as LayerStore;

				if (version < 2) state = migrateV1ToV2(state);
				if (version < 3) state = migrateV2ToV3(state);
				if (version < 4) {
					state = {
						...state,
						variables: [] as Variable[],
						immutableBindings: {},
					};
				}
				if (version < 5) {
					state = { ...state, immutableBindings: {} };
				}
				if (version < 6) state = migrateV5ToV6(state);

				return state;
			},
		}
	)
);

export { countLayers, findAllParentLayersRecursive, useLayerStore };
