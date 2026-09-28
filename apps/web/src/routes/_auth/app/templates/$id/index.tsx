// src/routes/_auth/app/templates/$id.tsx

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
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
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
import { Switch } from "@smart/ui/components/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@smart/ui/components/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@smart/ui/components/tabs";
import LayerRenderer from "@smart/ui/components/ui-builder/layer-renderer";
import type {
	ComponentLayer,
	PropValue,
} from "@smart/ui/components/ui-builder/types";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Check,
	Code,
	Copy,
	Download,
	Eye,
	Layers,
	Monitor,
	Pencil,
	Smartphone,
	Tablet,
	Trash2,
	Variable as VariableIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateTemplate, useDeleteTemplate } from "@/hooks/use-mutations";
import {
	fullRegistry,
	TEMPLATE_CATEGORIES,
	toUiVariables,
} from "@/lib/ui-builder/registry/index";
import { templateQueryOptions, useTemplate } from "@/queries/templates";

export const Route = createFileRoute("/_auth/app/templates/$id/")({
	loader: ({ params, context: { queryClient } }) =>
		queryClient.query(templateQueryOptions.detail(params.id)),
	component: TemplateDetailPage,
});

function TemplateDetailPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const {
		data: template,
		isLoading,
		isError,
		error,
		refetch,
	} = useTemplate(id);
	const createTemplate = useCreateTemplate();
	const deleteTemplate = useDeleteTemplate();

	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const [activeTab, setActiveTab] = useState("preview");
	const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
		"desktop"
	);
	const [variableValues, setVariableValues] = useState<
		Record<string, PropValue>
	>({});
	const [hasCopied, setHasCopied] = useState(false);

	const categoryConfig = useMemo(() => {
		if (!template) return null;
		return TEMPLATE_CATEGORIES.find((c) => c.id === template.category);
	}, [template]);

	const rootLayer = useMemo<ComponentLayer | null>(() => {
		if (!template?.layers || template.layers.length === 0) return null;
		return template.layers[0] as unknown as ComponentLayer;
	}, [template]);

	// Initialize variable defaults
	const handleVariableChange = (name: string, value: PropValue) => {
		setVariableValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleDelete = async () => {
		try {
			await deleteTemplate.mutateAsync({ id });
			navigate({ to: "/app/templates" });
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to delete template"
			);
		}
	};

	const handleDuplicate = async () => {
		if (!template) return;
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

	const handleCopyJson = () => {
		if (!template) return;
		navigator.clipboard.writeText(JSON.stringify(template, null, 2));
		setHasCopied(true);
		toast.success("Template JSON copied to clipboard");
		setTimeout(() => setHasCopied(false), 2000);
	};

	const handleDownloadJson = () => {
		if (!template) return;
		const blob = new Blob([JSON.stringify(template, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-6xl space-y-6 p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-10 rounded-lg" />
					<div className="space-y-2">
						<Skeleton className="h-6 w-60" />
						<Skeleton className="h-4 w-40" />
					</div>
				</div>
				<Skeleton className="h-[500px] w-full rounded-xl" />
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
								: "The requested template could not be found or has been removed."}
						</p>
						<div className="mt-6 flex gap-3">
							<Button
								onClick={() => refetch()}
								variant="outline"
							>
								Retry
							</Button>
							<Button
								render={
									<Link to="/app/templates">
										Back to Templates
									</Link>
								}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
			{/* Top Bar Header */}
			<div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1.5">
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
						<Badge
							className="gap-1 font-normal text-xs"
							variant="secondary"
						>
							{categoryConfig?.label ?? template.category}
						</Badge>
						<h1 className="font-bold text-2xl text-foreground tracking-tight md:text-3xl">
							{template.name}
						</h1>
					</div>

					<p className="max-w-2xl pl-11 text-muted-foreground text-sm">
						{template.description || "No description provided."}
					</p>

					<div className="flex items-center gap-4 pl-11 text-muted-foreground text-xs">
						<span className="flex items-center gap-1">
							<Calendar className="size-3.5" />
							Updated{" "}
							{new Date(template.updatedAt).toLocaleDateString()}
						</span>
						<span className="flex items-center gap-1">
							<Layers className="size-3.5" />
							{template.layers.length} component
							{template.layers.length === 1 ? "" : "s"}
						</span>
						<span className="flex items-center gap-1">
							<VariableIcon className="size-3.5" />
							{template.variables.length} variable
							{template.variables.length === 1 ? "" : "s"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 pl-11 md:pl-0">
					<Button
						onClick={handleDuplicate}
						size="sm"
						variant="outline"
					>
						<Copy className="mr-1.5 size-3.5" />
						Duplicate
					</Button>

					<Button
						onClick={() => setShowDeleteAlert(true)}
						size="sm"
						variant="outline"
					>
						<Trash2 className="mr-1.5 size-3.5 text-destructive" />
						Delete
					</Button>

					<Button
						render={
							<Link
								params={{ id: template.id }}
								to="/app/templates/$id/edit"
							>
								<Pencil className="mr-1.5 size-3.5" />
								Edit in Studio
							</Link>
						}
						size="sm"
					/>
				</div>
			</div>

			{/* Tabs Section */}
			<Tabs
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<TabsList>
						<TabsTrigger
							className="gap-1.5"
							value="preview"
						>
							<Eye className="size-3.5" />
							Live Preview
						</TabsTrigger>
						<TabsTrigger
							className="gap-1.5"
							value="variables"
						>
							<VariableIcon className="size-3.5" />
							Variables ({template.variables.length})
						</TabsTrigger>
						<TabsTrigger
							className="gap-1.5"
							value="structure"
						>
							<Layers className="size-3.5" />
							Layers Tree
						</TabsTrigger>
						<TabsTrigger
							className="gap-1.5"
							value="json"
						>
							<Code className="size-3.5" />
							JSON Schema
						</TabsTrigger>
					</TabsList>

					{activeTab === "preview" && (
						<div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
							<Button
								className="size-7 p-0"
								onClick={() => setViewport("desktop")}
								size="icon"
								title="Desktop View"
								variant={
									viewport === "desktop" ? "default" : "ghost"
								}
							>
								<Monitor className="size-3.5" />
							</Button>
							<Button
								className="size-7 p-0"
								onClick={() => setViewport("tablet")}
								size="icon"
								title="Tablet View (768px)"
								variant={
									viewport === "tablet" ? "default" : "ghost"
								}
							>
								<Tablet className="size-3.5" />
							</Button>
							<Button
								className="size-7 p-0"
								onClick={() => setViewport("mobile")}
								size="icon"
								title="Mobile View (375px)"
								variant={
									viewport === "mobile" ? "default" : "ghost"
								}
							>
								<Smartphone className="size-3.5" />
							</Button>
						</div>
					)}
				</div>

				{/* 1. LIVE PREVIEW TAB */}
				<TabsContent
					className="mt-6 space-y-6"
					value="preview"
				>
					{/* Interactive Variables Bar if template defines variables */}
					{template.variables.length > 0 && (
						<Card className="bg-muted/30">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 font-medium text-sm">
									<VariableIcon className="size-4 text-primary" />
									Interactive Variables Playground
								</CardTitle>
								<CardDescription className="text-xs">
									Adjust values below to preview how dynamic
									content renders on this template.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{template.variables.map((variable) => {
										const currentValue =
											variableValues[variable.name] ??
											variable.defaultValue ??
											"";

										return (
											<div
												className="space-y-1.5"
												key={variable.name}
											>
												<div className="flex items-center justify-between">
													<Label
														className="font-medium text-xs"
														htmlFor={`var-${variable.name}`}
													>
														{variable.label ||
															variable.name}
													</Label>
													<span className="font-mono text-[10px] text-muted-foreground">
														{variable.type}
													</span>
												</div>

												{variable.type === "boolean" ? (
													<div className="flex items-center gap-2 pt-1">
														<Switch
															checked={Boolean(
																currentValue
															)}
															id={`var-${variable.name}`}
															onCheckedChange={(
																checked
															) =>
																handleVariableChange(
																	variable.name,
																	checked
																)
															}
														/>
														<span className="text-muted-foreground text-xs">
															{currentValue
																? "True"
																: "False"}
														</span>
													</div>
												) : variable.type === "enum" &&
													variable.options ? (
													<Select
														onValueChange={(val) =>
															handleVariableChange(
																variable.name,
																val
															)
														}
														value={String(
															currentValue
														)}
													>
														<SelectTrigger
															className="h-8 text-xs"
															id={`var-${variable.name}`}
														>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{variable.options.map(
																(opt) => (
																	<SelectItem
																		key={
																			opt
																		}
																		value={
																			opt
																		}
																	>
																		{opt}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
												) : (
													<Input
														className="h-8 text-xs"
														id={`var-${variable.name}`}
														onChange={(e) =>
															handleVariableChange(
																variable.name,
																variable.type ===
																	"number"
																	? Number(
																			e
																				.target
																				.value
																		)
																	: e.target
																			.value
															)
														}
														type={
															variable.type ===
															"number"
																? "number"
																: variable.type ===
																		"date"
																	? "date"
																	: "text"
														}
														value={String(
															currentValue
														)}
													/>
												)}
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Viewport Canvas Wrapper */}
					<div className="flex justify-center rounded-xl border bg-muted/20 p-4 transition-all md:p-8">
						<div
							className={`min-h-[500px] w-full rounded-lg border bg-card shadow-sm transition-all ${
								viewport === "mobile"
									? "max-w-[375px]"
									: viewport === "tablet"
										? "max-w-[768px]"
										: "max-w-full"
							}`}
						>
							{rootLayer ? (
								<LayerRenderer
									componentRegistry={fullRegistry}
									page={rootLayer}
									variables={toUiVariables(
										template.variables
									)}
									variableValues={variableValues}
								/>
							) : (
								<div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
									No component layers defined in this
									template.
								</div>
							)}
						</div>
					</div>
				</TabsContent>

				{/* 2. VARIABLES TAB */}
				<TabsContent
					className="mt-6"
					value="variables"
				>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								Declared Template Variables
							</CardTitle>
							<CardDescription className="text-xs">
								Dynamic placeholders configurable in the UI
								Builder that interpolate into component props.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{template.variables.length === 0 ? (
								<p className="py-6 text-center text-muted-foreground text-sm">
									No variables declared for this template.
								</p>
							) : (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>
													Variable Name
												</TableHead>
												<TableHead>Label</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>
													Default Value
												</TableHead>
												<TableHead>Required</TableHead>
												<TableHead>Options</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{template.variables.map((v) => (
												<TableRow key={v.name}>
													<TableCell className="font-mono font-semibold text-primary text-xs">
														{v.name}
													</TableCell>
													<TableCell className="text-xs">
														{v.label}
													</TableCell>
													<TableCell>
														<Badge
															className="font-mono text-[10px]"
															variant="outline"
														>
															{v.type}
														</Badge>
													</TableCell>
													<TableCell className="font-mono text-muted-foreground text-xs">
														{v.defaultValue !==
															undefined &&
														v.defaultValue !== null
															? String(
																	v.defaultValue
																)
															: "—"}
													</TableCell>
													<TableCell className="text-xs">
														{v.required ? (
															<Badge
																className="text-[10px]"
																variant="secondary"
															>
																Yes
															</Badge>
														) : (
															<span className="text-muted-foreground">
																No
															</span>
														)}
													</TableCell>
													<TableCell className="text-xs">
														{v.options &&
														v.options.length > 0 ? (
															<div className="flex flex-wrap gap-1">
																{v.options.map(
																	(opt) => (
																		<Badge
																			className="text-[10px]"
																			key={
																				opt
																			}
																			variant="outline"
																		>
																			{
																				opt
																			}
																		</Badge>
																	)
																)}
															</div>
														) : (
															"—"
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* 3. STRUCTURE / LAYER INSPECTOR TAB */}
				<TabsContent
					className="mt-6"
					value="structure"
				>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								Layer Component Hierarchy
							</CardTitle>
							<CardDescription className="text-xs">
								Component tree generated by the studio builder.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="rounded-lg border bg-muted/10 p-4 font-mono text-xs">
								{template.layers.map((layer) => (
									<LayerTreeNode
										depth={0}
										key={layer.id}
										layer={
											layer as unknown as ComponentLayer
										}
									/>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* 4. JSON SCHEMA TAB */}
				<TabsContent
					className="mt-6"
					value="json"
				>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<div>
								<CardTitle className="text-base">
									Raw JSON Definition
								</CardTitle>
								<CardDescription className="text-xs">
									Complete serialization format stored in the
									database.
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Button
									onClick={handleCopyJson}
									size="sm"
									variant="outline"
								>
									{hasCopied ? (
										<Check className="mr-1.5 size-3.5 text-emerald-600" />
									) : (
										<Copy className="mr-1.5 size-3.5" />
									)}
									{hasCopied ? "Copied" : "Copy"}
								</Button>
								<Button
									onClick={handleDownloadJson}
									size="sm"
									variant="outline"
								>
									<Download className="mr-1.5 size-3.5" />
									Download
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<pre className="max-h-[600px] overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-foreground text-xs">
								{JSON.stringify(template, null, 2)}
							</pre>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Delete Confirmation Alert */}
			<AlertDialog
				onOpenChange={setShowDeleteAlert}
				open={showDeleteAlert}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete this template?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the template "
							{template.name}". Pages or clinical notes using this
							template layout may be affected.
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
								: "Confirm Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function LayerTreeNode({
	layer,
	depth = 0,
}: {
	layer: ComponentLayer;
	depth?: number;
}) {
	const children = Array.isArray(layer.children) ? layer.children : [];
	const hasChildren = children.length > 0;

	return (
		<div
			className="space-y-1"
			style={{ paddingLeft: `${depth * 18}px` }}
		>
			<div className="flex items-center gap-2 py-1">
				<span className="text-muted-foreground">└</span>
				<Badge
					className="font-mono text-[10px]"
					variant="outline"
				>
					&lt;{layer.type}&gt;
				</Badge>
				<span className="font-semibold text-foreground text-xs">
					{layer.name || layer.id}
				</span>
				{layer.props && Object.keys(layer.props).length > 0 && (
					<span className="text-[11px] text-muted-foreground">
						({Object.keys(layer.props).length} props)
					</span>
				)}
			</div>

			{hasChildren &&
				children.map((child) => (
					<LayerTreeNode
						depth={depth + 1}
						key={child.id}
						layer={child}
					/>
				))}
		</div>
	);
}
