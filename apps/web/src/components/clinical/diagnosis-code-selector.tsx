import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@smart/ui/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@smart/ui/components/popover";
import { cn } from "@smart/ui/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// Common pediatric ICD-10 codes
const PEDIATRIC_ICD10_CODES = [
	// Well-child visits
	{
		code: "Z00.121",
		description:
			"Encounter for routine child health exam with abnormal findings",
		category: "well-child",
	},
	{
		code: "Z00.129",
		description:
			"Encounter for routine child health exam without abnormal findings",
		category: "well-child",
	},

	// Infectious
	{
		code: "J06.9",
		description: "Acute upper respiratory infection, unspecified",
		category: "infectious",
	},
	{
		code: "J02.9",
		description: "Acute pharyngitis, unspecified",
		category: "infectious",
	},
	{
		code: "H66.90",
		description: "Otitis media, unspecified, unspecified ear",
		category: "infectious",
	},
	{
		code: "J20.9",
		description: "Acute bronchitis, unspecified",
		category: "infectious",
	},
	{
		code: "A09",
		description: "Infectious gastroenteritis and colitis, unspecified",
		category: "infectious",
	},
	{
		code: "B34.9",
		description: "Viral infection, unspecified",
		category: "infectious",
	},
	{
		code: "L20.9",
		description: "Atopic dermatitis, unspecified",
		category: "infectious",
	},

	// Developmental
	{
		code: "F80.1",
		description: "Expressive language disorder",
		category: "developmental",
	},
	{
		code: "F80.2",
		description: "Mixed receptive-expressive language disorder",
		category: "developmental",
	},
	{
		code: "F90.0",
		description:
			"Attention-deficit hyperactivity disorder, predominantly inattentive type",
		category: "developmental",
	},
	{
		code: "F90.1",
		description:
			"Attention-deficit hyperactivity disorder, predominantly hyperactive type",
		category: "developmental",
	},
	{
		code: "F90.2",
		description: "Attention-deficit hyperactivity disorder, combined type",
		category: "developmental",
	},
	{
		code: "F84.0",
		description: "Autistic disorder",
		category: "developmental",
	},

	// Chronic conditions
	{
		code: "J45.20",
		description: "Mild intermittent asthma, uncomplicated",
		category: "chronic",
	},
	{
		code: "J45.30",
		description: "Mild persistent asthma, uncomplicated",
		category: "chronic",
	},
	{
		code: "J45.40",
		description: "Moderate persistent asthma, uncomplicated",
		category: "chronic",
	},
	{
		code: "E11.9",
		description: "Type 2 diabetes mellitus without complications",
		category: "chronic",
	},
	{
		code: "E10.9",
		description: "Type 1 diabetes mellitus without complications",
		category: "chronic",
	},
	{
		code: "K21.0",
		description: "Gastro-esophageal reflux disease with esophagitis",
		category: "chronic",
	},
	{
		code: "K21.9",
		description: "Gastro-esophageal reflux disease without esophagitis",
		category: "chronic",
	},

	// Injuries
	{ code: "S00.01", description: "Abrasion of scalp", category: "injury" },
	{
		code: "S60.011",
		description: "Contusion of right thumb without damage to nail",
		category: "injury",
	},
	{
		code: "S93.401",
		description: "Sprain of unspecified ligament of right ankle",
		category: "injury",
	},
];

type Category = "common" | "infectious" | "developmental" | "chronic" | "all";

interface DiagnosisCodeSelectorProps {
	category?: Category;
	className?: string;
	maxCodes?: number;
	multiple?: boolean;
	onChange?: (codes: string[]) => void;
	placeholder?: string;
	required?: boolean;
	value?: string[];
}

export function DiagnosisCodeSelector({
	className,
	placeholder = "Search ICD-10 codes...",
	category = "all",
	multiple = true,
	maxCodes = 5,
	value = [],
	onChange,
}: DiagnosisCodeSelectorProps) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<string[]>(value);

	const filteredCodes = useMemo(() => {
		if (category === "all") return PEDIATRIC_ICD10_CODES;
		return PEDIATRIC_ICD10_CODES.filter(
			(code) =>
				code.category === category || code.category === "well-child"
		);
	}, [category]);

	const handleSelect = useCallback(
		(code: string) => {
			let updated: string[];

			if (multiple) {
				if (selected.includes(code)) {
					updated = selected.filter((c) => c !== code);
				} else if (selected.length < maxCodes) {
					updated = [...selected, code];
				} else {
					return; // Max reached
				}
			} else {
				updated = [code];
				setOpen(false);
			}

			setSelected(updated);
			onChange?.(updated);
		},
		[selected, multiple, maxCodes, onChange]
	);

	const handleRemove = useCallback(
		(code: string) => {
			const updated = selected.filter((c) => c !== code);
			setSelected(updated);
			onChange?.(updated);
		},
		[selected, onChange]
	);

	const getCodeDetails = (code: string) =>
		PEDIATRIC_ICD10_CODES.find((c) => c.code === code);

	return (
		<div className={cn("space-y-2", className)}>
			<Popover
				onOpenChange={setOpen}
				open={open}
			>
				<PopoverTrigger
					render={
						<Button
							aria-expanded={open}
							className="w-full justify-between"
							role="combobox"
							variant="outline"
						>
							{selected.length === 0 ? (
								<span className="text-muted-foreground">
									{placeholder}
								</span>
							) : (
								<span>{selected.length} code(s) selected</span>
							)}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					}
				/>
				<PopoverContent
					align="start"
					className="w-full p-0"
				>
					<Command>
						<CommandInput placeholder="Search diagnosis codes..." />
						<CommandList>
							<CommandEmpty>No codes found.</CommandEmpty>
							<CommandGroup>
								{filteredCodes.map((item) => (
									<CommandItem
										key={item.code}
										onSelect={() => handleSelect(item.code)}
										value={`${item.code} ${item.description}`}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												selected.includes(item.code)
													? "opacity-100"
													: "opacity-0"
											)}
										/>
										<div className="flex flex-col">
											<span className="font-mono font-semibold text-xs">
												{item.code}
											</span>
											<span className="text-muted-foreground text-xs">
												{item.description}
											</span>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{/* Selected codes display */}
			{selected.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{selected.map((code) => {
						const details = getCodeDetails(code);
						return (
							<Badge
								className="flex items-center gap-1 pr-1"
								key={code}
								variant="secondary"
							>
								<span className="font-mono text-xs">
									{code}
								</span>
								{!multiple && details && (
									<span className="max-w-[150px] truncate text-muted-foreground text-xs">
										{details.description}
									</span>
								)}
								<button
									className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
									onClick={() => handleRemove(code)}
									type="button"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						);
					})}
				</div>
			)}

			{multiple && (
				<p className="text-muted-foreground text-xs">
					{selected.length}/{maxCodes} codes selected
				</p>
			)}
		</div>
	);
}
