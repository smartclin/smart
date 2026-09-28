import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import { Card, CardContent } from "@smart/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@smart/ui/components/dropdown-menu";
import {
	FormControl,
	FormDescription,
	FormItem,
	FormLabel,
} from "@smart/ui/components/form";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import MinimalTiptapEditor from "@smart/ui/components/minimal-tiptap/minimal-tiptap";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import { Textarea } from "@smart/ui/components/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@smart/ui/components/tooltip";
import { ChildrenSearchableSelect } from "@smart/ui/components/ui-builder/internal/form-fields/children-searchable-select";
import BreakpointClassNameControl from "@smart/ui/components/ui-builder/internal/form-fields/classname-control";
import { EMAIL_CLASSNAME_CONTROL_PROFILE } from "@smart/ui/components/ui-builder/internal/form-fields/classname-control/config";
import IconNameField from "@smart/ui/components/ui-builder/internal/form-fields/iconname-field";
import type {
	AutoFormInputComponentProps,
	ComponentLayer,
	FieldConfigFunction,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import { useEditorStore } from "@smart/ui/lib/ui-builder/store/editor-store";
import { useLayerStore } from "@smart/ui/lib/ui-builder/store/layer-store";
import { isVariableReference } from "@smart/ui/lib/ui-builder/utils/variable-resolver";

import { Link, LockKeyhole, Unlink } from "lucide-react";
import type React from "react";
import { useCallback } from "react";

interface VariableRowProps {
	onSelect: (id: string) => void;
	/** Optional secondary line; omit to render only name + type */
	subtitle?: string;
	variable: Variable;
}

function VariableRow({ variable, onSelect, subtitle }: VariableRowProps) {
	const handleClick = useCallback(() => {
		onSelect(variable.id);
	}, [onSelect, variable.id]);

	return (
		<DropdownMenuItem
			className="flex flex-col items-start p-3"
			onClick={handleClick}
		>
			<div className="flex w-full items-center gap-2">
				<Link className="h-4 w-4 flex-shrink-0" />
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-center gap-2">
						<span className="font-medium">{variable.name}</span>
						<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
							{variable.type}
						</span>
					</div>
					{subtitle ? (
						<span className="truncate text-muted-foreground text-xs">
							{subtitle}
						</span>
					) : null}
				</div>
			</div>
		</DropdownMenuItem>
	);
}
export const classNameFieldOverrides: FieldConfigFunction = (
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_layer
) => ({
	fieldType: ({
		label,
		isRequired,
		field,
		fieldConfigItem,
	}: AutoFormInputComponentProps) => (
		<FormFieldWrapper
			fieldConfigItem={fieldConfigItem}
			isRequired={isRequired}
			label={label}
		>
			<BreakpointClassNameControl
				onChange={field.handleChange}
				value={field.state.value}
			/>
		</FormFieldWrapper>
	),
});

export const emailClassNameFieldOverrides: FieldConfigFunction = (
	// eslint-disable-next-line @typescript-eslint/no-unused-vars_layer
) => ({
	fieldType: ({
		label,
		isRequired,
		field,
		fieldConfigItem,
	}: AutoFormInputComponentProps) => (
		<FormFieldWrapper
			fieldConfigItem={fieldConfigItem}
			isRequired={isRequired}
			label={label}
		>
			<BreakpointClassNameControl
				classProfile={EMAIL_CLASSNAME_CONTROL_PROFILE}
				onChange={field.handleChange}
				value={field.state.value}
			/>
		</FormFieldWrapper>
	),
});

export const childrenFieldOverrides = (
	layer: ComponentLayer,
	allowVariableBinding = true
) => ({
	renderParent: allowVariableBinding
		? ({ children }: { children: React.ReactNode }) => (
				<ChildrenVariableBindingWrapper>
					{children}
				</ChildrenVariableBindingWrapper>
			)
		: undefined,
	fieldType: ({
		label,
		isRequired,
		fieldConfigItem,
		field,
		fieldProps,
	}: AutoFormInputComponentProps) => (
		<FormFieldWrapper
			fieldConfigItem={fieldConfigItem}
			isRequired={isRequired}
			label={label}
		>
			<ChildrenSearchableSelect
				layer={layer}
				onChange={field.handleChange}
				{...fieldProps}
			/>
		</FormFieldWrapper>
	),
});

export const iconNameFieldOverrides: FieldConfigFunction = (layer) => ({
	fieldType: ({
		label,
		isRequired,
		field,
		fieldProps,
	}: AutoFormInputComponentProps) => (
		<IconNameField
			isRequired={isRequired}
			label={label}
			onChange={field.handleChange}
			value={layer.props.iconName}
			{...fieldProps}
		/>
	),
});

export const childrenAsTextareaFieldOverrides = (
	layer: ComponentLayer,
	allowVariableBinding = true
) => ({
	renderParent: allowVariableBinding
		? ({ children }: { children: React.ReactNode }) => (
				<ChildrenVariableBindingWrapper>
					{children}
				</ChildrenVariableBindingWrapper>
			)
		: undefined,
	fieldType: ({
		label,
		isRequired,
		fieldConfigItem,
		field,
		fieldProps,
	}: AutoFormInputComponentProps) => (
		<FormFieldWrapper
			fieldConfigItem={fieldConfigItem}
			isRequired={isRequired}
			label={label}
		>
			<Textarea
				onChange={field.handleChange}
				value={typeof layer.children === "string" ? layer.children : ""}
				{...fieldProps}
			/>
		</FormFieldWrapper>
	),
});
export const childrenAsTipTapFieldOverrides = (
	layer: ComponentLayer,
	allowVariableBinding = true
) => ({
	renderParent: allowVariableBinding
		? ({ children }: { children: React.ReactNode }) => (
				<ChildrenVariableBindingWrapper>
					{children}
				</ChildrenVariableBindingWrapper>
			)
		: undefined,
	fieldType: (props: AutoFormInputComponentProps) => (
		<TipTapChildField
			layer={layer}
			{...props}
		/>
	),
});
function TipTapChildField({
	layer,
	label,
	isRequired,
	fieldConfigItem,
	field,
	fieldProps,
}: AutoFormInputComponentProps & { layer: ComponentLayer }) {
	const handleChange = useCallback(
		(content: string | object) => {
			if (typeof content === "string") {
				field.handleChange(content);
			} else {
				console.warn("Tiptap content is not a string");
			}
		},
		[field]
	);

	return (
		<FormFieldWrapper
			fieldConfigItem={fieldConfigItem}
			isRequired={isRequired}
			label={label}
		>
			<MinimalTiptapEditor
				editable={true}
				editorClassName="focus:outline-none px-4 py-2 h-full"
				immediatelyRender={false}
				onChange={handleChange}
				output="markdown"
				value={typeof layer.children === "string" ? layer.children : ""}
				{...fieldProps}
			/>
		</FormFieldWrapper>
	);
}
// Memoized common field overrides to avoid recreating objects
const memoizedCommonFieldOverrides = new Map<
	boolean,
	Record<string, (layer: ComponentLayer) => ReturnType<FieldConfigFunction>>
>();

export const commonFieldOverrides = (allowBinding = true) => {
	if (memoizedCommonFieldOverrides.has(allowBinding)) {
		return memoizedCommonFieldOverrides.get(allowBinding)!;
	}

	const overrides = {
		className: (layer: ComponentLayer) => classNameFieldOverrides(layer),
		children: (layer: ComponentLayer) =>
			childrenFieldOverrides(layer, allowBinding),
	};

	memoizedCommonFieldOverrides.set(allowBinding, overrides);
	return overrides;
};

export const commonVariableRenderParentOverrides = (propName: string) => ({
	renderParent: ({ children }: { children: React.ReactNode }) => (
		<VariableBindingWrapper propName={propName}>
			{children}
		</VariableBindingWrapper>
	),
});

/**
 * Component for function props that shows a dropdown of all functions
 * from the function registry. Variable binding is handled by the wrapper.
 */

function FunctionPropField({
	propName,
	label,
	isRequired,
	fieldConfigItem,
}: {
	propName: string;
	label: string;
	isRequired?: boolean;
	fieldConfigItem?: { description?: React.ReactNode };
}) {
	const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
	const findLayerById = useLayerStore((state) => state.findLayerById);
	const updateLayer = useLayerStore((state) => state.updateLayer);
	const incrementRevision = useEditorStore(
		(state) => state.incrementRevision
	);
	const functionRegistry = useEditorStore((state) => state.functionRegistry);
	const unbindPropFromVariable = useLayerStore(
		(state) => state.unbindPropFromVariable
	);

	const selectedLayer = findLayerById(selectedLayerId);

	// Base UI's Select passes (value: string | null, details). Accept both.
	const handleValueChange = useCallback(
		(value: string | null) => {
			if (!selectedLayer) return;

			if (value === null || value === "__none__") {
				unbindPropFromVariable(selectedLayer.id, propName);
				updateLayer(selectedLayer.id, {
					[`__function_${propName}`]: undefined,
					[propName]: undefined,
				});
				incrementRevision();
				return;
			}

			const funcDef = functionRegistry?.[value];
			if (funcDef) {
				unbindPropFromVariable(selectedLayer.id, propName);
				updateLayer(selectedLayer.id, {
					[propName]: funcDef.fn,
					[`__function_${propName}`]: value,
				});
				incrementRevision();
			}
		},
		[
			selectedLayer,
			propName,
			functionRegistry,
			unbindPropFromVariable,
			updateLayer,
			incrementRevision,
		]
	);

	if (!(selectedLayer && functionRegistry)) {
		return (
			<FormFieldWrapper
				fieldConfigItem={fieldConfigItem}
				isRequired={isRequired}
				label={label}
			>
				<Select disabled>
					<SelectTrigger>
						<SelectValue placeholder="No function registry available" />
					</SelectTrigger>
				</Select>
			</FormFieldWrapper>
		);
	}

	const functionEntries = Object.entries(functionRegistry);

	// Direct binding only — variable binding is handled by the wrapper.
	const directFuncId = selectedLayer.props[`__function_${propName}`];
	const currentFunctionId =
		typeof directFuncId === "string" ? directFuncId : "";

	const selectedFuncDef = currentFunctionId
		? functionRegistry[currentFunctionId]
		: undefined;
	const displayText = selectedFuncDef?.name ?? currentFunctionId ?? "";

	return (
		<FormFieldWrapper
			fieldConfigItem={fieldConfigItem}
			isRequired={isRequired}
			label={label}
		>
			<Select
				onValueChange={handleValueChange}
				value={currentFunctionId}
			>
				<SelectTrigger className="mb-0 w-full">
					<SelectValue placeholder="Select a function...">
						{displayText}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="__none__">
						<span className="text-muted-foreground">
							None (clear)
						</span>
					</SelectItem>

					{functionEntries.map(([id, funcDef]) => (
						<SelectItem
							key={id}
							value={id}
						>
							<div className="flex flex-col">
								<span>{funcDef.name}</span>
								{funcDef.description ? (
									<span className="text-muted-foreground text-xs">
										{funcDef.description}
									</span>
								) : null}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FormFieldWrapper>
	);
}
/**
 * Field override for function props (onClick, onSubmit, etc.)
 * Shows a dropdown to select directly from functionRegistry,
 * with a separate bind button for function-type variables (consistent with other fields).
 */
export const functionPropFieldOverrides = (
	propName: string
): ReturnType<FieldConfigFunction> => ({
	renderParent: ({ children }: { children: React.ReactNode }) => (
		<VariableBindingWrapper
			isFunctionProp={true}
			propName={propName}
		>
			{children}
		</VariableBindingWrapper>
	),
	fieldType: (props: AutoFormInputComponentProps) => (
		<FunctionPropField
			propName={propName}
			{...props}
		/>
	),
});
function TextInputField({
	label,
	isRequired,
	fieldConfigItem,
	field,
	fieldProps,
}: AutoFormInputComponentProps) {
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			field.handleChange(e.target.value);
		},
		[field]
	);

	return (
		<FormFieldWrapper
			fieldConfigItem={fieldConfigItem}
			isRequired={isRequired}
			label={label}
		>
			<Input
				onChange={handleChange}
				value={field.state.value as string}
				{...fieldProps}
			/>
		</FormFieldWrapper>
	);
}

export const textInputFieldOverrides = (
	propName: string,
	allowVariableBinding = false
) => ({
	renderParent: allowVariableBinding
		? ({ children }: { children: React.ReactNode }) => (
				<VariableBindingWrapper propName={propName}>
					{children}
				</VariableBindingWrapper>
			)
		: undefined,
	fieldType: (props: AutoFormInputComponentProps) => (
		<TextInputField {...props} />
	),
});

export function VariableBindingWrapper({
	propName,
	children,
	isFunctionProp = false,
}: {
	propName: string;
	children: React.ReactNode;
	/** Set to true when binding to function props (onClick, onSubmit, etc.) */
	isFunctionProp?: boolean;
}) {
	const variables = useLayerStore((state) => state.variables);
	const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
	const findLayerById = useLayerStore((state) => state.findLayerById);
	const isBindingImmutable = useLayerStore(
		(state) => state.isBindingImmutable
	);
	const incrementRevision = useEditorStore(
		(state) => state.incrementRevision
	);
	const functionRegistry = useEditorStore((state) => state.functionRegistry);
	const unbindPropFromVariable = useLayerStore(
		(state) => state.unbindPropFromVariable
	);
	const bindPropToVariable = useLayerStore(
		(state) => state.bindPropToVariable
	);

	const selectedLayer = findLayerById(selectedLayerId);

	const handleBindToVariable = useCallback(
		(variableId: string) => {
			if (!selectedLayer) return;
			bindPropToVariable(selectedLayer.id, propName, variableId);
			incrementRevision();
		},
		[selectedLayer, propName, bindPropToVariable, incrementRevision]
	);

	const handleUnbind = useCallback(() => {
		if (!selectedLayer) return;
		unbindPropFromVariable(selectedLayer.id, propName);
		incrementRevision();
	}, [selectedLayer, propName, unbindPropFromVariable, incrementRevision]);

	if (!selectedLayer) {
		return <>{children}</>;
	}

	// Filter variables based on prop type
	// Function props should only show function-type variables
	// Non-function props should show non-function variables
	const filteredVariables = variables.filter((v) =>
		isFunctionProp ? v.type === "function" : v.type !== "function"
	);

	const currentValue = selectedLayer.props[propName];
	const isCurrentlyBound = isVariableReference(currentValue);
	const boundVariable = isCurrentlyBound
		? variables.find((v) => v.id === currentValue.__variableRef)
		: null;
	const isImmutable = isBindingImmutable(selectedLayer.id, propName);

	// Get function display name for function-type variables
	const getFunctionDisplayValue = (variable: Variable) => {
		if (variable.type === "function" && functionRegistry) {
			const funcId = String(variable.defaultValue);
			const funcDef = functionRegistry[funcId];
			return funcDef ? funcDef.name : funcId;
		}
		return String(variable.defaultValue);
	};

	const emptyMessage = isFunctionProp
		? "No function variables defined"
		: "No variables defined";

	const bindLabel = isFunctionProp
		? "Bind to Function Variable"
		: "Bind to Variable";

	const tooltipLabel = isFunctionProp ? "Bind Function" : "Bind Variable";

	return (
		<div className="flex w-full items-end gap-2">
			{isCurrentlyBound && boundVariable ? (
				// Bound state - show variable info and unbind button
				<div className="flex w-full flex-col gap-2">
					<Label>
						{propName.charAt(0).toUpperCase() + propName.slice(1)}
					</Label>
					<div className="flex w-full items-end gap-2">
						<Card className="w-full min-w-0 overflow-hidden">
							<CardContent className="px-4 py-1">
								<div className="flex w-full items-center gap-2">
									<Link className="h-4 w-4 flex-shrink-0" />
									<div className="flex min-w-0 flex-1 flex-col">
										<div className="flex w-full items-center gap-2">
											<span className="font-medium">
												{boundVariable.name}
											</span>
											<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
												{boundVariable.type}
											</span>
											{isImmutable ? (
												<Badge
													className="rounded"
													data-testid="immutable-badge"
												>
													<LockKeyhole
														className="h-3 w-3"
														strokeWidth={3}
													/>
												</Badge>
											) : null}
										</div>
										<span className="truncate text-muted-foreground text-xs">
											{getFunctionDisplayValue(
												boundVariable
											)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
						{isImmutable ? null : (
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											className="h-10 px-3"
											data-testid="unbind-variable-button"
											onClick={handleUnbind}
											variant="outline"
										/>
									}
								>
									<Unlink className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>Unbind Variable</TooltipContent>
							</Tooltip>
						)}
					</div>
				</div>
			) : (
				// Unbound state - show normal field with bind button
				<>
					<div className="flex-1">{children}</div>
					<div className="flex justify-end">
						<DropdownMenu>
							<Tooltip>
								<DropdownMenuTrigger
									render={
										<TooltipTrigger
											render={
												<Button
													className="h-10 px-3"
													data-testid="bind-variable-button"
													size="sm"
													variant="outline"
												/>
											}
										/>
									}
								>
									<Link className="my-1 h-4 w-4" />
								</DropdownMenuTrigger>
								<TooltipContent>{tooltipLabel}</TooltipContent>
							</Tooltip>
							<DropdownMenuContent
								align="end"
								className="w-56"
							>
								<div className="border-b px-2 py-1.5 font-medium text-muted-foreground text-xs">
									{bindLabel}
								</div>
								{filteredVariables.length > 0 ? (
									filteredVariables.map((variable) => (
										<VariableRow
											key={variable.id}
											onSelect={handleBindToVariable}
											subtitle={getFunctionDisplayValue(
												variable
											)}
											variable={variable}
										/>
									))
								) : (
									<div className="px-3 py-2 text-muted-foreground text-xs">
										{emptyMessage}
									</div>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</>
			)}
		</div>
	);
}

export function FormFieldWrapper({
	label,
	isRequired,
	fieldConfigItem,
	children,
}: {
	label: string;
	isRequired?: boolean;
	fieldConfigItem?: { description?: React.ReactNode };
	children: React.ReactNode;
}) {
	return (
		<FormItem className="flex flex-col">
			<FormLabel>
				{label}
				{isRequired ? null : (
					<span className="text-destructive"> *</span>
				)}
			</FormLabel>
			<FormControl>{children}</FormControl>
			{fieldConfigItem?.description ? (
				<FormDescription>{fieldConfigItem.description}</FormDescription>
			) : null}
		</FormItem>
	);
}

/**
 * Wrapper component for children variable binding.
 * Similar to VariableBindingWrapper but specifically for layer.children.
 */
export function ChildrenVariableBindingWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const variables = useLayerStore((state) => state.variables);
	const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
	const findLayerById = useLayerStore((state) => state.findLayerById);
	const isChildrenBindingImmutable = useLayerStore(
		(state) => state.isChildrenBindingImmutable
	);
	const incrementRevision = useEditorStore(
		(state) => state.incrementRevision
	);
	const unbindChildrenFromVariable = useLayerStore(
		(state) => state.unbindChildrenFromVariable
	);
	const bindChildrenToVariable = useLayerStore(
		(state) => state.bindChildrenToVariable
	);

	const selectedLayer = findLayerById(selectedLayerId);

	const handleBindToVariable = useCallback(
		(variableId: string) => {
			if (!selectedLayer) return;
			bindChildrenToVariable(selectedLayer.id, variableId);
			incrementRevision();
		},
		[selectedLayer, bindChildrenToVariable, incrementRevision]
	);

	const handleUnbind = useCallback(() => {
		if (!selectedLayer) return;
		unbindChildrenFromVariable(selectedLayer.id);
		incrementRevision();
	}, [selectedLayer, unbindChildrenFromVariable, incrementRevision]);

	if (!selectedLayer) {
		return <>{children}</>;
	}

	const currentValue = selectedLayer.children;
	const isCurrentlyBound = isVariableReference(currentValue);
	const boundVariable = isCurrentlyBound
		? variables.find((v) => v.id === currentValue.__variableRef)
		: null;
	const isImmutable = isChildrenBindingImmutable(selectedLayer.id);

	// ← THIS WAS MISSING
	const stringVariables = variables.filter((v) => v.type === "string");

	return (
		<div className="flex w-full items-end gap-2">
			{isCurrentlyBound && boundVariable ? (
				// Bound state - show variable info and unbind button
				<div className="flex w-full flex-col gap-2">
					<Label>Children</Label>
					<div className="flex w-full items-end gap-2">
						<Card className="w-full min-w-0 overflow-hidden">
							<CardContent className="px-4 py-1">
								<div className="flex w-full items-center gap-2">
									<Link className="h-4 w-4 flex-shrink-0" />
									<div className="flex min-w-0 flex-1 flex-col">
										<div className="flex w-full items-center gap-2">
											<span className="font-medium">
												{boundVariable.name}
											</span>
											<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
												{boundVariable.type}
											</span>
											{isImmutable ? (
												<Badge
													className="rounded"
													data-testid="immutable-children-badge"
												>
													<LockKeyhole
														className="h-3 w-3"
														strokeWidth={3}
													/>
												</Badge>
											) : null}
										</div>
										<span className="truncate text-muted-foreground text-xs">
											{String(boundVariable.defaultValue)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
						{isImmutable ? null : (
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											className="h-10 px-3"
											data-testid="unbind-children-button"
											onClick={handleUnbind}
											variant="outline"
										/>
									}
								>
									<Unlink className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>Unbind Variable</TooltipContent>
							</Tooltip>
						)}
					</div>
				</div>
			) : (
				// Unbound state - show normal field with bind button
				<>
					<div className="flex-1">{children}</div>
					<div className="flex justify-end">
						<DropdownMenu>
							<Tooltip>
								<DropdownMenuTrigger
									render={
										<TooltipTrigger
											render={
												<Button
													className="h-10 px-3"
													data-testid="bind-children-button"
													size="sm"
													variant="outline"
												/>
											}
										/>
									}
								>
									<Link className="my-1 h-4 w-4" />
								</DropdownMenuTrigger>
								<TooltipContent>
									Bind Children to Variable
								</TooltipContent>
							</Tooltip>
							<DropdownMenuContent
								align="end"
								className="w-56"
							>
								<div className="border-b px-2 py-1.5 font-medium text-muted-foreground text-xs">
									Bind Children to Variable
								</div>
								{stringVariables.length > 0 ? (
									stringVariables.map((variable) => (
										<VariableRow
											key={variable.id}
											onSelect={handleBindToVariable}
											subtitle={String(
												variable.defaultValue
											)}
											variable={variable}
										/>
									))
								) : (
									<div className="px-3 py-2 text-muted-foreground text-xs">
										No string variables defined
									</div>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</>
			)}
		</div>
	);
}
