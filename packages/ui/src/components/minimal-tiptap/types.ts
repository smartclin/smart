import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import type { Editor } from "@tiptap/react";

export interface LinkProps {
	openInNewTab?: boolean;
	text?: string;
	url: string;
}

export interface ShouldShowProps {
	editor: Editor;
	from: number;
	oldState?: EditorState;
	state: EditorState;
	to: number;
	view: EditorView;
}

export interface FormatAction {
	action: (editor: Editor) => void;
	canExecute: (editor: Editor) => boolean;
	icon?: React.ReactNode;
	isActive: (editor: Editor) => boolean;
	label: string;
	shortcuts: string[];
	value: string;
}
