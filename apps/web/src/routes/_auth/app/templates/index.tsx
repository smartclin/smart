// src/routes/_auth/app/templates/index.tsx

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@smart/ui/components/alert-dialog";
import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@smart/ui/components/dropdown-menu";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import { Skeleton } from "@smart/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@smart/ui/components/tabs";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Clock,
	Copy,
	ExternalLink,
	Eye,
	Layers,
	MoreVertical,
	Pencil,
	Plus,
	Search,
	Sparkles,
	Trash2,
	Variable as VariableIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateTemplate, useDeleteTemplate } from "@/hooks/use-mutations";
import {
	allBlocks,
	TEMPLATE_CATEGORIES,
} from "@/lib/ui-builder/registry/index";
import { templateQueryOptions, useTemplates } from "@/queries/templates";

export const Route = createFileRoute("/_auth/app/templates/")({
	loader: ({ context: { queryClient } }) =>
		queryClient.query(templateQueryOptions.list()),
	component: TemplatesIndexPage,
});

function TemplatesIndexPage() {
	const navigate = useNavigate();
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [showNewDialog, setShowNewDialog] = useState(false);
	const [newTemplateName, setNewTemplateName] = useState("");
	const [newTemplateCategory, setNewTemplateCategory] =
		useState("clinical-notes");
	const [newTemplateDescription, setNewTemplateDescription] = useState("");
	const [templateToDelete, setTemplateToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const {
		data: templates = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useTemplates();
	const createTemplate = useCreateTemplate();
	const deleteTemplate = useDeleteTemplate();

	// Filtered templates
	const filteredTemplates = useMemo(
		() =>
			templates.filter((template) => {
				const matchesCategory =
					selectedCategory === "all" ||
					template.category === selectedCategory;
				const matchesSearch =
					searchQuery.trim() === "" ||
					template.name
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					template.description
						?.toLowerCase()
						.includes(searchQuery.toLowerCase());
				return matchesCategory && matchesSearch;
			}),
		[templates, selectedCategory, searchQuery]
	);

	// Blocks grouped by category
	const blocksList = useMemo(
		() =>
			Object.entries(allBlocks).map(([key, block]) => ({
				key,
				...block,
			})),
		[]
	);

	const filteredBlocks = useMemo(() => {
		if (selectedCategory === "all") return blocksList;
		return blocksList.filter((b) => b.category === selectedCategory);
	}, [blocksList, selectedCategory]);

	const handleCreateNew = async () => {
		if (!newTemplateName.trim()) {
			toast.error("Please enter a template name");
			return;
		}

		try {
			const initialLayer = {
				id: crypto.randomUUID(),
				type: "div",
				props: {
					className: "p-8 max-w-5xl mx-auto space-y-6",
				},
				children: [],
			};

			const created = await createTemplate.mutateAsync({
				name: newTemplateName.trim(),
				category: newTemplateCategory,
				description:
					newTemplateDescription.trim() ||
					`Template for ${newTemplateName.trim()}`,
				layers: [initialLayer],
				variables: [],
			});

			setShowNewDialog(false);
			setNewTemplateName("");
			setNewTemplateDescription("");

			navigate({
				to: "/app/templates/$id/edit",
				params: { id: created.id },
			});
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to create template"
			);
		}
	};

	const handleDelete = async () => {
		if (!templateToDelete) return;
		try {
			await deleteTemplate.mutateAsync({ id: templateToDelete.id });
			setTemplateToDelete(null);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to delete template"
			);
		}
	};

	const handleDuplicate = async (template: (typeof templates)[number]) => {
		try {
			const duplicated = await createTemplate.mutateAsync({
				name: `${template.name} (Copy)`,
				category: template.category,
				description: template.description,
				layers: template.layers,
				variables: template.variables,
			});
			navigate({
				to: "/app/templates/$id",
				params: { id: duplicated.id },
			});
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to duplicate template"
			);
		}
	};

	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
			{/* Top Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="font-bold text-3xl text-foreground tracking-tight">
							Templates Studio
						</h1>
						<Badge
							className="font-mono text-xs"
							variant="secondary"
						>
							{templates.length} saved
						</Badge>
					</div>
					<p className="mt-1 text-muted-foreground text-sm">
						Create, design, and manage clinical note layouts,
						patient portals, and dynamic clinic forms.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						onClick={() => setShowNewDialog(true)}
						variant="outline"
					>
						<Plus className="mr-2 size-4" />
						Quick Template
					</Button>
					<Button
						render={
							<Link to="/app/templates/new">
								<Sparkles className="mr-2 size-4" />
								Open Studio Builder
							</Link>
						}
					/>
				</div>
			</div>

			{/* Search & Categories Bar */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="relative max-w-sm flex-1">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search templates by name or description…"
						value={searchQuery}
					/>
				</div>

				<Tabs
					onValueChange={setSelectedCategory}
					value={selectedCategory}
				>
					<TabsList className="h-9">
						<TabsTrigger
							className="text-xs"
							value="all"
						>
							All Categories
						</TabsTrigger>
						{TEMPLATE_CATEGORIES.map((cat) => {
							const Icon = cat.icon;
							return (
								<TabsTrigger
									className="gap-1.5 text-xs"
									key={cat.id}
									value={cat.id}
								>
									<Icon className="size-3.5" />
									{cat.label}
								</TabsTrigger>
							);
						})}
					</TabsList>
				</Tabs>
			</div>

			{/* Saved Templates Section */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-foreground text-lg">
						Saved Clinic Templates
					</h2>
					<span className="text-muted-foreground text-xs">
						Showing {filteredTemplates.length} of {templates.length}
					</span>
				</div>

				{isLoading ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Card
								className="p-6"
								key={`skeleton-${i}`}
							>
								<div className="space-y-3">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
									<div className="flex gap-2 pt-4">
										<Skeleton className="h-9 flex-1" />
										<Skeleton className="h-9 w-10" />
									</div>
								</div>
							</Card>
						))}
					</div>
				) : isError ? (
					<Card className="border-destructive/30 p-8 text-center">
						<p className="font-medium text-destructive text-sm">
							{error instanceof Error
								? error.message
								: "Failed to load templates."}
						</p>
						<Button
							className="mt-4"
							onClick={() => refetch()}
							size="sm"
							variant="outline"
						>
							Retry
						</Button>
					</Card>
				) : filteredTemplates.length === 0 ? (
					<Card className="border-dashed p-12 text-center">
						<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
							<Layers className="size-6 text-muted-foreground" />
						</div>
						<h3 className="mt-4 font-semibold text-base">
							No templates found
						</h3>
						<p className="mt-1 text-muted-foreground text-sm">
							{searchQuery
								? `No templates matched "${searchQuery}". Try a different keyword.`
								: "No templates exist in this category yet. Create one or choose a starter block below!"}
						</p>
						<Button
							className="mt-6"
							onClick={() => setShowNewDialog(true)}
						>
							<Plus className="mr-2 size-4" />
							Create First Template
						</Button>
					</Card>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredTemplates.map((template) => {
							const categoryConfig = TEMPLATE_CATEGORIES.find(
								(c) => c.id === template.category
							);
							const CategoryIcon = categoryConfig?.icon ?? Layers;
							const layerCount = Array.isArray(template.layers)
								? template.layers.length
								: 0;
							const varCount = Array.isArray(template.variables)
								? template.variables.length
								: 0;

							return (
								<Card
									className="group flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-md"
									key={template.id}
								>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between gap-2">
											<Badge
												className="gap-1 font-normal text-xs"
												variant="outline"
											>
												<CategoryIcon className="size-3 text-primary" />
												{categoryConfig?.label ??
													template.category}
											</Badge>

											<DropdownMenu>
												<DropdownMenuTrigger
													nativeButton={false}
													render={
														<Button
															className="size-8 p-0"
															size="icon"
															variant="ghost"
														>
															<MoreVertical className="size-4" />
															<span className="sr-only">
																Actions
															</span>
														</Button>
													}
												/>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() =>
															navigate({
																to: "/app/templates/$id",
																params: {
																	id: template.id,
																},
															})
														}
													>
														<Eye className="mr-2 size-4" />
														View Details & Preview
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															navigate({
																to: "/app/templates/$id/edit",
																params: {
																	id: template.id,
																},
															})
														}
													>
														<Pencil className="mr-2 size-4" />
														Edit in Studio
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															handleDuplicate(
																template
															)
														}
													>
														<Copy className="mr-2 size-4" />
														Duplicate
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onClick={() =>
															setTemplateToDelete(
																{
																	id: template.id,
																	name: template.name,
																}
															)
														}
													>
														<Trash2 className="mr-2 size-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										<CardTitle className="line-clamp-1 text-lg group-hover:text-primary">
											<Link
												params={{ id: template.id }}
												to="/app/templates/$id"
											>
												{template.name}
											</Link>
										</CardTitle>
										<CardDescription className="line-clamp-2 min-h-10 text-xs">
											{template.description ||
												"No description provided."}
										</CardDescription>
									</CardHeader>

									<CardContent className="pb-3">
										<div className="flex items-center gap-3 text-muted-foreground text-xs">
											<span className="flex items-center gap-1">
												<Layers className="size-3.5" />
												{layerCount} component
												{layerCount === 1 ? "" : "s"}
											</span>
											{varCount > 0 && (
												<span className="flex items-center gap-1 font-mono text-primary">
													<VariableIcon className="size-3.5" />
													{varCount} var
													{varCount === 1 ? "" : "s"}
												</span>
											)}
										</div>
									</CardContent>

									<CardFooter className="flex items-center justify-between border-t bg-muted/20 pt-3">
										<div className="flex items-center gap-1 text-muted-foreground text-xs">
											<Clock className="size-3.5" />
											<span>
												Updated{" "}
												{new Date(
													template.updatedAt
												).toLocaleDateString()}
											</span>
										</div>

										<div className="flex items-center gap-2">
											<Button
												render={
													<Link
														params={{
															id: template.id,
														}}
														to="/app/templates/$id"
													>
														Preview
													</Link>
												}
												size="sm"
												variant="ghost"
											/>
											<Button
												render={
													<Link
														params={{
															id: template.id,
														}}
														to="/app/templates/$id/edit"
													>
														<Pencil className="mr-1 size-3.5" />
														Edit
													</Link>
												}
												size="sm"
												variant="outline"
											/>
										</div>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				)}
			</section>

			{/* Starter Pre-built Blocks Section */}
			<section className="space-y-4 pt-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-foreground text-lg">
							Starter Pre-Built Blocks
						</h2>
						<p className="text-muted-foreground text-xs">
							Accelerate template creation with production-ready
							clinical and pediatric UI patterns.
						</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredBlocks.map((block) => (
						<Card
							className="flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-sm"
							key={block.key}
						>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<Badge
										className="text-xs capitalize"
										variant="secondary"
									>
										{block.category.replace(/-/g, " ")}
									</Badge>
									<span className="text-muted-foreground text-xs">
										{block.requiredComponents?.length ?? 0}{" "}
										parts
									</span>
								</div>
								<CardTitle className="text-base capitalize">
									{block.name.replace(/-/g, " ")}
								</CardTitle>
								<CardDescription className="text-xs">
									{block.description}
								</CardDescription>
							</CardHeader>

							<CardFooter className="pt-2">
								<Button
									className="w-full"
									render={
										<Link
											search={{ block: block.key }}
											to="/app/templates/new"
										>
											<ExternalLink className="mr-2 size-3.5" />
											Create from this block
										</Link>
									}
									size="sm"
									variant="outline"
								/>
							</CardFooter>
						</Card>
					))}
				</div>
			</section>

			{/* Quick New Template Dialog */}
			<Dialog
				onOpenChange={setShowNewDialog}
				open={showNewDialog}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Create New Template</DialogTitle>
						<DialogDescription>
							Provide basic info to initialize your template in
							the studio.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label htmlFor="template-name">Template Name</Label>
							<Input
								id="template-name"
								onChange={(e) =>
									setNewTemplateName(e.target.value)
								}
								placeholder="e.g., 18-Month Pediatric Well-Check"
								value={newTemplateName}
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="category">Category</Label>
							<Select
								onValueChange={(val) => {
									if (val) setNewTemplateCategory(val);
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

						<div className="space-y-1.5">
							<Label htmlFor="template-desc">
								Description (Optional)
							</Label>
							<Input
								id="template-desc"
								onChange={(e) =>
									setNewTemplateDescription(e.target.value)
								}
								placeholder="Brief summary of template purpose"
								value={newTemplateDescription}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							onClick={() => setShowNewDialog(false)}
							variant="outline"
						>
							Cancel
						</Button>
						<Button
							disabled={
								createTemplate.isPending ||
								!newTemplateName.trim()
							}
							onClick={handleCreateNew}
						>
							{createTemplate.isPending
								? "Creating…"
								: "Create & Edit in Studio"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Alert */}
			<AlertDialog
				onOpenChange={(open) => !open && setTemplateToDelete(null)}
				open={Boolean(templateToDelete)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Template?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "
							{templateToDelete?.name}"? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteTemplate.isPending}
							onClick={handleDelete}
						>
							{deleteTemplate.isPending
								? "Deleting…"
								: "Delete Template"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
