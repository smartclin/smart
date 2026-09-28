import { ClassNameGroupControl } from "@smart/ui/components/ui-builder/internal/form-fields/classname-control/classname-group-control";
import {
	type ClassNameControlProfile,
	resolveClassNameControlConfig,
	type StateType,
} from "@smart/ui/components/ui-builder/internal/form-fields/classname-control/config";
import { isTailwindClass } from "@smart/ui/components/ui-builder/internal/form-fields/classname-control/helpers";
import { cn } from "@smart/ui/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ClassNameItemControlProps {
	classProfile?: ClassNameControlProfile;
	onChange: (value: string) => void;
	value: string;
}

/**
 * Normalize a `StateType` entry into the `readonly string[] | undefined`
 * shape that Base UI's `ToggleGroup` expects for its `value` prop.
 *
 * - `null` / `undefined` → `undefined`
 * - `string` → `[value]` (single-item array)
 * - `string[]` → `string[]`
 */
function toToggleGroupValue(
	raw: string | string[] | null | undefined
): string[] | undefined {
	if (raw === null || raw === undefined) return undefined;
	if (Array.isArray(raw)) return raw;
	return [raw];
}

export function ClassNameItemControl({
	value,
	onChange,
	classProfile,
}: ClassNameItemControlProps) {
	const { config, layoutGroups, layoutOrder } = useMemo(
		() => resolveClassNameControlConfig(classProfile),
		[classProfile]
	);

	// Memoize parsing for performance
	const parsed = useMemo(() => {
		if (value) {
			const tokens = value.trim().split(/\s+/);
			// Parse all keys
			const parsedState = Object.entries(config).reduce(
				(acc, [key, configItem]) => {
					const parsedTokens = tokens.filter((token) =>
						isTailwindClass(
							configItem.possibleTypes.filter(
								(type): type is string => type !== null
							),
							token
						)
					);
					if (parsedTokens.length > 0) {
						(acc as Record<string, unknown>)[key] =
							configItem.multiple
								? parsedTokens
								: parsedTokens[0];
					}
					return acc;
				},
				Object.fromEntries(
					Object.keys(config).map((k) => [k, null])
				) as Record<string, unknown>
			) as StateType;

			// For each group, only allow one key to be active at a time
			const initialSelected: { [groupLabel: string]: string } = {};
			for (const group of layoutGroups) {
				// If multiple keys have values, clear all but the first
				let found = false;
				for (const key of group.keys) {
					if (parsedState[key]) {
						if (found) {
							parsedState[key] = null;
						} else {
							found = true;
							initialSelected[group.label] = key;
						}
					}
				}
				if (!found && group.keys[0]) {
					initialSelected[group.label] = group.keys[0];
				}
			}

			// Find handled tokens
			const handledTokens = new Set<string>();
			for (const v of Object.values(parsedState)) {
				if (Array.isArray(v)) {
					for (const item of v) {
						handledTokens.add(item);
					}
				} else if (v) {
					handledTokens.add(v);
				}
			}
			const unhandledTokens = tokens.filter(
				(token) => !handledTokens.has(token)
			);

			return { parsedState, unhandledTokens, initialSelected };
		}

		// Reset state if value is empty
		const initialSelected: { [groupLabel: string]: string } = {};
		for (const group of layoutGroups) {
			if (group.keys[0]) {
				initialSelected[group.label] = group.keys[0];
			}
		}
		return {
			parsedState: {} as StateType,
			unhandledTokens: [] as string[],
			initialSelected,
		};
	}, [value, config, layoutGroups]);

	const [state, setState] = useState<StateType>(parsed.parsedState);
	const [unhandled, setUnhandled] = useState<string[]>(
		parsed.unhandledTokens
	);
	const [selectedKeys, setSelectedKeys] = useState<{
		[groupLabel: string]: string;
	}>(parsed.initialSelected);

	// Only update state if parsed result changes (deep compare)
	useEffect(() => {
		const stateChanged =
			JSON.stringify(state) !== JSON.stringify(parsed.parsedState);
		const unhandledChanged =
			JSON.stringify(unhandled) !==
			JSON.stringify(parsed.unhandledTokens);
		const selectedChanged =
			JSON.stringify(selectedKeys) !==
			JSON.stringify(parsed.initialSelected);

		if (stateChanged) setState(parsed.parsedState);
		if (unhandledChanged) setUnhandled(parsed.unhandledTokens);
		if (selectedChanged) setSelectedKeys(parsed.initialSelected);
	}, [parsed, state, selectedKeys, unhandled]);

	// Helper to build class string from state and unhandled
	const buildClassString = useCallback(
		(
			customState: StateType = state,
			customUnhandled: string[] = unhandled
		) => {
			const classes: string[] = [];
			for (const key in customState) {
				if (Object.hasOwn(customState, key)) {
					const v = customState[key as keyof StateType];
					if (v) {
						if (Array.isArray(v)) {
							classes.push(...v);
						} else {
							classes.push(v);
						}
					}
				}
			}
			return [...classes, ...customUnhandled].join(" ").trim();
		},
		[state, unhandled]
	);

	// Handler for UI changes (toggles, dropdowns, etc.)
	// `key` accepts `string | number` because some Base UI wrappers
	// pass numeric keys; we coerce to string internally.
	const handleStateChange = useCallback(
		(key: string | number, value: string | string[] | null) => {
			const stringKey = String(key);
			setState((prev) => {
				const newState = { ...prev, [stringKey]: value };
				const group = layoutGroups.find((g) =>
					g.keys.includes(stringKey)
				);
				if (group) {
					setSelectedKeys((prevSel) => ({
						...prevSel,
						[group.label]: stringKey,
					}));
					for (const k of group.keys) {
						if (k !== stringKey) newState[k] = null;
					}
					if (typeof group.clearState === "function") {
						const classesToClear = group.clearState(
							stringKey,
							newState
						);
						setUnhandled((prevUnhandled) =>
							prevUnhandled.filter(
								(token) => !classesToClear.includes(token)
							)
						);
					}
				}

				// Null out values for entries that become invisible
				const layoutOrderItemsInvisible = layoutOrder.filter(
					(item) => item.isVisible && !item.isVisible(newState)
				);
				for (const item of layoutOrderItemsInvisible) {
					if (item.type === "item") {
						newState[item.key] = null;
					} else if (item.type === "group") {
						const invisibleGroup = layoutGroups.find(
							(g) => g.label === item.label
						);
						if (invisibleGroup) {
							for (const k of invisibleGroup.keys) {
								newState[k] = null;
							}
						}
					}
				}

				return newState;
			});
		},
		[layoutGroups, layoutOrder]
	);

	// Helper to create bound change handlers
	const createChangeHandler = useCallback(
		(key: string) => (value: string | string[] | null) =>
			handleStateChange(key, value),
		[handleStateChange]
	);

	// Handler for group key selection
	const handleGroupKeySelect = useCallback(
		(groupLabel: string, key: string) => {
			setSelectedKeys((prev) => ({ ...prev, [groupLabel]: key }));
			const group = layoutGroups.find((g) => g.label === groupLabel);
			if (!group) return;

			setState((prevState) => {
				const newState = { ...prevState };
				let classesToClear: string[] = [];
				if (typeof group.clearState === "function") {
					classesToClear = group.clearState(key, newState);
				}

				for (const k of group.keys) {
					if (k === key) continue;
					const keyConfig = config[k];
					if (!keyConfig) continue;

					if (keyConfig.multiple && Array.isArray(newState[k])) {
						newState[k] = (newState[k] as string[]).filter(
							(v) => !classesToClear.includes(v)
						);
						if (
							Array.isArray(newState[k]) &&
							newState[k].length === 0
						) {
							newState[k] = null;
						}
					} else if (
						typeof newState[k] === "string" &&
						classesToClear.includes(newState[k])
					) {
						newState[k] = null;
					}
				}

				setUnhandled((prevUnhandled) =>
					prevUnhandled.filter(
						(token) => !classesToClear.includes(token)
					)
				);

				if (!newState[key]) newState[key] = null;
				return newState;
			});
		},
		[layoutGroups, config]
	);

	// Call onChange with the new class string after state/unhandled change
	useEffect(() => {
		const classString = buildClassString(state, unhandled);
		onChange(classString);
	}, [state, unhandled, onChange, buildClassString]);

	return (
		<div
			className="w-full"
			data-testid="classname-item-control"
		>
			<div className="flex flex-wrap gap-y-1 px-4 pt-2 pb-4">
				{layoutOrder.map((entry) => {
					if (entry.type === "group") {
						const group = layoutGroups.find(
							(g) => g.label === entry.label
						);
						if (!group) return null;
						const keys = group.keys.map(String);
						const selectedKey =
							selectedKeys[group.label] ?? keys[0];
						if (entry.isVisible && !entry.isVisible(state)) {
							return null;
						}
						if (!selectedKey) return null;
						const groupConfig =
							config[selectedKey as keyof typeof config];
						if (!groupConfig) return null;

						return (
							<div
								className={cn("w-full", entry.className)}
								data-testid={`group-${group.label.toLowerCase().replace(/\s+/g, "-")}`}
								key={group.label}
							>
								<ClassNameGroupControl
									group={group}
									groupConfig={groupConfig}
									handleGroupKeySelect={handleGroupKeySelect}
									handleStateChange={handleStateChange}
									selectedKey={selectedKey}
									state={state}
								/>
							</div>
						);
					}
					if (entry.type === "item") {
						if (entry.isVisible && !entry.isVisible(state)) {
							return null;
						}

						// Coerce to string: `entry.key` is `string | number` in the
						// LAYOUT_ORDER type, but all config keys are strings.
						const configKey = String(entry.key);

						const ungroupedConfig = config[configKey];
						if (!ungroupedConfig) return null;

						return (
							<div
								className={cn("w-full", entry.className)}
								data-testid={`item-${configKey}`}
								key={configKey}
							>
								<ungroupedConfig.component
									{...ungroupedConfig}
									{...("multiple" in ungroupedConfig
										? { multiple: ungroupedConfig.multiple }
										: {})}
									onChange={(event) => {
										// Base UI's ToggleGroup renders its options as
										// <input> elements, so `event.target` is an
										// HTMLInputElement. Narrow to that type before
										// reading `.value`.
										const target = event.target;
										if (
											!(
												target instanceof
												HTMLInputElement
											)
										) {
											return;
										}

										createChangeHandler(configKey)(
											target.value
										);
									}}
									value={toToggleGroupValue(state[configKey])}
								/>
							</div>
						);
					}
					return null;
				})}
			</div>
		</div>
	);
}
