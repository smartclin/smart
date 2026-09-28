import type { ImageOptions } from "@tiptap/extension-image";
import { Image as TiptapImage } from "@tiptap/extension-image";
import type { Attrs } from "@tiptap/pm/model";
import { ReplaceStep } from "@tiptap/pm/transform";
import type { Editor } from "@tiptap/react";
import {
	type FileError,
	type FileValidationOptions,
	filterFiles,
	randomId,
} from "../../utils";

type ImageAction = "download" | "copyImage" | "copyLink";

interface DownloadImageCommandProps {
	alt?: string;
	src: string;
}

interface ImageActionProps extends DownloadImageCommandProps {
	action: ImageAction;
}

export type UploadReturnType =
	| string
	| {
			id: string | number;
			src: string;
	  };

interface CustomImageOptions
	extends ImageOptions,
		Omit<FileValidationOptions, "allowBase64"> {
	copyImage?: (
		props: ImageActionProps,
		options: CustomImageOptions
	) => Promise<void>;
	copyLink?: (
		props: ImageActionProps,
		options: CustomImageOptions
	) => Promise<void>;
	downloadImage?: (
		props: ImageActionProps,
		options: CustomImageOptions
	) => Promise<void>;
	onActionError?: (error: Error, props: ImageActionProps) => void;
	onActionSuccess?: (props: ImageActionProps) => void;
	onImageRemoved?: (props: Attrs) => void;
	onToggle?: (editor: Editor, files: File[], pos: number) => void;
	onValidationError?: (errors: FileError[]) => void;
	uploadFn?: (file: File, editor: Editor) => Promise<UploadReturnType>;
}

declare module "@tiptap/react" {
	interface Commands<ReturnType> {
		copyImage: {
			copyImage: (attrs: DownloadImageCommandProps) => ReturnType;
		};
		copyLink: {
			copyLink: (attrs: DownloadImageCommandProps) => ReturnType;
		};
		downloadImage: {
			downloadImage: (attrs: DownloadImageCommandProps) => ReturnType;
		};
		setImages: {
			setImages: (
				attrs: { src: string | File; alt?: string; title?: string }[]
			) => ReturnType;
		};
		toggleImage: {
			toggleImage: () => ReturnType;
		};
	}
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Normalize an unknown thrown value into an `Error`.
 */
function toError(value: unknown): Error {
	return value instanceof Error ? value : new Error("Unknown error");
}

/**
 * Extract the MIME type from a `data:` URL header.
 * Returns `undefined` when the header is malformed.
 */
function parseDataUrlMimeType(src: string): string | undefined {
	const commaIndex = src.indexOf(",");
	if (commaIndex === -1) return undefined;
	const header = src.slice(0, commaIndex);
	// header shape: "data:<mimeType>[;<params>]"
	const mimeStart = header.indexOf(":");
	if (mimeStart === -1) return undefined;
	const rest = header.slice(mimeStart + 1);
	const semicolonIndex = rest.indexOf(";");
	return semicolonIndex === -1 ? rest : rest.slice(0, semicolonIndex);
}

/**
 * Extract the extension from a MIME type like "image/png" → "png".
 * Falls back to "png" for malformed input so the download link always has
 * a sensible filename.
 */
function extensionFromMimeType(mimeType: string): string {
	const [subtype] = mimeType.split("/").slice(1);
	return subtype && subtype.length > 0 ? subtype : "png";
}

/**
 * Decode a `data:` URL into a Blob plus extension.
 * Throws if the URL is malformed.
 */
function handleDataUrl(src: string): { blob: Blob; extension: string } {
	const commaIndex = src.indexOf(",");
	if (commaIndex === -1) {
		throw new Error("Malformed data URL");
	}

	const mimeType = parseDataUrlMimeType(src);
	if (!mimeType) {
		throw new Error("Malformed data URL header");
	}

	const base64Data = src.slice(commaIndex + 1);
	const byteCharacters = atob(base64Data);
	const byteArray = new Uint8Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i += 1) {
		byteArray[i] = byteCharacters.charCodeAt(i);
	}
	const blob = new Blob([byteArray], { type: mimeType });
	return { blob, extension: extensionFromMimeType(mimeType) };
}

/**
 * Fetch a remote image and return its Blob plus extension.
 */
async function handleImageUrl(
	src: string
): Promise<{ blob: Blob; extension: string }> {
	const response = await fetch(src);
	if (!response.ok) throw new Error("Failed to fetch image");
	const blob = await response.blob();
	const [extension] = blob.type.split(/\/|\+/).slice(1);
	return { blob, extension: extension ?? "png" };
}

/**
 * Resolve a `src` string to a downloadable Blob + extension.
 */
async function fetchImageBlob(
	src: string
): Promise<{ blob: Blob; extension: string }> {
	return src.startsWith("data:")
		? handleDataUrl(src)
		: await handleImageUrl(src);
}

/**
 * Trigger a browser download for a given Blob.
 */
function saveImage(blob: Blob, name: string, extension: string): void {
	const imageURL = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = imageURL;
	link.download = `${name}.${extension}`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(imageURL);
}

/* ------------------------------------------------------------------ */
/* Default actions                                                     */
/* ------------------------------------------------------------------ */

async function downloadImage(
	props: ImageActionProps,
	options: CustomImageOptions
): Promise<void> {
	const { src, alt } = props;
	const potentialName = alt || "image";

	try {
		const { blob, extension } = await fetchImageBlob(src);
		saveImage(blob, potentialName, extension);
		options.onActionSuccess?.({ ...props, action: "download" });
	} catch (error) {
		handleError(
			error,
			{ ...props, action: "download" },
			options.onActionError
		);
	}
}

async function copyImage(
	props: ImageActionProps,
	options: CustomImageOptions
): Promise<void> {
	const { src } = props;
	try {
		const res = await fetch(src);
		const blob = await res.blob();
		await navigator.clipboard.write([
			new ClipboardItem({ [blob.type]: blob }),
		]);
		options.onActionSuccess?.({ ...props, action: "copyImage" });
	} catch (error) {
		handleError(
			error,
			{ ...props, action: "copyImage" },
			options.onActionError
		);
	}
}

async function copyLink(
	props: ImageActionProps,
	options: CustomImageOptions
): Promise<void> {
	const { src } = props;
	try {
		await navigator.clipboard.writeText(src);
		options.onActionSuccess?.({ ...props, action: "copyLink" });
	} catch (error) {
		handleError(
			error,
			{ ...props, action: "copyLink" },
			options.onActionError
		);
	}
}

function handleError(
	error: unknown,
	props: ImageActionProps,
	errorHandler?: (error: Error, props: ImageActionProps) => void
): void {
	errorHandler?.(toError(error), props);
}

/* ------------------------------------------------------------------ */
/* Extension                                                           */
/* ------------------------------------------------------------------ */

export const Image = TiptapImage.extend<CustomImageOptions>({
	atom: true,

	addOptions() {
		const parentOptions = this.parent?.() ?? {};
		return {
			...parentOptions,
			inline: false,
			allowBase64: false,
			HTMLAttributes: {},
			resize: false,

			allowedMimeTypes: [],
			maxFileSize: 0,
			uploadFn: undefined,
			onToggle: undefined,
			downloadImage: undefined,
			copyImage: undefined,
			copyLink: undefined,
		};
	},

	addAttributes() {
		return {
			src: { default: null },
			alt: { default: null },
			title: { default: null },
			id: { default: null },
			width: { default: null },
			height: { default: null },
			fileName: { default: null },
		};
	},

	addCommands() {
		return {
			setImages:
				(attrs) =>
				({ commands }) => {
					const [validImages, errors] = filterFiles(attrs, {
						allowedMimeTypes: this.options.allowedMimeTypes,
						maxFileSize: this.options.maxFileSize,
						allowBase64: this.options.allowBase64,
					});

					if (errors.length > 0) {
						this.options.onValidationError?.(errors);
					}

					if (validImages.length === 0) {
						return false;
					}

					return commands.insertContent(
						validImages.map((image) => {
							if (image.src instanceof File) {
								const blobUrl = URL.createObjectURL(image.src);
								return {
									type: this.type.name,
									attrs: {
										id: randomId(),
										src: blobUrl,
										alt: image.alt,
										title: image.title,
										fileName: image.src.name,
									},
								};
							}
							return {
								type: this.type.name,
								attrs: {
									id: randomId(),
									src: image.src,
									alt: image.alt,
									title: image.title,
									fileName: null,
								},
							};
						})
					);
				},

			downloadImage: (attrs) => () => {
				const downloadFunc =
					this.options.downloadImage ?? downloadImage;
				void downloadFunc(
					{ ...attrs, action: "download" },
					this.options
				);
				return true;
			},

			copyImage: (attrs) => () => {
				const copyImageFunc = this.options.copyImage ?? copyImage;
				void copyImageFunc(
					{ ...attrs, action: "copyImage" },
					this.options
				);
				return true;
			},

			copyLink: (attrs) => () => {
				const copyLinkFunc = this.options.copyLink ?? copyLink;
				void copyLinkFunc(
					{ ...attrs, action: "copyLink" },
					this.options
				);
				return true;
			},

			toggleImage:
				() =>
				({ editor }) => {
					const input = document.createElement("input");
					input.type = "file";
					input.accept = this.options.allowedMimeTypes.join(",");
					input.onchange = () => {
						const { files } = input;
						if (!files) return;

						const [validImages, errors] = filterFiles(
							Array.from(files),
							{
								allowedMimeTypes: this.options.allowedMimeTypes,
								maxFileSize: this.options.maxFileSize,
								allowBase64: this.options.allowBase64,
							}
						);

						if (errors.length > 0) {
							this.options.onValidationError?.(errors);
							return false;
						}

						if (validImages.length === 0) return false;

						this.options.onToggle?.(
							editor,
							validImages,
							editor.state.selection.from
						);

						return false;
					};

					input.click();
					return true;
				},
		};
	},

	onTransaction({ transaction }) {
		for (const step of transaction.steps) {
			if (!(step instanceof ReplaceStep) || step.slice.size !== 0) {
				continue;
			}

			const deletedPages = transaction.before.content.cut(
				step.from,
				step.to
			);

			for (const node of deletedPages as unknown as Attrs[]) {
				if (node.type.name !== "image") continue;

				const { attrs } = node;

				if (
					typeof attrs.src === "string" &&
					attrs.src.startsWith("blob:")
				) {
					URL.revokeObjectURL(attrs.src);
				}

				this.options.onImageRemoved?.(attrs);
			}
		}
	},
});
