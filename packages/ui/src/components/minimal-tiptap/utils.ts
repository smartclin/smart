import type { Editor } from "@tiptap/react";
import type { MinimalTiptapProps } from "./minimal-tiptap";

type ShortcutKeyResult = {
	symbol: string;
	readable: string;
};

export type FileError = {
	file: File | string;
	reason: "type" | "size" | "invalidBase64" | "base64NotAllowed";
};

export type FileValidationOptions = {
	allowedMimeTypes: string[];
	maxFileSize?: number;
	allowBase64: boolean;
};

type FileInput = File | { src: string | File; alt?: string; title?: string };

export const isClient = (): boolean => typeof window !== "undefined";
export const isServer = (): boolean => !isClient();
export const isMacOS = (): boolean =>
	isClient() && window.navigator.platform === "MacIntel";

const shortcutKeyMap: Record<string, ShortcutKeyResult> = {
	mod: isMacOS()
		? { symbol: "⌘", readable: "Command" }
		: { symbol: "Ctrl", readable: "Control" },
	alt: isMacOS()
		? { symbol: "⌥", readable: "Option" }
		: { symbol: "Alt", readable: "Alt" },
	shift: { symbol: "⇧", readable: "Shift" },
};

export const getShortcutKey = (key: string): ShortcutKeyResult =>
	shortcutKeyMap[key.toLowerCase()] ?? { symbol: key, readable: key };

export const getShortcutKeys = (keys: string[]): ShortcutKeyResult[] =>
	keys.map(getShortcutKey);

export const getOutput = (
	editor: Editor,
	format: MinimalTiptapProps["output"]
): object | string => {
	switch (format) {
		case "json":
			return editor.getJSON();
		case "html":
			return editor.isEmpty ? "" : editor.getHTML();
		case "markdown":
			return editor.isEmpty ? "" : editor.getMarkdown();
		default:
			return editor.getText();
	}
};

export const isUrl = (
	text: string,
	options: { requireHostname: boolean; allowBase64?: boolean } = {
		requireHostname: false,
	}
): boolean => {
	if (text.includes("\n")) return false;

	try {
		const url = new URL(text);
		const blockedProtocols = [
			"javascript:",
			"file:",
			"vbscript:",
			...(options.allowBase64 ? [] : ["data:"]),
		];

		if (blockedProtocols.includes(url.protocol)) return false;
		if (options.allowBase64 && url.protocol === "data:")
			return /^data:image\/[a-z]+;base64,/.test(text);
		if (url.hostname) return true;

		return (
			url.protocol !== "" &&
			(url.pathname.startsWith("//") ||
				url.pathname.startsWith("http")) &&
			!options.requireHostname
		);
	} catch {
		return false;
	}
};

export const sanitizeUrl = (
	url: string | null | undefined,
	options: { allowBase64?: boolean } = {}
): string | undefined => {
	if (!url) return undefined;

	if (options.allowBase64 && url.startsWith("data:image")) {
		return isUrl(url, { requireHostname: false, allowBase64: true })
			? url
			: undefined;
	}

	return isUrl(url, {
		requireHostname: false,
		allowBase64: options.allowBase64,
	}) || /^(\/|#|mailto:|sms:|fax:|tel:)/.test(url)
		? url
		: `https://${url}`;
};

export const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
	const response = await fetch(blobUrl);
	const blob = await response.blob();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Failed to convert Blob to base64"));
			}
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

export const randomId = (): string => Math.random().toString(36).slice(2, 11);

export const fileToBase64 = (file: File | Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Failed to convert File to base64"));
			}
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

/* ------------------------------------------------------------------ */
/* File / base64 validation helpers                                   */
/* ------------------------------------------------------------------ */

/**
 * Extract the base64 payload from a data URL, or return `undefined`
 * if the input isn't a well-formed `data:...,...` string.
 */
function extractBase64Payload(input: string): string | undefined {
	const commaIndex = input.indexOf(",");
	if (commaIndex === -1) return undefined;
	return input.slice(commaIndex + 1);
}

const base64MimeType = (encoded: string): string => {
	const result = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
	return result?.[1] ?? "unknown";
};

const checkTypeAndSize = (
	input: File | string,
	{ allowedMimeTypes, maxFileSize }: FileValidationOptions
): { isValidType: boolean; isValidSize: boolean } => {
	const mimeType = input instanceof File ? input.type : base64MimeType(input);

	let size: number;
	if (input instanceof File) {
		size = input.size;
	} else {
		const payload = extractBase64Payload(input);
		// If the payload can't be extracted, treat the size as 0 — the
		// type check will already fail for malformed data URLs, so we
		// don't want to throw here.
		size = payload ? atob(payload).length : 0;
	}

	const [mainType] = mimeType.split("/");
	const isValidType =
		allowedMimeTypes.length === 0 ||
		allowedMimeTypes.includes(mimeType) ||
		(mainType !== undefined && allowedMimeTypes.includes(`${mainType}/*`));

	const isValidSize = !maxFileSize || size <= maxFileSize;

	return { isValidType, isValidSize };
};

const isBase64 = (input: string): boolean => {
	let payload = input;

	if (input.startsWith("data:")) {
		const matches = input.match(/^data:[^;]+;base64,(.+)$/);
		if (!matches?.[1]) {
			return false;
		}
		// Use a local variable so we don't reassign the parameter.
		[payload] = matches;
	}

	try {
		return btoa(atob(payload)) === payload;
	} catch {
		return false;
	}
};

const validateFileOrBase64 = <T extends FileInput>(
	input: File | string,
	options: FileValidationOptions,
	originalFile: T,
	validFiles: T[],
	errors: FileError[]
): void => {
	const { isValidType, isValidSize } = checkTypeAndSize(input, options);

	if (isValidType && isValidSize) {
		validFiles.push(originalFile);
		return;
	}

	if (!isValidType) errors.push({ file: input, reason: "type" });
	if (!isValidSize) errors.push({ file: input, reason: "size" });
};

/* ------------------------------------------------------------------ */
/* Public file filter                                                 */
/* ------------------------------------------------------------------ */

export const filterFiles = <T extends FileInput>(
	files: T[],
	options: FileValidationOptions
): [T[], FileError[]] => {
	const validFiles: T[] = [];
	const errors: FileError[] = [];

	for (const file of files) {
		const actualFile = "src" in file ? file.src : file;

		if (actualFile instanceof File) {
			validateFileOrBase64(actualFile, options, file, validFiles, errors);
			continue;
		}

		if (typeof actualFile !== "string") {
			continue;
		}

		if (isBase64(actualFile)) {
			if (options.allowBase64) {
				validateFileOrBase64(
					actualFile,
					options,
					file,
					validFiles,
					errors
				);
			} else {
				errors.push({
					file: actualFile,
					reason: "base64NotAllowed",
				});
			}
			continue;
		}

		if (sanitizeUrl(actualFile, { allowBase64: options.allowBase64 })) {
			validFiles.push(file);
		} else {
			errors.push({ file: actualFile, reason: "invalidBase64" });
		}
	}

	return [validFiles, errors];
};
