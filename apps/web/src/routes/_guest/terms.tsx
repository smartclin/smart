import { Card, CardContent } from "@smart/ui/components/card";
import { PageContainer, SectionCard } from "@smart/ui/components/Section";
import { cn } from "@smart/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, AlertTriangle, CheckCircle, Scale } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
	CONTACT_BLURB,
	CONTACT_EMAIL,
	EFFECTIVE_DATE,
	LAST_UPDATED,
	SECTIONS,
	SUMMARY,
	type SummaryItem,
	type TermsSection,
} from "@/components/privacy/terms-data";

export const Route = createFileRoute("/_guest/terms")({
	component: TermsPage,
	head: () => ({
		meta: [
			{ title: "Terms of Service — Smart Clinic" },
			{
				name: "description",
				content:
					"The terms that govern your use of Smart Clinic — written for clinicians, patients, and guardians.",
			},
		],
	}),
});

// ─── Page ──────────────────────────────────────────────────────────────────

function TermsPage() {
	return (
		<AppShell
			breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
			subtitle={`Last updated: ${LAST_UPDATED} · Effective: ${EFFECTIVE_DATE}`}
			title="Terms of Service"
		>
			<PageContainer className="max-w-4xl">
				<TermsHero />
				<SummarySection />
				{sectionsWithRenderedIds()}
				<ContactSection />
			</PageContainer>
		</AppShell>
	);
}

/**
 * SECTIONS is data, so we render it once here. Kept separate from the JSX
 * body above so the page component reads as a table of contents.
 */
function sectionsWithRenderedIds() {
	return SECTIONS.map((section) => (
		<TermsSectionBlock
			key={section.id}
			section={section}
		/>
	));
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function TermsHero() {
	return (
		<Card className="border-0 bg-gradient-to-r from-primary/10 to-module-immunizations/10 shadow-none">
			<CardContent className="p-6">
				<div className="flex items-center gap-4">
					<div className="rounded-full bg-primary/15 p-3">
						<Scale className="h-8 w-8 text-primary" />
					</div>
					<div>
						<h2 className="font-bold text-2xl">
							Plain-language terms
						</h2>
						<p className="text-muted-foreground">
							These terms govern your use of Smart Clinic. We've
							written them in plain language where possible. If
							you have questions, contact our legal team.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Quick summary ─────────────────────────────────────────────────────────

function SummarySection() {
	return (
		<SectionCard
			description="The four things most people want to know, before the fine print."
			title="Quick Summary"
		>
			<ul className="grid gap-3 sm:grid-cols-2">
				{SUMMARY.map((item) => (
					<li key={item.id}>
						<SummaryRow item={item} />
					</li>
				))}
			</ul>
		</SectionCard>
	);
}

function SummaryRow({ item }: { item: SummaryItem }) {
	const isPositive = item.kind === "positive";
	const Icon = isPositive ? CheckCircle : AlertCircle;

	return (
		<div className="flex items-start gap-3">
			<Icon
				className={cn(
					"mt-0.5 h-4 w-4 shrink-0",
					isPositive ? "text-success" : "text-warning"
				)}
			/>
			<div>
				<p className="font-medium text-sm">{item.title}</p>
				<p className="text-muted-foreground text-xs">
					{item.description}
				</p>
			</div>
		</div>
	);
}

// ─── Section renderer ──────────────────────────────────────────────────────

function TermsSectionBlock({ section }: { section: TermsSection }) {
	return (
		<SectionCard title={section.title}>
			<div
				className="scroll-mt-24 space-y-6"
				id={section.id}
			>
				{section.body ? (
					<p className="text-muted-foreground text-sm sm:text-base">
						{section.body}
					</p>
				) : null}

				{section.accountTypes ? (
					<div className="grid gap-3 sm:grid-cols-2">
						{section.accountTypes.map((account) => (
							<div
								className="rounded-lg border border-border p-4"
								key={account.id}
							>
								<h3 className="font-medium text-sm">
									{account.title}
								</h3>
								<p className="mt-1 text-muted-foreground text-xs">
									{account.description}
								</p>
							</div>
						))}
					</div>
				) : null}

				{section.lists?.map((list, index) => (
					<div key={list.heading ?? `list-${index}`}>
						{list.heading ? (
							<h3 className="mb-2 font-semibold text-base">
								{list.heading}
							</h3>
						) : null}
						<BulletList items={list.items} />
					</div>
				))}

				{section.doList || section.dontList ? (
					<DoDontPanel
						doList={section.doList ?? []}
						dontList={section.dontList ?? []}
					/>
				) : null}

				{section.callout ? (
					<Callout
						body={section.callout.body}
						kind={section.callout.kind}
						title={section.callout.title}
					/>
				) : null}
			</div>
		</SectionCard>
	);
}

// ─── Bullet list ───────────────────────────────────────────────────────────

function BulletList({ items }: { items: readonly string[] }) {
	return (
		<ul className="space-y-1 pl-5 text-muted-foreground text-sm">
			{items.map((item) => (
				<li
					className="relative before:absolute before:left-[-1rem] before:text-primary before:content-['•']"
					key={item}
				>
					{item}
				</li>
			))}
		</ul>
	);
}

// ─── Do / Don't panel ──────────────────────────────────────────────────────

function DoDontPanel({
	doList,
	dontList,
}: {
	doList: readonly string[];
	dontList: readonly string[];
}) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<div>
				<h3 className="flex items-center gap-2 font-semibold text-sm text-success">
					<CheckCircle className="h-4 w-4" />
					Please do
				</h3>
				<ul className="mt-2 space-y-1 pl-5 text-muted-foreground text-sm">
					{doList.map((item) => (
						<li
							className="relative before:absolute before:left-[-1rem] before:text-success before:content-['•']"
							key={item}
						>
							{item}
						</li>
					))}
				</ul>
			</div>

			<div>
				<h3 className="flex items-center gap-2 font-semibold text-destructive text-sm">
					<AlertTriangle className="h-4 w-4" />
					Please don't
				</h3>
				<ul className="mt-2 space-y-1 pl-5 text-muted-foreground text-sm">
					{dontList.map((item) => (
						<li
							className="relative before:absolute before:left-[-1rem] before:text-destructive before:content-['•']"
							key={item}
						>
							{item}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

// ─── Callout ───────────────────────────────────────────────────────────────

function Callout({
	kind,
	title,
	body,
}: {
	kind: "warning" | "info";
	title: string;
	body: string;
}) {
	const Icon = kind === "warning" ? AlertTriangle : AlertCircle;

	return (
		<div
			className={cn(
				"rounded-lg border-l-4 p-4",
				kind === "warning"
					? "border-l-warning bg-warning/10"
					: "border-l-info bg-info/10"
			)}
		>
			<div className="flex items-start gap-3">
				<Icon
					className={cn(
						"mt-0.5 h-4 w-4 shrink-0",
						kind === "warning" ? "text-warning" : "text-info"
					)}
				/>
				<div>
					<p className="font-semibold text-sm">{title}</p>
					<p className="mt-1 text-muted-foreground text-sm">{body}</p>
				</div>
			</div>
		</div>
	);
}

// ─── Contact ───────────────────────────────────────────────────────────────

function ContactSection() {
	return (
		<SectionCard title="Contact Us">
			<p className="text-muted-foreground text-sm">
				{CONTACT_BLURB}{" "}
				<a
					className="text-primary underline-offset-4 hover:underline"
					href={`mailto:${CONTACT_EMAIL}`}
				>
					{CONTACT_EMAIL}
				</a>
			</p>
		</SectionCard>
	);
}
