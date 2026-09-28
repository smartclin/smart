import type { toggleVariants } from "@smart/ui/components/toggle";
import type { Editor } from "@tiptap/react";
import type { VariantProps } from "class-variance-authority";
import { Code, FileDown, GapHorizontal, Plus, QuoteIcon } from "lucide-react";
import type * as React from "react";
import type { FormatAction } from "../../types";
import { ImageEditDialog } from "../image/image-edit-dialog";
import { LinkEditPopover } from "../link/link-edit-popover";
import ToolbarSection from "../toolbar-section";

type InsertElementAction = "codeBlock" | "blockquote" | "horizontalRule";
interface InsertElement extends FormatAction {
	value: InsertElementAction;
}

const formatActions: InsertElement[] = [
	{
		value: "codeBlock",
		label: "Code block",
		icon: <Code className="size-5" />,
		action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
		isActive: (editor) => editor.isActive("codeBlock"),
		canExecute: (editor) =>
			editor.can().chain().focus().toggleCodeBlock().run(),
		shortcuts: ["mod", "alt", "C"],
	},
	{
		value: "blockquote",
		label: "Blockquote",
		icon: <QuoteIcon className="size-5" />,
		action: (editor) => editor.chain().focus().toggleBlockquote().run(),
		isActive: (editor) => editor.isActive("blockquote"),
		canExecute: (editor) =>
			editor.can().chain().focus().toggleBlockquote().run(),
		shortcuts: ["mod", "shift", "B"],
	},
	{
		value: "horizontalRule",
		label: "Divider",
		icon: <GapHorizontal className="size-5" />,
		action: (editor) => editor.chain().focus().setHorizontalRule().run(),
		isActive: () => false,
		canExecute: (editor) =>
			editor.can().chain().focus().setHorizontalRule().run(),
		shortcuts: ["mod", "alt", "-"],
	},
];

interface SectionFiveProps extends VariantProps<typeof toggleVariants> {
	activeActions?: InsertElementAction[];
	editor: Editor;
	mainActionCount?: number;
}

const SectionFive: React.FC<SectionFiveProps> = ({
	editor,
	activeActions = formatActions.map((action) => action.value),
	mainActionCount = 0,
	size,
	variant,
}) => (
	<>
		<LinkEditPopover
			editor={editor}
			size={size}
			variant={variant}
		/>
		<ImageEditDialog
			editor={editor}
			size={size}
			variant={variant}
		/>
		<ToolbarSection
			actions={formatActions}
			activeActions={activeActions}
			dropdownIcon={
				<>
					<Plus className="size-5" />
					<FileDown className="size-5" />
				</>
			}
			dropdownTooltip="Insert elements"
			editor={editor}
			mainActionCount={mainActionCount}
			size={size}
			variant={variant}
		/>
	</>
);

SectionFive.displayName = "SectionFive";

export default SectionFive;
