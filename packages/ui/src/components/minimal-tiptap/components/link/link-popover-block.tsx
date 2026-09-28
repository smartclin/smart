import { Separator } from "@smart/ui/components/separator";
import { Copy, ExternalLink, Unlink } from "lucide-react";
import * as React from "react";
import ToolbarButton from "../toolbar-button";

interface LinkPopoverBlockProps {
	onClear: () => void;
	onEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
	url: string;
}

export const LinkPopoverBlock: React.FC<LinkPopoverBlockProps> = ({
	url,
	onClear,
	onEdit,
}) => {
	const [copyTitle, setCopyTitle] = React.useState<string>("Copy");

	const handleCopy = React.useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			navigator.clipboard
				.writeText(url)
				.then(() => {
					setCopyTitle("Copied!");
					setTimeout(() => setCopyTitle("Copy"), 1000);
				})
				.catch(console.error);
		},
		[url]
	);

	const handleOpenLink = React.useCallback(() => {
		window.open(url, "_blank", "noopener,noreferrer");
	}, [url]);

	return (
		<div className="flex overflow-hidden rounded bg-background p-2 shadow-lg">
			<div className="inline-flex items-center gap-1">
				<ToolbarButton
					onClick={onEdit}
					tooltip="Edit link"
				>
					Edit link
				</ToolbarButton>
				<Separator orientation="vertical" />
				<ToolbarButton
					onClick={handleOpenLink}
					tooltip="Open link in a new tab"
				>
					<ExternalLink />
				</ToolbarButton>
				<Separator orientation="vertical" />
				<ToolbarButton
					onClick={onClear}
					tooltip="Clear link"
				>
					<Unlink />
				</ToolbarButton>
				<Separator orientation="vertical" />
				<ToolbarButton
					onClick={handleCopy}
					tooltip={copyTitle}
				>
					<Copy />
				</ToolbarButton>
			</div>
		</div>
	);
};
