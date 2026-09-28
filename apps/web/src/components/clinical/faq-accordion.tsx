// apps/web/src/components/clinical/faq-accordion.tsx

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@smart/ui/components/accordion";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { cn } from "@smart/ui/lib/utils";
import type { ReactNode } from "react";

interface FaqItem {
	answer: string;
	question: string;
}

const DEFAULT_FAQS: readonly FaqItem[] = [
	{
		question: "What should I bring to my child's first visit?",
		answer: "Please bring your child's immunization records, insurance card, a list of current medications, and any previous medical records you have.",
	},
	{
		question: "How often should my child have well-child visits?",
		answer: "Well-child visits typically follow the schedule: newborn, 1, 2, 4, 6, 9, 12, 15, 18, and 24 months, then annually. Your pediatrician may adjust the schedule based on your child's needs.",
	},
	{
		question: "When should I call the clinic after hours?",
		answer: "Call immediately for fever over 100.4°F in infants under 3 months, difficulty breathing, persistent vomiting, signs of dehydration, or any emergency. For non-urgent concerns, leave a message and we'll return your call.",
	},
	{
		question: "Do you accept insurance?",
		answer: "We accept most major insurance plans. Please contact our front desk to verify your specific plan before your visit.",
	},
	{
		question: "How do I request prescription refills?",
		answer: "You can request refills through the patient portal, by phone, or during your visit. Please allow 24–48 hours for processing.",
	},
];

interface FaqAccordionProps {
	children?: ReactNode;
	className?: string;
	/** Initially expanded item values, e.g. `"faq-0"`. */
	defaultValue?: string | readonly string[];
	/** FAQ entries. */
	items?: readonly FaqItem[];
	/** Card heading. Set to `null` to render without a title. */
	title?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Items
// ─────────────────────────────────────────────────────────────────────────────

function FaqItems({ items }: { items: readonly FaqItem[] }) {
	return (
		<>
			{items.map((item, index) => (
				<AccordionItem
					key={`${item.question}-${index}`}
					value={`faq-${index}`}
				>
					<AccordionTrigger>{item.question}</AccordionTrigger>
					<AccordionContent>{item.answer}</AccordionContent>
				</AccordionItem>
			))}
		</>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

export function FaqAccordion({
	items = DEFAULT_FAQS,
	title = "Frequently Asked Questions",
	defaultValue,
	className,
	children,
}: FaqAccordionProps) {
	// Base UI's `defaultValue` is always `string[]` — normalize both the
	// single-string and array forms here so callers don't have to care.
	const normalizedDefault = normalizeDefaultValue(defaultValue);

	const content = (
		<>
			<Accordion
				className="border-0"
				defaultValue={normalizedDefault}
			>
				<FaqItems items={items} />
			</Accordion>

			{children}
		</>
	);

	if (title === null) {
		return <div className={cn(className)}>{content}</div>;
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>

			<CardContent className="p-0">{content}</CardContent>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeDefaultValue(
	value: string | readonly string[] | undefined
): string[] | undefined {
	if (value === undefined) return undefined;
	if (typeof value === "string") return [value];
	return [...value];
}
