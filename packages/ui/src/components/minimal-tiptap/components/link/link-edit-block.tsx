import { Button } from "@smart/ui/components/button";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import { Switch } from "@smart/ui/components/switch";
import { cn } from "@smart/ui/lib/utils";
import * as React from "react";

export interface LinkEditorProps extends React.ComponentProps<"div"> {
	defaultIsNewTab?: boolean;
	defaultText?: string;
	defaultUrl?: string;
	onSave: (url: string, text?: string, isNewTab?: boolean) => void;
}

const LinkEditBlock = ({
	onSave,
	defaultIsNewTab,
	defaultUrl,
	defaultText,
	className,
}: LinkEditorProps) => {
	const formRef = React.useRef<HTMLDivElement>(null);
	const [url, setUrl] = React.useState(defaultUrl || "");
	const [text, setText] = React.useState(defaultText || "");
	const [isNewTab, setIsNewTab] = React.useState(defaultIsNewTab);

	const handleSave = React.useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (formRef.current) {
				const isValid = Array.from(
					formRef.current.querySelectorAll("input")
				).every((input) => input.checkValidity());

				if (isValid) {
					onSave(url, text, isNewTab);
				} else {
					for (const input of formRef.current.querySelectorAll(
						"input"
					)) {
						if (!input.checkValidity()) {
							input.reportValidity();
						}
					}
				}
			}
		},
		[onSave, url, text, isNewTab]
	);

	return (
		<div ref={formRef}>
			<div className={cn("space-y-4", className)}>
				<div className="space-y-1">
					<Label>URL</Label>
					<Input
						onChange={(e) => setUrl(e.target.value)}
						placeholder="Enter URL"
						required
						type="url"
						value={url}
					/>
				</div>

				<div className="space-y-1">
					<Label>Display Text (optional)</Label>
					<Input
						onChange={(e) => setText(e.target.value)}
						placeholder="Enter display text"
						type="text"
						value={text}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Label>Open in New Tab</Label>
					<Switch
						checked={isNewTab}
						onCheckedChange={setIsNewTab}
					/>
				</div>

				<div className="flex justify-end space-x-2">
					<Button
						onClick={handleSave}
						type="button"
					>
						Save
					</Button>
				</div>
			</div>
		</div>
	);
};

LinkEditBlock.displayName = "LinkEditBlock";

export default LinkEditBlock;
