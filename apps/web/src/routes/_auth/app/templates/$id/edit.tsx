// src/routes/_auth/app/templates/$id.edit.tsx

import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import { Card, CardContent } from "@smart/ui/components/card";
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
import { Skeleton } from "@smart/ui/components/skeleton";
import UIBuilder from "@smart/ui/components/ui-builder";
import LayerRenderer from "@smart/ui/components/ui-builder/layer-renderer";
import type {
	ComponentLayer,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Check,
	Eye,
	LayoutTemplate,
	Loader2,
	Save,
	Settings2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdateTemplate } from "@/hooks/use-mutations";
import {
	allBlocks,
	fullRegistry,
	TEMPLATE_CATEGORIES,
	toApiVariables,
	toUiVariables,
} from "@/lib/ui-builder/registry/index";
import { templateQueryOptions, useTemplate } from "@/queries/templates";

export const Route = createFileRoute("/_auth/app/templates/$id/edit")({
	loader: ({ params, context: { queryClient } }) =>
		queryClient.query(templateQueryOptions.detail(params.id)),
	component: EditTemplateStudioPage,
});

function EditTemplateStudioPage() {
	const { id } = Route.useParams();
	const { data: template, isLoading, isError, error } = useTemplate(id);
	const updateTemplate = useUpdateTemplate();

	const [name, setName] = useState("");
	const [category, setCategory] = useState("clinical-notes");
	const [description, setDescription] = useState("");
	const [layers, setLayers] = useState<ComponentLayer[]>([]);
	const [variables, setVariables] = useState<Variable[]>([]);
	const [isDirty, setIsDirty] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Sync local state when template loads
	useEffect(() => {
		if (template && !isInitialized) {
			setName(template.name);
			setCategory(template.category);
			setDescription(template.description ?? "");
			setLayers(template.layers as unknown as ComponentLayer[]);
			setVariables(toUiVariables(template.variables));
			setIsInitialized(true);
		}
	}, [template, isInitialized]);

	const handleLayersChange = useCallback((newLayers: ComponentLayer[]) => {
		setLayers(newLayers);
		setIsDirty(true);
	}, []);

	const handleVariablesChange = useCallback((newVars: Variable[]) => {
		setVariables(newVars);
		setIsDirty(true);
	}, []);

	const handleSave = async () => {
		if (!name.trim()) {
			toast.error("Template name cannot be empty");
			return;
		}

		try {
			await updateTemplate.mutateAsync({
				id,
				data: {
					name: name.trim(),
					category,
					description: description.trim(),
					layers,
					variables: toApiVariables(variables),
				},
			});

			setIsDirty(false);
			toast.success("Template saved successfully");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to save template"
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-4rem)] flex-col space-y-4 p-6">
				<div className="flex items-center justify-between border-b pb-4">
					<Skeleton className="h-9 w-64" />
					<div className="flex gap-2">
						<Skeleton className="h-9 w-24" />
						<Skeleton className="h-9 w-32" />
					</div>
				</div>
				<Skeleton className="flex-1 rounded-xl" />
			</div>
		);
	}

	if (isError || !template) {
		return (
			<div className="mx-auto max-w-2xl py-16">
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<AlertCircle className="mb-3 size-12 text-destructive" />
						<h3 className="font-semibold text-foreground text-lg">
							Template Not Found
						</h3>
						<p className="mt-1 max-w-md text-muted-foreground text-sm">
							{error instanceof Error
								? error.message
								: "The template you are trying to edit could not be found."}
						</p>
						<Button
							className="mt-6"
							render={
								<Link to="/app/templates">
									Back to Templates
								</Link>
							}
						/>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
			{/* Studio Top Navbar */}
			<header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm">
				<div className="flex items-center gap-3">
					<Button
						className="size-8 p-0"
						render={
							<Link
								params={{ id }}
								to="/app/templates/$id"
							>
								<ArrowLeft className="size-4" />
							</Link>
						}
						size="icon"
						variant="ghost"
					/>

					<div className="flex items-center gap-2">
						<Input
							className="h-8 w-60 font-semibold text-sm focus-visible:ring-1"
							onChange={(e) => {
								setName(e.target.value);
								setIsDirty(true);
							}}
							placeholder="Template name…"
							value={name}
						/>

						<Select
							onValueChange={(val) => {
								if (val) {
									setCategory(val);
									setIsDirty(true);
								}
							}}
							value={category}
						>
							<SelectTrigger className="h-8 w-36 text-xs">
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

						{isDirty ? (
							<Badge
								className="font-normal text-[10px]"
								variant="outline"
							>
								Unsaved changes
							</Badge>
						) : (
							<Badge
								className="gap-1 font-normal text-[10px] text-emerald-600"
								variant="outline"
							>
								<Check className="size-3" />
								Saved
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
									Template Details
								</h4>
								<p className="text-muted-foreground text-xs">
									Update description and categorization.
								</p>
							</div>
							<div className="space-y-2">
								<Label
									className="text-xs"
									htmlFor="edit-desc"
								>
									Description
								</Label>
								<Input
									id="edit-desc"
									onChange={(e) => {
										setDescription(e.target.value);
										setIsDirty(true);
									}}
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
						disabled={updateTemplate.isPending || !name.trim()}
						onClick={handleSave}
						size="sm"
					>
						{updateTemplate.isPending ? (
							<Loader2 className="mr-1.5 size-3.5 animate-spin" />
						) : (
							<Save className="mr-1.5 size-3.5" />
						)}
						Save Changes
					</Button>
				</div>
			</header>

			{/* UI Builder Workspace */}
			<div className="flex-1 overflow-hidden">
				{template.layers && (
					<UIBuilder
						allowPagesCreation={true}
						allowPagesDeletion={true}
						allowVariableEditing={true}
						blocks={allBlocks}
						componentRegistry={fullRegistry}
						initialLayers={
							template.layers as unknown as ComponentLayer[]
						}
						initialVariables={toUiVariables(template.variables)}
						onChange={handleLayersChange}
						onVariablesChange={handleVariablesChange}
						persistLayerStore={false}
						showExport={true}
					/>
				)}
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
							Preview of template as rendered with current canvas
							state.
						</DialogDescription>
					</DialogHeader>

					<div className="rounded-xl border bg-card p-6 shadow-inner">
						{layers[0] ? (
							<LayerRenderer
								componentRegistry={fullRegistry}
								page={layers[0]}
								variables={variables}
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
