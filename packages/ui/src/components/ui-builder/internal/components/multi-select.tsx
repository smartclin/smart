import { Badge } from "@smart/ui/components/badge";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@smart/ui/components/command";
import { useDebounce } from "@smart/ui/hooks/use-debounce";
import { cn } from "@smart/ui/lib/utils";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";

const EMPTY_ARRAY: Option[] = [];

export interface Option {
	disable?: boolean;
	/** fixed option that can't be removed. */
	fixed?: boolean;
	label: string;
	value: string;
	/** Group the options by providing key. */
	[key: string]: string | boolean | undefined;
}
interface GroupOption {
	[key: string]: Option[];
}

interface MultipleSelectorProps {
	badgeClassName?: string;
	className?: string;
	/** Props of `Command` */
	commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
	/** Allow user to create option when there is no option matched. */
	creatable?: boolean;
	defaultOptions?: Option[];
	/** Debounce time for async search. Only work with `onSearch`. */
	delay?: number;
	disabled?: boolean;
	/** Empty component. */
	emptyIndicator?: React.ReactNode;
	/** Group the options base on provided key. */
	groupBy?: string;
	/** hide the clear all button. */
	hideClearAllButton?: boolean;
	/** Hide the placeholder when there are options selected. */
	hidePlaceholderWhenSelected?: boolean;
	/** Props of `CommandInput` */
	inputProps?: Omit<
		React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
		"value" | "placeholder" | "disabled"
	>;
	/** Loading component. */
	loadingIndicator?: React.ReactNode;
	/** Limit the maximum number of selected options. */
	maxSelected?: number;
	onChange?: (options: Option[]) => void;
	/** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
	onMaxSelected?: (maxLimit: number) => void;
	/** async search */
	onSearch?: (value: string) => Promise<Option[]>;
	/**
	 * sync search. This search will not showing loadingIndicator.
	 * The rest props are the same as async search.
	 * i.e.: creatable, groupBy, delay.
	 */
	onSearchSync?: (value: string) => Option[];
	/** manually controlled options */
	options?: Option[];
	placeholder?: string;
	ref?: React.Ref<MultipleSelectorRef>;
	/**
	 * First item selected is a default behavior by cmdk. That is why the default is true.
	 * This is a workaround solution by add a dummy item.
	 *
	 * @reference: https://github.com/pacocoursey/cmdk/issues/171
	 */
	selectFirstItem?: boolean;
	/**
	 * Only work with `onSearch` prop. Trigger search when `onFocus`.
	 * For example, when user click on the input, it will trigger the search to get initial options.
	 */
	triggerSearchOnFocus?: boolean;
	value?: Option[];
}

export interface MultipleSelectorRef {
	focus: () => void;
	input: HTMLInputElement;
	reset: () => void;
	selectedValue: Option[];
}

/* ------------------------------------------------------------------ */
/* Module-scope helpers                                                */
/* ------------------------------------------------------------------ */

function transToGroupOption(options: Option[], groupBy?: string): GroupOption {
	if (options.length === 0) {
		return {};
	}
	if (!groupBy) {
		return { "": options };
	}

	const groupOption: GroupOption = {};
	for (const option of options) {
		const key = (option[groupBy] as string) || "";
		if (!groupOption[key]) {
			groupOption[key] = [];
		}
		groupOption[key].push(option);
	}
	return groupOption;
}

function removePickedOption(
	groupOption: GroupOption,
	picked: Option[]
): GroupOption {
	const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;

	for (const [key, value] of Object.entries(cloneOption)) {
		cloneOption[key] = value.filter(
			(val) => !picked.find((p) => p.value === val.value)
		);
	}
	return cloneOption;
}

function isOptionsExist(
	groupOption: GroupOption,
	targetOption: Option[]
): boolean {
	for (const [, value] of Object.entries(groupOption)) {
		if (
			value.some((option) =>
				targetOption.find((p) => p.value === option.value)
			)
		) {
			return true;
		}
	}
	return false;
}

/* ------------------------------------------------------------------ */
/* CommandEmpty                                                        */
/* ------------------------------------------------------------------ */

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * The `cmdk-empty` attribute is what cmdk uses internally to identify its
 * empty slot. TypeScript's JSX doesn't know about it, so we spread it via
 * `{...{ "cmdk-empty": "" }}` to avoid the "unknown attribute" diagnostic.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 */
const CMDK_EMPTY_ATTR = { "cmdk-empty": "" } as const;

const CommandEmpty = ({
	className,
	ref,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty> & {
	ref?: React.Ref<HTMLDivElement>;
}) => {
	const render = useCommandState((state) => state.filtered.count === 0);

	if (!render) return null;

	return (
		<div
			aria-live="polite"
			className={cn("py-6 text-center text-sm", className)}
			ref={ref}
			role="status"
			{...CMDK_EMPTY_ATTR}
			{...props}
		/>
	);
};

CommandEmpty.displayName = "CommandEmpty";
/* ------------------------------------------------------------------ */
/* OptionBadge — module scope (fixes noNestedComponentDefinitions)     */
/* ------------------------------------------------------------------ */

interface OptionBadgeProps {
	badgeClassName?: string;
	disabled?: boolean;
	onUnselect: (option: Option) => void;
	option: Option;
}

const OptionBadge = ({
	option,
	onUnselect,
	badgeClassName,
	disabled,
}: OptionBadgeProps) => {
	const handleUnselect = useCallback(() => {
		onUnselect(option);
	}, [onUnselect, option]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLButtonElement>) => {
			if (e.key === "Enter") {
				onUnselect(option);
			}
		},
		[onUnselect, option]
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			e.stopPropagation();
		},
		[]
	);

	return (
		<Badge
			className={cn(
				"data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
				"data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
				badgeClassName
			)}
			data-disabled={disabled || undefined}
			data-fixed={option.fixed}
		>
			{option.label}
			<button
				className={cn(
					"ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
					(disabled || option.fixed) && "hidden"
				)}
				onClick={handleUnselect}
				onKeyDown={handleKeyDown}
				onMouseDown={handleMouseDown}
				type="button"
			>
				<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
			</button>
		</Badge>
	);
};

/* ------------------------------------------------------------------ */
/* CommandGroupItem — module scope                                     */
/* ------------------------------------------------------------------ */

interface CommandGroupItemProps {
	onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
	onSelect: (option: Option) => void;
	option: Option;
}

const CommandGroupItem = ({
	option,
	onSelect,
	onMouseDown,
}: CommandGroupItemProps) => {
	const handleSelect = useCallback(() => {
		onSelect(option);
	}, [onSelect, option]);

	return (
		<CommandItem
			className={cn(
				"cursor-pointer",
				option.disable && "cursor-default text-muted-foreground"
			)}
			disabled={option.disable}
			onMouseDown={onMouseDown}
			onSelect={handleSelect}
			value={option.value}
		>
			{option.label}
		</CommandItem>
	);
};

/* ------------------------------------------------------------------ */
/* CreatableItem — module scope                                        */
/* ------------------------------------------------------------------ */

interface CreatableItemProps {
	creatable: boolean;
	debouncedSearchTerm: string;
	inputValue: string;
	isLoading: boolean;
	onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
	onSearch?: (value: string) => Promise<Option[]>;
	onSelect: (value: string) => void;
	options: GroupOption;
	selected: Option[];
}

const CreatableItem = ({
	creatable,
	debouncedSearchTerm,
	inputValue,
	isLoading,
	onMouseDown,
	onSearch,
	onSelect,
	options,
	selected,
}: CreatableItemProps) => {
	if (!creatable) return null;

	const targetOption: Option[] = [{ value: inputValue, label: inputValue }];

	if (
		isOptionsExist(options, targetOption) ||
		selected.find((s) => s.value === inputValue)
	) {
		return null;
	}

	// For normal creatable
	if (!onSearch && inputValue.length > 0) {
		return (
			<CommandItem
				className="cursor-pointer"
				onMouseDown={onMouseDown}
				onSelect={onSelect}
				value={inputValue}
			>
				{`Create "${inputValue}"`}
			</CommandItem>
		);
	}

	// For async search creatable. Avoid showing creatable item before loading at first.
	if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
		return (
			<CommandItem
				className="cursor-pointer"
				onMouseDown={onMouseDown}
				onSelect={onSelect}
				value={inputValue}
			>
				{`Create "${inputValue}"`}
			</CommandItem>
		);
	}

	return null;
};

/* ------------------------------------------------------------------ */
/* EmptyItem — module scope                                            */
/* ------------------------------------------------------------------ */

interface EmptyItemProps {
	creatable: boolean;
	emptyIndicator?: React.ReactNode;
	onSearch?: (value: string) => Promise<Option[]>;
	options: GroupOption;
}

const EmptyItem = ({
	creatable,
	emptyIndicator,
	onSearch,
	options,
}: EmptyItemProps) => {
	if (!emptyIndicator) return null;

	// For async search that showing emptyIndicator
	if (onSearch && !creatable && Object.keys(options).length === 0) {
		return (
			<CommandItem
				disabled
				value="-"
			>
				{emptyIndicator}
			</CommandItem>
		);
	}

	return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
};

/* ------------------------------------------------------------------ */
/* MultipleSelector                                                    */
/* ------------------------------------------------------------------ */

const MultipleSelector = ({
	value,
	onChange,
	placeholder,
	defaultOptions: arrayDefaultOptions = EMPTY_ARRAY,
	options: arrayOptions,
	delay,
	onSearch,
	onSearchSync,
	loadingIndicator,
	emptyIndicator,
	maxSelected = Number.MAX_SAFE_INTEGER,
	onMaxSelected,
	hidePlaceholderWhenSelected,
	disabled,
	groupBy,
	className,
	badgeClassName,
	selectFirstItem = true,
	creatable = false,
	triggerSearchOnFocus = false,
	commandProps,
	inputProps,
	hideClearAllButton = false,
	ref,
}: MultipleSelectorProps) => {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [open, setOpen] = React.useState(false);
	const [onScrollbar, setOnScrollbar] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	const [selected, setSelected] = React.useState<Option[]>(
		value || EMPTY_ARRAY
	);
	const [options, setOptions] = React.useState<GroupOption>(
		transToGroupOption(arrayDefaultOptions, groupBy)
	);
	const [inputValue, setInputValue] = React.useState("");
	const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

	const selectedValue = useMemo(
		() => ({
			selectedValue: [...selected],
			input: inputRef.current as HTMLInputElement,
			focus: () => inputRef.current?.focus(),
			reset: () => setSelected([]),
		}),
		[selected]
	);

	React.useImperativeHandle(ref, () => selectedValue, [selectedValue]);

	// `handleClickOutside` was previously defined inline and used as a
	// hook dependency, which is unstable. Wrapped in a ref so the
	// effect can call the latest version without re-subscribing.
	const handleClickOutsideRef = useRef<
		(event: MouseEvent | TouchEvent) => void
	>(() => {});
	handleClickOutsideRef.current = (event) => {
		const target = event.target as Node | null;
		if (!target) return;
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(target) &&
			inputRef.current &&
			!inputRef.current.contains(target)
		) {
			setOpen(false);
			inputRef.current.blur();
		}
	};

	const handleUnselect = useCallback(
		(option: Option) => {
			const newOptions = selected.filter((s) => s.value !== option.value);
			setSelected(newOptions);
			onChange?.(newOptions);
		},
		[onChange, selected]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const input = inputRef.current;
			if (!input) return;

			if (
				(e.key === "Delete" || e.key === "Backspace") &&
				input.value === "" &&
				selected.length > 0
			) {
				const lastSelectOption = selected.at(-1);
				if (lastSelectOption && !lastSelectOption.fixed) {
					handleUnselect(lastSelectOption);
				}
			}
			if (e.key === "Escape") {
				input.blur();
			}
		},
		[handleUnselect, selected]
	);

	// Click-outside effect. Depends only on `open`; the ref carries
	// the latest handler.
	useEffect(() => {
		if (!open) return;

		const listener = (event: MouseEvent | TouchEvent) =>
			handleClickOutsideRef.current(event);

		document.addEventListener("mousedown", listener);
		document.addEventListener("touchend", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchend", listener);
		};
	}, [open]);

	useEffect(() => {
		if (value) {
			setSelected(value);
		}
	}, [value]);

	useEffect(() => {
		/** If `onSearch` is provided, do not trigger options updated. */
		if (!arrayOptions || onSearch) {
			return;
		}
		const newOption = transToGroupOption(
			arrayOptions || EMPTY_ARRAY,
			groupBy
		);
		if (JSON.stringify(newOption) !== JSON.stringify(options)) {
			setOptions(newOption);
		}
	}, [arrayOptions, groupBy, onSearch, options]);

	useEffect(() => {
		/** sync search */
		const doSearchSync = () => {
			const res = onSearchSync?.(debouncedSearchTerm);
			setOptions(transToGroupOption(res || [], groupBy));
		};

		if (!(onSearchSync && open)) return;

		if (triggerSearchOnFocus || debouncedSearchTerm) {
			doSearchSync();
		}
	}, [
		debouncedSearchTerm,
		groupBy,
		open,
		triggerSearchOnFocus,
		onSearchSync,
	]);

	useEffect(() => {
		/** async search */
		const doSearch = async () => {
			setIsLoading(true);
			try {
				const res = await onSearch?.(debouncedSearchTerm);
				setOptions(transToGroupOption(res || [], groupBy));
			} finally {
				setIsLoading(false);
			}
		};

		if (!(onSearch && open)) return;

		if (triggerSearchOnFocus || debouncedSearchTerm) {
			void doSearch();
		}
	}, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearch]);

	const handleCommandKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			handleKeyDown(e);
			commandProps?.onKeyDown?.(e);
		},
		[handleKeyDown, commandProps]
	);

	const handleBadgeGroupClick = useCallback(() => {
		if (disabled) return;
		inputRef.current?.focus();
	}, [disabled]);

	const handleCommandItemMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
		},
		[]
	);

	const handleCommandItemSelect = useCallback(
		(selectedValue: string) => {
			if (selected.length >= maxSelected) {
				onMaxSelected?.(selected.length);
				return;
			}
			setInputValue("");
			const newOptions = [
				...selected,
				{ value: selectedValue, label: selectedValue },
			];
			setSelected(newOptions);
			onChange?.(newOptions);
		},
		[maxSelected, onMaxSelected, selected, onChange]
	);

	const selectables = React.useMemo<GroupOption>(
		() => removePickedOption(options, selected),
		[options, selected]
	);

	/** Avoid Creatable Selector freezing or lagging when paste a long string. */
	const commandFilter = React.useCallback(() => {
		if (commandProps?.filter) {
			return commandProps.filter;
		}

		if (creatable) {
			return (value: string, search: string) =>
				value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
		}
		return undefined;
	}, [creatable, commandProps?.filter]);

	const handlePrimitiveInputValueChange = useCallback(
		(val: string) => {
			setInputValue(val);
			inputProps?.onValueChange?.(val);
		},
		[inputProps]
	);

	const handlePrimitiveInputBlur = useCallback(
		(event: React.FocusEvent<HTMLInputElement, Element>) => {
			if (!onScrollbar) {
				setOpen(false);
			}
			inputProps?.onBlur?.(event);
		},
		[onScrollbar, inputProps]
	);

	const handlePrimitiveInputFocus = useCallback(
		(event: React.FocusEvent<HTMLInputElement, Element>) => {
			setOpen(true);
			if (triggerSearchOnFocus) {
				void onSearch?.(debouncedSearchTerm);
			}
			inputProps?.onFocus?.(event);
		},
		[triggerSearchOnFocus, debouncedSearchTerm, inputProps, onSearch]
	);

	const handleClearAllButtonClick = useCallback(() => {
		const fixedOptions = selected.filter((s) => s.fixed);
		setSelected(fixedOptions);
		onChange?.(fixedOptions);
	}, [selected, onChange]);

	const handleCommandListMouseLeave = useCallback(() => {
		setOnScrollbar(false);
	}, []);

	const handleCommandListMouseEnter = useCallback(() => {
		setOnScrollbar(true);
	}, []);

	const handleCommandListMouseUp = useCallback(() => {
		inputRef.current?.focus();
	}, []);

	const handleCommandGroupItemMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
		},
		[]
	);

	const handleCommandGroupItemSelect = useCallback(
		(option: Option) => {
			if (selected.length >= maxSelected) {
				onMaxSelected?.(selected.length);
				return;
			}
			setInputValue("");
			const newOptions = [...selected, option];
			setSelected(newOptions);
			onChange?.(newOptions);
		},
		[maxSelected, onMaxSelected, selected, onChange]
	);

	return (
		<Command
			ref={dropdownRef}
			{...commandProps}
			className={cn(
				"h-auto overflow-visible bg-transparent",
				commandProps?.className
			)}
			filter={commandFilter()}
			onKeyDown={handleCommandKeyDown}
			shouldFilter={
				commandProps?.shouldFilter === undefined
					? !onSearch
					: commandProps.shouldFilter
			}
		>
			<div
				className={cn(
					"min-h-10 rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
					{
						"px-3 py-2": selected.length !== 0,
						"cursor-text": !disabled && selected.length !== 0,
					},
					className
				)}
				onClick={handleBadgeGroupClick}
			>
				<div className="relative flex flex-wrap gap-1">
					{selected.map((option) => (
						<OptionBadge
							badgeClassName={badgeClassName}
							disabled={disabled}
							key={option.value}
							onUnselect={handleUnselect}
							option={option}
						/>
					))}
					{/* Avoid having the "Search" Icon */}
					<CommandPrimitive.Input
						{...inputProps}
						className={cn(
							"flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
							{
								"w-full": hidePlaceholderWhenSelected,
								"px-3 py-2": selected.length === 0,
								"ml-1": selected.length !== 0,
							},
							inputProps?.className
						)}
						disabled={disabled}
						onBlur={handlePrimitiveInputBlur}
						onFocus={handlePrimitiveInputFocus}
						onValueChange={handlePrimitiveInputValueChange}
						placeholder={
							hidePlaceholderWhenSelected && selected.length !== 0
								? ""
								: placeholder
						}
						ref={inputRef}
						value={inputValue}
					/>
					<button
						className={cn(
							"absolute right-0 h-6 w-6 p-0",
							(hideClearAllButton ||
								disabled ||
								selected.length < 1 ||
								selected.filter((s) => s.fixed).length ===
									selected.length) &&
								"hidden"
						)}
						onClick={handleClearAllButtonClick}
						type="button"
					>
						<X />
					</button>
				</div>
			</div>
			<div className="relative">
				{open && (
					<CommandList
						className="absolute top-1 z-10 w-full animate-in rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
						onMouseEnter={handleCommandListMouseEnter}
						onMouseLeave={handleCommandListMouseLeave}
						onMouseUp={handleCommandListMouseUp}
					>
						{isLoading ? (
							loadingIndicator
						) : (
							<>
								<EmptyItem
									creatable={creatable}
									emptyIndicator={emptyIndicator}
									onSearch={onSearch}
									options={options}
								/>
								<CreatableItem
									creatable={creatable}
									debouncedSearchTerm={debouncedSearchTerm}
									inputValue={inputValue}
									isLoading={isLoading}
									onMouseDown={handleCommandItemMouseDown}
									onSearch={onSearch}
									onSelect={handleCommandItemSelect}
									options={options}
									selected={selected}
								/>
								{!selectFirstItem && (
									<CommandItem
										className="hidden"
										value="-"
									/>
								)}
								{Object.entries(selectables).map(
									([key, dropdowns]) => (
										<CommandGroup
											className="h-full overflow-auto"
											heading={key}
											key={key}
										>
											{dropdowns.map((option) => (
												<CommandGroupItem
													key={option.value}
													onMouseDown={
														handleCommandGroupItemMouseDown
													}
													onSelect={
														handleCommandGroupItemSelect
													}
													option={option}
												/>
											))}
										</CommandGroup>
									)
								)}
							</>
						)}
					</CommandList>
				)}
			</div>
		</Command>
	);
};

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;
