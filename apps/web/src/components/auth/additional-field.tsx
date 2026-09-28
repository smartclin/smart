import { Button } from "@smart/ui/components/button";
import { Calendar } from "@smart/ui/components/calendar";
import { Checkbox } from "@smart/ui/components/checkbox";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@smart/ui/components/combobox";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@smart/ui/components/field";
import { Input } from "@smart/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@smart/ui/components/input-group";
import { Label } from "@smart/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@smart/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import { Slider } from "@smart/ui/components/slider";
import { Switch } from "@smart/ui/components/switch";
import { Textarea } from "@smart/ui/components/textarea";
import { cn } from "@smart/ui/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronDownIcon, Copy } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
	type AdditionalFieldConfig,
	type AdditionalFieldValue,
	resolveInputType,
} from "./types";

const strings = {
	copyToClipboard: "Copy to clipboard",
	time: "Time",
} as const;

export type AdditionalFieldProps = {
	name: string;
	field: AdditionalFieldConfig;
	isPending?: boolean;
};

function toDate(value: unknown): Date | undefined {
	if (value instanceof Date) return value;
	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? undefined : parsed;
	}
	return undefined;
}

const pad = (n: number) => n.toString().padStart(2, "0");

function formatTime(date: Date) {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function defaultValueToString(
	value: AdditionalFieldValue | null | undefined
): string | undefined {
	if (value === null) return undefined;
	if (value instanceof Date) return value.toISOString();
	return String(value);
}

function CopyButton({
	getValue,
	isDisabled,
}: {
	getValue: () => string | undefined;
	isDisabled?: boolean;
}) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		const value = getValue();
		if (!value) return;

		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : String(error));
		}
	}

	return (
		<InputGroupButton
			aria-label={strings.copyToClipboard}
			disabled={isDisabled}
			onClick={handleCopy}
			title={strings.copyToClipboard}
			type="button"
		>
			{copied ? <Check /> : <Copy />}
		</InputGroupButton>
	);
}

export function AdditionalField({
	name,
	field,
	isPending,
}: AdditionalFieldProps) {
	const inputType = resolveInputType(field);
	const inputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string>();

	const inputId = `additional-${name}`;
	const errorId = `${inputId}-error`;

	if (field.render) {
		return (
			<>
				{field.render({
					name,
					field,
					isPending,
					value: field.defaultValue ?? null,
					onBlur: () => {},
					onChange: () => {},
				})}
			</>
		);
	}

	if (inputType === "hidden") {
		const hiddenValue =
			field.defaultValue === null
				? ""
				: field.defaultValue instanceof Date
					? field.defaultValue.toISOString()
					: String(field.defaultValue);

		return (
			<input
				name={name}
				readOnly
				type="hidden"
				value={hiddenValue}
			/>
		);
	}

	if (inputType === "textarea") {
		return (
			<Field data-invalid={!!error}>
				<Label htmlFor={inputId}>{field.label}</Label>

				<Textarea
					aria-describedby={error ? errorId : undefined}
					aria-invalid={!!error}
					defaultValue={defaultValueToString(field.defaultValue)}
					disabled={isPending}
					id={inputId}
					name={name}
					onChange={() => error && setError(undefined)}
					onInvalid={(e) => {
						e.preventDefault();
						setError(
							(e.target as HTMLTextAreaElement).validationMessage
						);
					}}
					placeholder={field.placeholder}
					readOnly={field.readOnly}
					required={field.required}
				/>

				<FieldError id={errorId}>{error}</FieldError>
			</Field>
		);
	}

	if (inputType === "number") {
		const maxFractionDigits = field.formatOptions?.maximumFractionDigits;
		const numDefault =
			field.defaultValue === null
				? undefined
				: typeof field.defaultValue === "number"
					? field.defaultValue
					: String(field.defaultValue);

		return (
			<Field data-invalid={!!error}>
				<Label htmlFor={inputId}>{field.label}</Label>

				<Input
					aria-describedby={error ? errorId : undefined}
					aria-invalid={!!error}
					defaultValue={numDefault}
					disabled={isPending}
					id={inputId}
					inputMode={maxFractionDigits ? "decimal" : "numeric"}
					max={field.max}
					min={field.min}
					name={name}
					onChange={() => error && setError(undefined)}
					onInvalid={(e) => {
						e.preventDefault();
						setError(
							(e.target as HTMLInputElement).validationMessage
						);
					}}
					placeholder={field.placeholder}
					readOnly={field.readOnly}
					required={field.required}
					step={
						field.step ??
						(maxFractionDigits
							? 1 / 10 ** maxFractionDigits
							: undefined)
					}
					type="number"
				/>

				<FieldError id={errorId}>{error}</FieldError>
			</Field>
		);
	}

	if (inputType === "slider") {
		return (
			<SliderField
				field={field}
				isPending={isPending}
				name={name}
			/>
		);
	}

	if (inputType === "switch") {
		return (
			<Field orientation="horizontal">
				<Switch
					defaultChecked={
						field.defaultValue === true ||
						field.defaultValue === "true"
					}
					disabled={isPending || field.readOnly}
					id={inputId}
					name={name}
				/>

				<FieldContent>
					<FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
				</FieldContent>
			</Field>
		);
	}

	if (inputType === "checkbox") {
		return (
			<Field orientation="horizontal">
				<Checkbox
					defaultChecked={
						field.defaultValue === true ||
						field.defaultValue === "true"
					}
					disabled={isPending || field.readOnly}
					id={inputId}
					name={name}
					required={field.required}
				/>

				<FieldContent>
					<FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
				</FieldContent>
			</Field>
		);
	}

	if (inputType === "select") {
		return (
			<Field data-invalid={!!error}>
				<Label htmlFor={inputId}>{field.label}</Label>

				<Select
					defaultValue={
						field.defaultValue === null
							? undefined
							: String(field.defaultValue)
					}
					disabled={isPending || field.readOnly}
					name={name}
					required={field.required}
				>
					<SelectTrigger
						aria-describedby={error ? errorId : undefined}
						aria-invalid={!!error}
						className="w-full"
						id={inputId}
					>
						<SelectValue placeholder={field.placeholder} />
					</SelectTrigger>

					<SelectContent>
						{field.options?.map((option) => (
							<SelectItem
								key={option.value}
								value={option.value}
							>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<FieldError id={errorId}>{error}</FieldError>
			</Field>
		);
	}

	if (inputType === "combobox") {
		return (
			<Field data-invalid={!!error}>
				<Label htmlFor={inputId}>{field.label}</Label>

				<Combobox
					defaultValue={
						field.defaultValue === null
							? undefined
							: String(field.defaultValue)
					}
					disabled={isPending || field.readOnly}
					items={field.options ?? []}
					name={name}
					required={field.required}
				>
					<ComboboxInput
						aria-describedby={error ? errorId : undefined}
						aria-invalid={!!error}
						id={inputId}
						placeholder={field.placeholder}
					/>

					<ComboboxContent>
						<ComboboxEmpty>No items found.</ComboboxEmpty>

						<ComboboxList>
							{(option) => (
								<ComboboxItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</ComboboxItem>
							)}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>

				<FieldError id={errorId}>{error}</FieldError>
			</Field>
		);
	}

	if (inputType === "date" || inputType === "datetime") {
		return (
			<DateInput
				field={field}
				isPending={isPending}
				name={name}
			/>
		);
	}

	// inputType === "input"
	const hasPrefix = field.prefix !== null;
	const hasSuffix = field.suffix !== null || !!field.copyable;

	const isNumeric = field.type === "number";
	const maxFractionDigits = field.formatOptions?.maximumFractionDigits;
	const nativeInputType = isNumeric ? "number" : undefined;
	const nativeInputMode = isNumeric
		? maxFractionDigits
			? "decimal"
			: "numeric"
		: undefined;
	const nativeStep = maxFractionDigits
		? 1 / 10 ** maxFractionDigits
		: undefined;

	if (hasPrefix || hasSuffix) {
		return (
			<Field data-invalid={!!error}>
				<Label htmlFor={inputId}>{field.label}</Label>

				<InputGroup>
					{hasPrefix && (
						<InputGroupAddon align="inline-start">
							{field.prefix}
						</InputGroupAddon>
					)}

					<InputGroupInput
						aria-describedby={error ? errorId : undefined}
						aria-invalid={!!error}
						defaultValue={defaultValueToString(field.defaultValue)}
						disabled={isPending}
						id={inputId}
						inputMode={nativeInputMode}
						name={name}
						onChange={() => error && setError(undefined)}
						onInvalid={(e) => {
							e.preventDefault();
							setError(
								(e.target as HTMLInputElement).validationMessage
							);
						}}
						placeholder={field.placeholder}
						readOnly={field.readOnly}
						ref={inputRef}
						required={field.required}
						step={nativeStep}
						type={nativeInputType}
					/>

					{field.copyable ? (
						<InputGroupAddon align="inline-end">
							<CopyButton
								getValue={() => inputRef.current?.value}
								isDisabled={isPending}
							/>
						</InputGroupAddon>
					) : (
						field.suffix !== null && (
							<InputGroupAddon align="inline-end">
								{field.suffix}
							</InputGroupAddon>
						)
					)}
				</InputGroup>

				<FieldError id={errorId}>{error}</FieldError>
			</Field>
		);
	}

	return (
		<Field data-invalid={!!error}>
			<Label htmlFor={inputId}>{field.label}</Label>

			<Input
				aria-describedby={error ? errorId : undefined}
				aria-invalid={!!error}
				defaultValue={defaultValueToString(field.defaultValue)}
				disabled={isPending}
				id={inputId}
				inputMode={nativeInputMode}
				name={name}
				onChange={() => error && setError(undefined)}
				onInvalid={(e) => {
					e.preventDefault();
					setError((e.target as HTMLInputElement).validationMessage);
				}}
				placeholder={field.placeholder}
				readOnly={field.readOnly}
				required={field.required}
				step={nativeStep}
				type={nativeInputType}
			/>

			<FieldError id={errorId}>{error}</FieldError>
		</Field>
	);
}

function SliderField({ name, field, isPending }: AdditionalFieldProps) {
	const maxFractionDigits = field.formatOptions?.maximumFractionDigits;
	const min = field.min ?? 0;
	const max = field.max ?? 100;
	const step =
		field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1);

	const initial = useMemo(() => {
		if (typeof field.defaultValue === "number") return field.defaultValue;
		if (field.defaultValue !== null) return Number(field.defaultValue);
		return min;
	}, [field.defaultValue, min]);

	const [value, setValue] = useState<number>(initial);
	const [prevInitial, setPrevInitial] = useState(initial);

	if (prevInitial !== initial) {
		setPrevInitial(initial);
		if (value !== initial) setValue(initial);
	}

	const formatter = useMemo(
		() => new Intl.NumberFormat(undefined, field.formatOptions),
		[field.formatOptions]
	);
	const inputId = `additional-${name}`;

	return (
		<Field>
			<div className="flex items-center justify-between gap-2">
				<Label htmlFor={inputId}>{field.label}</Label>
				<span className="text-muted-foreground text-sm tabular-nums">
					{formatter.format(value)}
				</span>
			</div>

			<Slider
				disabled={isPending || field.readOnly}
				id={inputId}
				max={max}
				min={min}
				name={name}
				onValueChange={(v) =>
					setValue((Array.isArray(v) ? v[0] : v) ?? min)
				}
				step={step}
				value={[value]}
			/>
		</Field>
	);
}

function DateInput({ name, field, isPending }: AdditionalFieldProps) {
	const inputType = resolveInputType(field);
	const isDateTime = inputType === "datetime";

	const [date, setDate] = useState<Date | undefined>(
		toDate(field.defaultValue)
	);
	const [time, setTime] = useState<string>(
		isDateTime && date ? formatTime(date) : ""
	);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string>();

	const inputId = `additional-${name}`;
	const errorId = `${inputId}-error`;

	const formValue = useMemo(() => {
		if (!date) return "";
		if (isDateTime && time && time.trim() !== "") {
			const [h = "0", m = "0", s = "0"] = time.split(":");
			const combined = new Date(date);
			combined.setHours(Number(h), Number(m), Number(s), 0);
			return combined.toISOString();
		}
		const localMidnight = new Date(date);
		localMidnight.setHours(0, 0, 0, 0);
		return localMidnight.toISOString();
	}, [date, time, isDateTime]);

	return (
		<Field data-invalid={!!error}>
			<Label htmlFor={`${inputId}-date`}>{field.label}</Label>

			<div className="relative flex gap-2">
				<input
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 size-full opacity-0"
					name={name}
					onInvalid={(e) => {
						e.preventDefault();
						setError(
							(e.target as HTMLInputElement).validationMessage
						);
					}}
					readOnly
					required={field.required}
					tabIndex={-1}
					type="text"
					value={formValue}
				/>

				<Popover
					onOpenChange={setOpen}
					open={open}
				>
					<PopoverTrigger asChild>
						<Button
							aria-describedby={error ? errorId : undefined}
							aria-invalid={!!error}
							className={cn(
								"flex-1 justify-between font-normal",
								"data-[empty=true]:text-muted-foreground"
							)}
							data-empty={!date}
							disabled={isPending || field.readOnly}
							id={`${inputId}-date`}
							type="button"
							variant="outline"
						>
							{date ? (
								format(date, "PPP")
							) : (
								<span>{field.placeholder}</span>
							)}
							{isDateTime ? (
								<ChevronDownIcon />
							) : (
								<CalendarIcon />
							)}
						</Button>
					</PopoverTrigger>

					<PopoverContent
						align="start"
						className="w-auto overflow-hidden p-0"
					>
						<Calendar
							captionLayout="dropdown"
							defaultMonth={date}
							mode="single"
							onSelect={(value) => {
								setDate(value);
								if (value) setError(undefined);
								if (!isDateTime) setOpen(false);
							}}
							selected={date}
						/>
					</PopoverContent>
				</Popover>

				{isDateTime && (
					<Field className="w-32">
						<Label
							className="sr-only"
							htmlFor={`${inputId}-time`}
						>
							{strings.time}
						</Label>

						<Input
							className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
							disabled={isPending || field.readOnly}
							id={`${inputId}-time`}
							onChange={(e) => setTime(e.target.value)}
							step="1"
							type="time"
							value={time}
						/>
					</Field>
				)}
			</div>

			<FieldError id={errorId}>{error}</FieldError>
		</Field>
	);
}
