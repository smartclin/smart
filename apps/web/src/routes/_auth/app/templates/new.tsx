// src/routes/_auth/app/templates/new.tsx

import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@smart/ui/components/dialog";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@smart/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import UIBuilder from "@smart/ui/components/ui-builder";
import LayerRenderer from "@smart/ui/components/ui-builder/layer-renderer";
import type {
	ComponentLayer,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Eye,
	LayoutTemplate,
	Loader2,
	Save,
	Settings2,
	Sparkles,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateTemplate } from "@/hooks/use-mutations";
import {
	allBlocks,
	fullRegistry,
	TEMPLATE_CATEGORIES,
	toApiVariables,
} from "@/lib/ui-builder/registry/index";

export const Route = createFileRoute("/_auth/app/templates/new")({
	validateSearch: (search: Record<string, unknown>): { block?: string } => ({
		block: typeof search.block === "string" ? search.block : undefined,
	}),
	component: NewTemplatePage,
});

function NewTemplatePage() {
	const navigate = useNavigate();
	const { block: initialBlockKey } = Route.useSearch();
	const createTemplate = useCreateTemplate();

	const selectedStarterBlock = useMemo(() => {
		if (initialBlockKey && initialBlockKey in allBlocks) {
			return allBlocks[initialBlockKey as keyof typeof allBlocks];
		}
		return null;
	}, [initialBlockKey]);

	const [name, setName] = useState<string>(() => {
		if (selectedStarterBlock) {
			return selectedStarterBlock.name
				.replace(/-/g, " ")
				.replace(/\b\w/g, (c) => c.toUpperCase());
		}
		return "New Clinical Template";
	});

	const [category, setCategory] = useState<string>(
		() => selectedStarterBlock?.category ?? "clinical-notes"
	);

	const [description, setDescription] = useState<string>(
		() =>
			selectedStarterBlock?.description ??
			"Custom clinical UI template created in studio."
	);

	const defaultBlankLayer: ComponentLayer = useMemo(
		() => ({
			id: crypto.randomUUID(),
			type: "div",
			name: "Page Container",
			props: {
				className:
					"p-8 max-w-5xl mx-auto space-y-6 bg-background min-h-screen",
			},
			children: [],
		}),
		[]
	);

	const initialLayers: ComponentLayer[] = useMemo(() => {
		if (selectedStarterBlock?.template) {
			return [
				JSON.parse(
					JSON.stringify(selectedStarterBlock.template)
				) as ComponentLayer,
			];
		}
		return [defaultBlankLayer];
	}, [selectedStarterBlock, defaultBlankLayer]);

	const [currentLayers, setCurrentLayers] =
		useState<ComponentLayer[]>(initialLayers);
	const [currentVariables, setCurrentVariables] = useState<Variable[]>([]);
	const [showPreview, setShowPreview] = useState(false);

	const handleLayersChange = useCallback((layers: ComponentLayer[]) => {
		setCurrentLayers(layers);
	}, []);

	const handleVariablesChange = useCallback((variables: Variable[]) => {
		setCurrentVariables(variables);
	}, []);

	const handleSave = async () => {
		if (!name.trim()) {
			toast.error("Please specify a template name");
			return;
		}

		try {
			const created = await createTemplate.mutateAsync({
				name: name.trim(),
				category,
				description: description.trim(),
				layers: currentLayers,
				variables: toApiVariables(currentVariables),
			});

			toast.success("Template created successfully!");
			navigate({
				to: "/app/templates/$id",
				params: { id: created.id },
			});
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to save template"
			);
		}
	};

	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
			{/* Studio Top Navbar */}
			<header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm">
				<div className="flex items-center gap-3">
					<Button
						className="size-8 p-0"
						render={
							<Link to="/app/templates">
								<ArrowLeft className="size-4" />
							</Link>
						}
						size="icon"
						variant="ghost"
					/>

					<div className="flex items-center gap-2">
						<Input
							className="h-8 w-64 font-semibold text-sm focus-visible:ring-1"
							onChange={(e) => setName(e.target.value)}
							placeholder="Template name…"
							value={name}
						/>

						<Select
							onValueChange={(val) => {
								if (val) setCategory(val);
							}}
							value={category}
						>
							<SelectTrigger className="h-8 w-40 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TEMPLATE_CATEGORIES.map((cat) => (
									<SelectItem
										key={cat.id}
										value={cat.id}
									>
										{cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{selectedStarterBlock && (
							<Badge
								className="gap-1 text-xs"
								variant="secondary"
							>
								<Sparkles className="size-3" />
								From Block: {selectedStarterBlock.name}
							</Badge>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Popover>
						<PopoverTrigger
							nativeButton={false}
							render={
								<Button
									size="sm"
									variant="outline"
								>
									<Settings2 className="mr-1.5 size-3.5" />
									Details
								</Button>
							}
						/>
						<PopoverContent
							align="end"
							className="w-80 space-y-3"
						>
							<div className="space-y-1">
								<h4 className="font-semibold text-sm">
									Template Metadata
								</h4>
								<p className="text-muted-foreground text-xs">
									Configure how this template appears in the
									clinic library.
								</p>
							</div>
							<div className="space-y-2">
								<Label
									className="text-xs"
									htmlFor="new-desc"
								>
									Description
								</Label>
								<Input
									id="new-desc"
									onChange={(e) =>
										setDescription(e.target.value)
									}
									placeholder="Describe what this template is used for"
									value={description}
								/>
							</div>
						</PopoverContent>
					</Popover>

					<Button
						onClick={() => setShowPreview(true)}
						size="sm"
						variant="outline"
					>
						<Eye className="mr-1.5 size-3.5" />
						Preview
					</Button>

					<Button
						disabled={createTemplate.isPending || !name.trim()}
						onClick={handleSave}
						size="sm"
					>
						{createTemplate.isPending ? (
							<Loader2 className="mr-1.5 size-3.5 animate-spin" />
						) : (
							<Save className="mr-1.5 size-3.5" />
						)}
						Save Template
					</Button>
				</div>
			</header>

			{/* UI Builder Workspace */}
			<div className="flex-1 overflow-hidden">
				<UIBuilder
					allowPagesCreation={true}
					allowPagesDeletion={true}
					allowVariableEditing={true}
					blocks={allBlocks}
					componentRegistry={fullRegistry}
					initialLayers={initialLayers}
					initialVariables={currentVariables}
					onChange={handleLayersChange}
					onVariablesChange={handleVariablesChange}
					persistLayerStore={false}
					showExport={true}
				/>
			</div>

			{/* Preview Dialog */}
			<Dialog
				onOpenChange={setShowPreview}
				open={showPreview}
			>
				<DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<LayoutTemplate className="size-5 text-primary" />
							{name} — Live Preview
						</DialogTitle>
						<DialogDescription>
							Interactive preview of the template rendered with
							its component tree and default variables.
						</DialogDescription>
					</DialogHeader>

					<div className="rounded-xl border bg-card p-6 shadow-inner">
						{currentLayers[0] ? (
							<LayerRenderer
								componentRegistry={fullRegistry}
								page={currentLayers[0]}
								variables={currentVariables}
							/>
						) : (
							<p className="text-muted-foreground text-sm">
								No layers to render.
							</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
