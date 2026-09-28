import type {
	BlockRegistry,
	ComponentLayer,
	ComponentRegistry,
	FunctionDefinition,
	FunctionRegistry,
	PageTypeCodeGenerator,
	PageTypeCodeGenerators,
	PageTypeRenderer,
	PageTypeRenderers,
	RegistryEntry,
} from "@smart/ui/components/ui-builder/types";
import type { ComponentType as ReactComponentType } from "react";
import { create, type StateCreator } from "zustand";

/**
 * Clipboard state for copy/cut/paste operations
 */
export interface ClipboardState {
	isCut: boolean;
	layer: ComponentLayer | null;
	sourceLayerId: string | null;
}

/**
 * Context menu state for right-click menus
 */
export interface ContextMenuState {
	layerId: string | null;
	open: boolean;
	x: number;
	y: number;
}

export interface EditorStoreInitializeOptions {
	blocks?: BlockRegistry;
	functionRegistry?: FunctionRegistry;
	pageTypeCodeGenerators?: PageTypeCodeGenerators;
	pageTypeRenderers?: PageTypeRenderers;
}

export interface EditorStore {
	allowPagesCreation: boolean;
	allowPagesDeletion: boolean;
	allowVariableEditing: boolean;
	blocks: BlockRegistry | undefined;
	clearClipboard: () => void;

	// Clipboard state for copy/cut/paste
	clipboard: ClipboardState;
	closeContextMenu: () => void;

	// Context menu state for right-click menus
	contextMenu: ContextMenuState;
	functionRegistry: FunctionRegistry | undefined;
	getComponentDefinition: (
		type: string
		// biome-ignore lint/suspicious/noExplicitAny: <ok>
	) => RegistryEntry<ReactComponentType<any>> | undefined;
	/** Returns the registry filtered by the active page type's filterRegistry hook, if any. */
	getFilteredRegistry: (pageType?: string) => ComponentRegistry;
	getFunctionDefinition: (id: string) => FunctionDefinition | undefined;
	getPageTypeCodeGenerator: (
		pageType: string
	) => PageTypeCodeGenerator | undefined;
	getPageTypeRenderer: (pageType: string) => PageTypeRenderer | undefined;
	incrementRevision: () => void;

	initialize: (
		registry: ComponentRegistry,
		persistLayerStoreConfig: boolean,
		allowPagesCreation: boolean,
		allowPagesDeletion: boolean,
		allowVariableEditing: boolean,
		options?: EditorStoreInitializeOptions
	) => void;
	openContextMenu: (x: number, y: number, layerId: string) => void;
	pageTypeCodeGenerators: PageTypeCodeGenerators;
	pageTypeRenderers: PageTypeRenderers;

	persistLayerStoreConfig: boolean;
	previewMode: "mobile" | "tablet" | "desktop" | "responsive";

	registry: ComponentRegistry;

	// Revision counter to track state changes for form revalidation
	revisionCounter: number;
	setAllowPagesCreation: (allow: boolean) => void;
	setAllowPagesDeletion: (allow: boolean) => void;
	setAllowVariableEditing: (allow: boolean) => void;
	setClipboard: (clipboard: ClipboardState) => void;
	setPersistLayerStoreConfig: (shouldPersist: boolean) => void;
	setPreviewMode: (
		mode: "mobile" | "tablet" | "desktop" | "responsive"
	) => void;
	setShowLeftPanel: (show: boolean) => void;
	setShowRightPanel: (show: boolean) => void;

	// Panel visibility state
	showLeftPanel: boolean;
	showRightPanel: boolean;
}

const store: StateCreator<EditorStore, [], []> = (set, get) => ({
	previewMode: "responsive",
	setPreviewMode: (mode) => set({ previewMode: mode }),

	registry: {},
	blocks: undefined,
	functionRegistry: undefined,
	pageTypeRenderers: {},
	pageTypeCodeGenerators: {},

	initialize: (
		registry,
		persistLayerStoreConfig,
		allowPagesCreation,
		allowPagesDeletion,
		allowVariableEditing,
		options
	) => {
		const {
			blocks,
			functionRegistry,
			pageTypeRenderers = {},
			pageTypeCodeGenerators = {},
		} = options ?? {};
		set((state) => ({
			...state,
			registry,
			persistLayerStoreConfig,
			allowPagesCreation,
			allowPagesDeletion,
			allowVariableEditing,
			blocks,
			functionRegistry,
			pageTypeRenderers,
			pageTypeCodeGenerators,
		}));
	},
	getComponentDefinition: (type: string) => {
		const { registry } = get();
		if (!registry) {
			console.warn(
				"Registry accessed via editor store before initialization."
			);
			return undefined;
		}
		return registry[type];
	},
	getFunctionDefinition: (id: string) => {
		const { functionRegistry } = get();
		if (!functionRegistry) {
			return undefined;
		}
		return functionRegistry[id];
	},
	getPageTypeRenderer: (pageType: string) => {
		const { pageTypeRenderers } = get();
		return pageTypeRenderers[pageType];
	},
	getPageTypeCodeGenerator: (pageType: string) => {
		const { pageTypeCodeGenerators } = get();
		return pageTypeCodeGenerators[pageType];
	},
	getFilteredRegistry: (pageType?: string) => {
		const { registry, pageTypeRenderers } = get();
		if (!pageType) return registry;
		const renderer = pageTypeRenderers[pageType];
		if (!renderer?.filterRegistry) return registry;
		return renderer.filterRegistry(registry);
	},

	persistLayerStoreConfig: true,
	setPersistLayerStoreConfig: (shouldPersist) =>
		set({ persistLayerStoreConfig: shouldPersist }),

	revisionCounter: 0,
	incrementRevision: () =>
		set((state) => ({ revisionCounter: state.revisionCounter + 1 })),

	allowPagesCreation: true,
	setAllowPagesCreation: (allow) => set({ allowPagesCreation: allow }),
	allowPagesDeletion: true,
	setAllowPagesDeletion: (allow) => set({ allowPagesDeletion: allow }),
	allowVariableEditing: true,
	setAllowVariableEditing: (allow) => set({ allowVariableEditing: allow }),

	// Panel visibility state
	showLeftPanel: true,
	setShowLeftPanel: (show) => set({ showLeftPanel: show }),
	showRightPanel: true,
	setShowRightPanel: (show) => set({ showRightPanel: show }),

	// Clipboard state for copy/cut/paste
	clipboard: {
		layer: null,
		isCut: false,
		sourceLayerId: null,
	},
	setClipboard: (clipboard) => set({ clipboard }),
	clearClipboard: () =>
		set({
			clipboard: {
				layer: null,
				isCut: false,
				sourceLayerId: null,
			},
		}),

	// Context menu state for right-click menus
	contextMenu: {
		open: false,
		x: 0,
		y: 0,
		layerId: null,
	},
	openContextMenu: (x, y, layerId) =>
		set({
			contextMenu: {
				open: true,
				x,
				y,
				layerId,
			},
		}),
	closeContextMenu: () =>
		set({
			contextMenu: {
				open: false,
				x: 0,
				y: 0,
				layerId: null,
			},
		}),
});

export const useEditorStore = create<EditorStore>()(store);
