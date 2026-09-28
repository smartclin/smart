import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@smart/ui/components/dropdown-menu";
import type { toggleVariants } from "@smart/ui/components/toggle";
import { cn } from "@smart/ui/lib/utils";
import type { Editor } from "@tiptap/react";
import type { VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import type { FormatAction } from "../types";
import { getShortcutKey } from "../utils";
import { ShortcutKey } from "./shortcut-key";
import ToolbarButton from "./toolbar-button";

interface ToolbarSectionProps extends VariantProps<typeof toggleVariants> {
	actions: FormatAction[];
	activeActions?: string[];
	dropdownClassName?: string;
	dropdownIcon?: React.ReactNode;
	dropdownTooltip?: string;
	editor: Editor;
	mainActionCount?: number;
}

const ToolbarSection: React.FC<ToolbarSectionProps> = ({
	editor,
	actions,
	activeActions = actions.map((action) => action.value),
	mainActionCount = 0,
	dropdownIcon,
	dropdownTooltip = "More options",
	dropdownClassName = "w-12",
	size,
	variant,
}) => {
	const { mainActions, dropdownActions } = React.useMemo(() => {
		const sortedActions = actions
			.filter((action) => activeActions.includes(action.value))
			.sort(
				(a, b) =>
					activeActions.indexOf(a.value) -
					activeActions.indexOf(b.value)
			);

		return {
			mainActions: sortedActions.slice(0, mainActionCount),
			dropdownActions: sortedActions.slice(mainActionCount),
		};
	}, [actions, activeActions, mainActionCount]);

	const renderToolbarButton = React.useCallback(
		(action: FormatAction) => (
			<ToolbarButton
				aria-label={action.label}
				disabled={!action.canExecute(editor)}
				isActive={action.isActive(editor)}
				key={action.label}
				onClick={() => action.action(editor)}
				size={size}
				tooltip={`${action.label} ${action.shortcuts.map((s) => getShortcutKey(s).symbol).join(" ")}`}
				variant={variant}
			>
				{action.icon}
			</ToolbarButton>
		),
		[editor, size, variant]
	);

	const renderDropdownMenuItem = React.useCallback(
		(action: FormatAction) => (
			<DropdownMenuItem
				aria-label={action.label}
				className={cn(
					"flex flex-row items-center justify-between gap-4",
					{
						"bg-accent": action.isActive(editor),
					}
				)}
				disabled={!action.canExecute(editor)}
				key={action.label}
				onClick={() => action.action(editor)}
			>
				<span className="grow">{action.label}</span>
				<ShortcutKey keys={action.shortcuts} />
			</DropdownMenuItem>
		),
		[editor]
	);

	const isDropdownActive = dropdownActions.some((action) =>
		action.isActive(editor)
	);

	return (
		<>
			{mainActions.map(renderToolbarButton)}
			{dropdownActions.length > 0 && (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<ToolbarButton
								aria-label={dropdownTooltip}
								className={cn("gap-0", dropdownClassName)}
								isActive={isDropdownActive}
								size={size}
								tooltip={dropdownTooltip}
								variant={variant}
							/>
						}
					>
						{dropdownIcon || <ChevronDown className="size-5" />}
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-full"
					>
						{dropdownActions.map(renderDropdownMenuItem)}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</>
	);
};

export default ToolbarSection;
