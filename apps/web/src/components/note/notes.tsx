import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
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
import UIBuilder from "@smart/ui/components/ui-builder";
import type {
	ComponentLayer,
	ComponentRegistry,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import { FileText, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import { clinicalComponentDefinitions } from "@/lib/ui-builder/registry/clinical-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";

// Combined registry with all clinical components
const clinicComponentRegistry: ComponentRegistry = {
	...primitiveComponentDefinitions,
	...complexComponentDefinitions,
	...shadcnComponentDefinitions,
	...clinicalComponentDefinitions,
};

interface NoteTemplate {
	appointmentType: string;
	createdAt: string;
	description: string;
	id: string;
	layers: ComponentLayer[];
	name: string;
	updatedAt: string;
	variables: Variable[];
}

const APPOINTMENT_TYPES = [
	{ value: "well-child", label: "Well-Child Visit" },
	{ value: "sick-visit", label: "Sick Visit" },
	{ value: "2-year-checkup", label: "2-Year Checkup" },
	{ value: "ear-infection", label: "Ear Infection Visit" },
	{ value: "asthma-followup", label: "Asthma Follow-up" },
	{ value: "adhd-followup", label: "ADHD Follow-up" },
	{ value: "immunization", label: "Immunization Visit" },
	{ value: "sports-physical", label: "Sports Physical" },
];

export default function NoteTemplatesPage() {
	const [templates, setTemplates] = useState<NoteTemplate[]>([]);
	const [selectedTemplate, setSelectedTemplate] =
		useState<NoteTemplate | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [showNewDialog, setShowNewDialog] = useState(false);
	const [newTemplateName, setNewTemplateName] = useState("");
	const [newTemplateType, setNewTemplateType] = useState("well-child");
	const [currentLayers, setCurrentLayers] = useState<ComponentLayer[]>([]);
	const [currentVariables, setCurrentVariables] = useState<Variable[]>([]);

	// Load templates
	useEffect(() => {
		async function loadTemplates() {
			try {
				const response = await fetch("/api/note-templates");
				if (response.ok) {
					const data = await response.json();
					setTemplates(data);
				}
			} catch (error) {
				console.error("Failed to load templates:", error);
				toast.error("Failed to load templates");
			} finally {
				setIsLoading(false);
			}
		}
		loadTemplates();
	}, []);

	// Handle layer changes
	const handleLayersChange = useCallback((layers: ComponentLayer[]) => {
		setCurrentLayers(layers);
	}, []);

	// Handle variable changes
	const handleVariablesChange = useCallback((variables: Variable[]) => {
		setCurrentVariables(variables);
	}, []);

	// Save current template
	const handleSave = useCallback(async () => {
		if (!selectedTemplate) return;

		setIsSaving(true);
		try {
			const updatedTemplate: NoteTemplate = {
				...selectedTemplate,
				layers: currentLayers,
				variables: currentVariables,
				updatedAt: new Date().toISOString(),
			};

			const response = await fetch(
				`/api/note-templates/${selectedTemplate.id}`,
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

	// Create new template
	const handleCreateTemplate = useCallback(async () => {
		if (!newTemplateName.trim()) {
			toast.error("Please enter a template name");
			return;
		}

		try {
			const newTemplate = {
				name: newTemplateName,
				appointmentType: newTemplateType,
				description: "",
				layers: [
					{
						id: crypto.randomUUID(),
						type: "div",
						name: "Page",
						props: {
							className: "p-6 max-w-4xl mx-auto space-y-6",
						},
						children: [],
					},
				],
				variables: [],
			};

			const response = await fetch("/api/note-templates", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newTemplate),
			});

			if (!response.ok) throw new Error("Failed to create");

			const created = await response.json();
			setTemplates((prev) => [...prev, created]);
			setSelectedTemplate(created);
			setShowNewDialog(false);
			setNewTemplateName("");
			toast.success("Template created successfully");
		} catch (error) {
			console.error("Failed to create template:", error);
			toast.error("Failed to create template");
		}
	}, [newTemplateName, newTemplateType]);

	// Delete template
	const handleDelete = useCallback(
		async (templateId: string) => {
			try {
				const response = await fetch(
					`/api/note-templates/${templateId}`,
					{
						method: "DELETE",
					}
				);

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
	const handleSelectTemplate = useCallback((template: NoteTemplate) => {
		setSelectedTemplate(template);
		setCurrentLayers(template.layers);
		setCurrentVariables(template.variables);
	}, []);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Template list view
	if (!selectedTemplate) {
		return (
			<div className="mx-auto max-w-4xl space-y-6 p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-2xl">Note Templates</h1>
						<p className="text-muted-foreground">
							Create and manage clinical note templates for your
							clinic
						</p>
					</div>
					<Button onClick={() => setShowNewDialog(true)}>
						<Plus className="mr-2 h-4 w-4" />
						New Template
					</Button>
				</div>

				{templates.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold">
								No templates yet
							</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								Create your first note template to get started
							</p>
							<Button onClick={() => setShowNewDialog(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Create Template
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{templates.map((template) => (
							<Card
								className="cursor-pointer transition-shadow hover:shadow-md"
								key={template.id}
								onClick={() => handleSelectTemplate(template)}
							>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<CardTitle className="text-base">
											{template.name}
										</CardTitle>
										<Button
											onClick={(e) => {
												e.stopPropagation();
												handleDelete(template.id);
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
										{APPOINTMENT_TYPES.find(
											(t) =>
												t.value ===
												template.appointmentType
										)?.label || template.appointmentType}
									</Badge>
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
				)}

				{/* New Template Dialog */}
				<Dialog
					onOpenChange={setShowNewDialog}
					open={showNewDialog}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Template</DialogTitle>
							<DialogDescription>
								Create a new clinical note template for your
								clinic
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="template-name">
									Template Name
								</Label>
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
								<Label htmlFor="appointment-type">
									Appointment Type
								</Label>
								<Select
									onValueChange={(value) => {
										if (value !== null) {
											setNewTemplateType(value);
										}
									}}
									value={newTemplateType}
								>
									<SelectTrigger id="appointment-type">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{APPOINTMENT_TYPES.map((type) => (
											<SelectItem
												key={type.value}
												value={type.value}
											>
												{type.label}
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
							<Button onClick={handleCreateTemplate}>
								Create
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	// Template editor view
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
								APPOINTMENT_TYPES.find(
									(t) =>
										t.value ===
										selectedTemplate.appointmentType
								)?.label
							}
						</p>
					</div>
				</div>
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

			{/* UI Builder */}
			<div className="flex-1">
				<UIBuilder
					blocks={blockDefinitions}
					componentRegistry={clinicComponentRegistry}
					initialLayers={selectedTemplate.layers}
					initialVariables={selectedTemplate.variables}
					onChange={handleLayersChange}
					onVariablesChange={handleVariablesChange}
					persistLayerStore={false}
					showExport={false}
				/>
			</div>
		</div>
	);
}
