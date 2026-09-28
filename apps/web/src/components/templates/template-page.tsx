import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@smart/ui/components/dialog";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@smart/ui/components/tabs";
import UIBuilder from "@smart/ui/components/ui-builder";
import LayerRenderer from "@smart/ui/components/ui-builder/layer-renderer";
import type {
	ComponentLayer,
	ComponentRegistry,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import {
	Eye,
	FileText,
	Heart,
	Layout,
	Loader2,
	Plus,
	Save,
	Stethoscope,
	Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import { clinicalBlockDefinitions } from "@/lib/ui-builder/registry/clinical-block-definitions";
import { clinicalComponentDefinitions } from "@/lib/ui-builder/registry/clinical-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";

// Combined registry with ALL components
const fullRegistry: ComponentRegistry = {
	...primitiveComponentDefinitions,
	...complexComponentDefinitions,
	...shadcnComponentDefinitions,
	...clinicalComponentDefinitions,
};

// Merged blocks - both clinical and standard
const allBlocks = {
	...blockDefinitions,
	...clinicalBlockDefinitions,
};

// Template categories with icons
const TEMPLATE_CATEGORIES = [
	{
		id: "clinical-notes",
		label: "Clinical Notes",
		icon: Stethoscope,
		description: "Templates for patient encounters",
	},
	{
		id: "patient-pages",
		label: "Patient Pages",
		icon: Heart,
		description: "Patient-facing pages and dashboards",
	},
	{
		id: "marketing",
		label: "Marketing Pages",
		icon: Layout,
		description: "Public-facing clinic pages",
	},
	{
		id: "forms",
		label: "Forms",
		icon: FileText,
		description: "Intake and consent forms",
	},
];

interface Template {
	category: string;
	createdAt: string;
	description: string;
	id: string;
	layers: ComponentLayer[];
	name: string;
	updatedAt: string;
	variables: Variable[];
}

function TemplatesPage() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
		null
	);
	const [selectedCategory, setSelectedCategory] = useState("clinical-notes");
	const [isSaving, setIsSaving] = useState(false);
	const [showNewDialog, setShowNewDialog] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [newTemplateName, setNewTemplateName] = useState("");
	const [newTemplateCategory, setNewTemplateCategory] =
		useState("clinical-notes");
	const [currentLayers, setCurrentLayers] = useState<ComponentLayer[]>([]);
	const [currentVariables, setCurrentVariables] = useState<Variable[]>([]);

	// Handle layer changes from UI Builder
	const handleLayersChange = useCallback((layers: ComponentLayer[]) => {
		setCurrentLayers(layers);
	}, []);

	// Handle variable changes from UI Builder
	const handleVariablesChange = useCallback((variables: Variable[]) => {
		setCurrentVariables(variables);
	}, []);

	// Save current template
	const handleSave = useCallback(async () => {
		if (!selectedTemplate) return;

		setIsSaving(true);
		try {
			const updatedTemplate: Template = {
				...selectedTemplate,
				layers: currentLayers,
				variables: currentVariables,
				updatedAt: new Date().toISOString(),
			};

			// Save to your API
			const response = await fetch(
				`/api/templates/${selectedTemplate.id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updatedTemplate),
				}
			);

			if (!response.ok) throw new Error("Failed to save");

			const saved = await response.json();
			setTemplates((prev) =>
				prev.map((t) => (t.id === saved.id ? saved : t))
			);
			setSelectedTemplate(saved);
			toast.success("Template saved successfully");
		} catch (error) {
			console.error("Failed to save template:", error);
			toast.error("Failed to save template");
		} finally {
			setIsSaving(false);
		}
	}, [selectedTemplate, currentLayers, currentVariables]);

	// Create new template from a block or blank
	const handleCreateTemplate = useCallback(
		async (blockName?: string) => {
			if (!newTemplateName.trim()) {
				toast.error("Please enter a template name");
				return;
			}

			const block = blockName ? allBlocks[blockName] : null;
			const initialLayers = block
				? [block.template]
				: [
						{
							id: crypto.randomUUID(),
							type: "div",
							name: "Page",
							props: {
								className: "p-6 max-w-4xl mx-auto space-y-6",
							},
							children: [],
						},
					];

			try {
				const newTemplate: Omit<
					Template,
					"id" | "createdAt" | "updatedAt"
				> = {
					name: newTemplateName,
					category: newTemplateCategory,
					description: block?.description ?? "",
					layers: initialLayers,
					variables: [],
				};

				const response = await fetch("/api/templates", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newTemplate),
				});

				if (!response.ok) throw new Error("Failed to create");

				const created = await response.json();
				setTemplates((prev) => [...prev, created]);
				setSelectedTemplate(created);
				setCurrentLayers(created.layers);
				setCurrentVariables(created.variables);
				setShowNewDialog(false);
				setNewTemplateName("");
				toast.success("Template created successfully");
			} catch (error) {
				console.error("Failed to create template:", error);
				toast.error("Failed to create template");
			}
		},
		[newTemplateName, newTemplateCategory]
	);

	// Delete template
	const handleDelete = useCallback(
		async (templateId: string) => {
			try {
				const response = await fetch(`/api/templates/${templateId}`, {
					method: "DELETE",
				});

				if (!response.ok) throw new Error("Failed to delete");

				setTemplates((prev) => prev.filter((t) => t.id !== templateId));
				if (selectedTemplate?.id === templateId) {
					setSelectedTemplate(null);
				}
				toast.success("Template deleted");
			} catch (error) {
				console.error("Failed to delete template:", error);
				toast.error("Failed to delete template");
			}
		},
		[selectedTemplate]
	);

	// Select template for editing
	const handleSelectTemplate = useCallback((template: Template) => {
		setSelectedTemplate(template);
		setCurrentLayers(template.layers);
		setCurrentVariables(template.variables);
	}, []);

	// Get blocks by category
	const blocksByCategory = useMemo(
		() =>
			Object.values(allBlocks).reduce(
				(acc, block) => {
					if (!acc[block.category]) acc[block.category] = [];
					acc[block.category]!.push(block);
					return acc;
				},
				{} as Record<string, (typeof allBlocks)[string][]>
			),
		[]
	);

	// Template editor view
	if (selectedTemplate) {
		return (
			<div className="flex h-screen flex-col">
				{/* Header */}
				<div className="flex items-center justify-between border-b bg-background px-4 py-2">
					<div className="flex items-center gap-4">
						<Button
							onClick={() => setSelectedTemplate(null)}
							variant="ghost"
						>
							← Back
						</Button>
						<div>
							<h2 className="font-semibold">
								{selectedTemplate.name}
							</h2>
							<p className="text-muted-foreground text-xs">
								{
									TEMPLATE_CATEGORIES.find(
										(c) =>
											c.id === selectedTemplate.category
									)?.label
								}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							onClick={() => setShowPreview(true)}
							variant="outline"
						>
							<Eye className="mr-2 h-4 w-4" />
							Preview
						</Button>
						<Button
							disabled={isSaving}
							onClick={handleSave}
						>
							{isSaving ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Save Template
						</Button>
					</div>
				</div>

				{/* UI Builder */}
				<div className="flex-1">
					<UIBuilder
						blocks={allBlocks}
						componentRegistry={fullRegistry}
						initialLayers={selectedTemplate.layers}
						initialVariables={selectedTemplate.variables}
						onChange={handleLayersChange}
						onVariablesChange={handleVariablesChange}
						persistLayerStore={false}
						showExport={false}
					/>
				</div>

				{/* Preview Dialog */}
				<Dialog
					onOpenChange={setShowPreview}
					open={showPreview}
				>
					<DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
						<DialogHeader>
							<DialogTitle>Template Preview</DialogTitle>
							<DialogDescription>
								This is how the template will render in
								production.
							</DialogDescription>
						</DialogHeader>
						<div className="rounded-lg border p-4">
							<LayerRenderer
								componentRegistry={fullRegistry}
								page={
									currentLayers[0] ??
									selectedTemplate.layers[0]!
								}
								variables={currentVariables}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	// Template list view
	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Page Templates</h1>
					<p className="text-muted-foreground">
						Create and manage UI templates for your pediatric clinic
					</p>
				</div>
				<Button onClick={() => setShowNewDialog(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Template
				</Button>
			</div>

			{/* Category Tabs */}
			<Tabs
				defaultValue="clinical-notes"
				onValueChange={setSelectedCategory}
				value={selectedCategory}
			>
				<TabsList>
					{TEMPLATE_CATEGORIES.map((cat) => {
						const Icon = cat.icon;
						return (
							<TabsTrigger
								className="gap-2"
								key={cat.id}
								value={cat.id}
							>
								<Icon className="h-4 w-4" />
								{cat.label}
							</TabsTrigger>
						);
					})}
				</TabsList>

				{TEMPLATE_CATEGORIES.map((cat) => (
					<TabsContent
						className="space-y-6"
						key={cat.id}
						value={cat.id}
					>
						{/* Block Templates */}
						<div>
							<h3 className="mb-3 font-semibold">
								Start from a template
							</h3>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{(blocksByCategory[cat.id] ?? []).map(
									(block) => (
										<Card
											className="cursor-pointer transition-shadow hover:shadow-md"
											key={block.name}
											onClick={() => {
												setNewTemplateName(
													block.name.replace(
														/-/g,
														" "
													)
												);
												setNewTemplateCategory(cat.id);
												setShowNewDialog(true);
											}}
										>
											<CardHeader className="pb-2">
												<CardTitle className="text-base capitalize">
													{block.name.replace(
														/-/g,
														" "
													)}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<CardDescription>
													{block.description}
												</CardDescription>
												<div className="mt-3 flex flex-wrap gap-1">
													{block.requiredComponents
														?.slice(0, 3)
														.map((comp) => (
															<Badge
																className="text-xs"
																key={comp}
																variant="secondary"
															>
																{comp}
															</Badge>
														))}
													{(block.requiredComponents
														?.length ?? 0) > 3 && (
														<Badge
															className="text-xs"
															variant="outline"
														>
															+
															{(block
																.requiredComponents
																?.length ?? 0) -
																3}{" "}
															more
														</Badge>
													)}
												</div>
											</CardContent>
										</Card>
									)
								)}
							</div>
						</div>

						{/* Saved Templates */}
						{templates.filter((t) => t.category === cat.id).length >
							0 && (
							<div>
								<h3 className="mb-3 font-semibold">
									Your saved templates
								</h3>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{templates
										.filter((t) => t.category === cat.id)
										.map((template) => (
											<Card
												className="cursor-pointer transition-shadow hover:shadow-md"
												key={template.id}
												onClick={() =>
													handleSelectTemplate(
														template
													)
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
																handleDelete(
																	template.id
																);
															}}
															size="icon-sm"
															variant="ghost"
														>
															<Trash2 className="h-4 w-4 text-destructive" />
														</Button>
													</div>
												</CardHeader>
												<CardContent>
													<CardDescription>
														{template.description ||
															"No description"}
													</CardDescription>
													<p className="mt-2 text-muted-foreground text-xs">
														Updated{" "}
														{new Date(
															template.updatedAt
														).toLocaleDateString()}
													</p>
												</CardContent>
											</Card>
										))}
								</div>
							</div>
						)}
					</TabsContent>
				))}
			</Tabs>

			{/* New Template Dialog */}
			<Dialog
				onOpenChange={setShowNewDialog}
				open={showNewDialog}
			>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Create New Template</DialogTitle>
						<DialogDescription>
							Start with a blank page or choose a pre-built
							template.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="template-name">Template Name</Label>
							<Input
								id="template-name"
								onChange={(e) =>
									setNewTemplateName(e.target.value)
								}
								placeholder="e.g., 2-Year Well-Child Visit"
								value={newTemplateName}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select
								onValueChange={(value) => {
									if (value !== null)
										setNewTemplateCategory(value);
								}}
								value={newTemplateCategory}
							>
								<SelectTrigger id="category">
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
						</div>
					</div>
					<DialogFooter>
						<Button
							onClick={() => setShowNewDialog(false)}
							variant="outline"
						>
							Cancel
						</Button>
						<Button onClick={() => handleCreateTemplate()}>
							Create Blank Template
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
export default TemplatesPage;
