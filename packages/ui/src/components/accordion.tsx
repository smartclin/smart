import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "cn";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

/**
 * Base UI's `Accordion.Root` is always a single-select, collapsible accordion.
 * Unlike Radix, it does NOT accept `type="single"` or `collapsible` props:
 *   - There is no `type` prop — Base UI accordions are single-select only.
 *     (For multi-select behavior, use multiple independent `Accordion.Root`
 *     instances or manage `value` as an array yourself.)
 *   - There is no `collapsible` prop — clicking an open item always closes it.
 *
 * The `value` / `defaultValue` props are `string[]` — an array of currently
 * open item values, matching the `value` prop on each `AccordionItem`.
 */
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
	return (
		<AccordionPrimitive.Root
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-2xl border",
				className
			)}
			data-slot="accordion"
			{...props}
		/>
	);
}

/**
 * Base UI sets the following state attributes on the item:
 *   - `data-open`    — present when the item is expanded
 *   - `data-closed`  — present when the item is collapsed
 *   - `data-disabled` — present when the item is disabled
 *
 * Prefer these attribute selectors over Radix-style `data-state=open` /
 * `data-state=closed`.
 */
function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
	return (
		<AccordionPrimitive.Item
			className={cn("not-last:border-b data-open:bg-muted/50", className)}
			data-slot="accordion-item"
			{...props}
		/>
	);
}

/**
 * Base UI's `Accordion.Trigger` renders a `<button>` with `aria-expanded`
 * reflecting the open state. The chevron icons below use
 * `group-aria-expanded/accordion-trigger:` variants, which is the correct
 * Base UI pattern — Radix used `data-state` on the trigger, Base UI uses
 * `aria-expanded`.
 */
function AccordionTrigger({
	className,
	children,
	...props
}: AccordionPrimitive.Trigger.Props) {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				className={cn(
					"group/accordion-trigger relative flex flex-1 items-start justify-between gap-6 border border-transparent p-4 text-start font-medium text-sm outline-none transition-all hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ms-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
					className
				)}
				data-slot="accordion-trigger"
				{...props}
			>
				{children}
				<ChevronDownIcon
					className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
					data-slot="accordion-trigger-icon"
				/>
				<ChevronUpIcon
					className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
					data-slot="accordion-trigger-icon"
				/>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

/**
 * Base UI's `Accordion.Panel` exposes the animated height via the CSS
 * custom property `--accordion-panel-height`, and marks its opening /
 * closing transition states with `data-open` / `data-closed` and
 * `data-starting-style` / `data-ending-style`.
 *
 * Note: `data-closed:animate-accordion-up` and `data-open:animate-accordion-down`
 * are Tailwind's `data-*` variants. They require the corresponding keyframes
 * (`accordion-up`, `accordion-down`) to be registered in your Tailwind
 * config or CSS. If animations don't run, check that.
 */
function AccordionContent({
	className,
	children,
	...props
}: AccordionPrimitive.Panel.Props) {
	return (
		<AccordionPrimitive.Panel
			className="overflow-hidden px-4 text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
			data-slot="accordion-content"
			{...props}
		>
			<div
				className={cn(
					"h-(--accordion-panel-height) pt-0 pb-4 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
					className
				)}
			>
				{children}
			</div>
		</AccordionPrimitive.Panel>
	);
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
