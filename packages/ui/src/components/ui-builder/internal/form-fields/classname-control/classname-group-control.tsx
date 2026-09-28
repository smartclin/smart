import { Button } from "@smart/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@smart/ui/components/dropdown-menu";
import {
	CONFIG,
	type ConfigItem,
	type StateType,
} from "@smart/ui/components/ui-builder/internal/form-fields/classname-control/config";
import { MoreVertical } from "lucide-react";
import { useCallback, useMemo } from "react";

const EMPTY_OBJECT = {};

type ClassNameGroupControlProps = {
	groupConfig: ConfigItem;
	group: {
		label: string;
		keys: string[];
	};
	state: StateType;
	handleStateChange: (
		key: keyof StateType,
		value: string | string[] | null
	) => void;
	handleGroupKeySelect: (groupLabel: string, key: string) => void;
	selectedKey: string | string[] | null;
};

/**
 * Normalize a `StateType` entry into the `readonly string[] | undefined`
 * shape that Base UI's `ToggleGroup` expects for its `value` prop.
 *
 * - `null` / `undefined` → `undefined`
 * - `string` → `[value]`
 * - `string[]` → `string[]`
 */
function toToggleGroupValue(
	raw: string | string[] | null | undefined
): string[] | undefined {
	if (raw === null || raw === undefined) return undefined;
	if (Array.isArray(raw)) return raw;
	return [raw];
}

export function ClassNameGroupControl({
	groupConfig,
	group,
	state,
	handleStateChange,
	handleGroupKeySelect,
	selectedKey,
}: ClassNameGroupControlProps) {
	// Memoize the conditional spread props
	const spreadProps = useMemo(
		() =>
			"multiple" in groupConfig
				? { multiple: groupConfig.multiple }
				: EMPTY_OBJECT,
		[groupConfig]
	);

	// The current selected key as a string (the component only ever stores
	// one active key per group). `selectedKey` can be a string, an array,
	// or null depending on callers, so normalize to a string here.
	const selectedKeyString = useMemo(
		() =>
			Array.isArray(selectedKey)
				? (selectedKey[0] ?? "")
				: (selectedKey ?? ""),
		[selectedKey]
	);

	// Memoize the change handler.
	// Base UI's ToggleGroup calls `onValueChange` with a `readonly string[]`
	// (the new selected values), not a single string.
	const handleChange = useCallback(
		(value: readonly string[]) => {
			if (!selectedKeyString) return;
			const next = value.length === 0 ? null : [...value];
			handleStateChange(selectedKeyString as keyof StateType, next);
		},
		[handleStateChange, selectedKeyString]
	);

	// Memoize the dropdown click handler
	const handleDropdownClick = useCallback(
		(key: string) => () => handleGroupKeySelect(group.label, key),
		[handleGroupKeySelect, group.label]
	);

	return (
		<>
			<span className="font-medium text-muted-foreground text-xs">
				{group.label}
			</span>
			<div className="flex flex-row">
				<div>
					<groupConfig.component
						{...groupConfig}
						{...spreadProps}
						onValueChange={handleChange}
						value={toToggleGroupValue(
							state[selectedKeyString as keyof StateType]
						)}
					/>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								className="w-6 px-1 py-1 text-xs"
								size="icon"
								variant="outline"
							/>
						}
					>
						<MoreVertical className="!size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{group.keys.map((key) => (
							<DropdownMenuItem
								className={
									selectedKey === String(key)
										? "bg-secondary-foreground/10"
										: ""
								}
								key={String(key)}
								onClick={handleDropdownClick(String(key))}
							>
								{CONFIG[String(key)]?.label || String(key)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
