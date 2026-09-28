import { Button } from "@smart/ui/components/button";
import { Card, CardContent } from "@smart/ui/components/card";
import { Input } from "@smart/ui/components/input";
import { PageContainer, SectionCard } from "@smart/ui/components/Section";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@smart/ui/components/tabs";
import { cn } from "@smart/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
	CheckCircle2,
	ChevronRight,
	HelpCircle,
	Search,
	Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
	CONTACT_CHANNELS,
	FAQ_ITEMS,
	HELP_CHANNELS,
	STATUS,
	SUPPORT_HOURS,
} from "@/components/privacy/support-data";

export const Route = createFileRoute("/_guest/support")({
	component: SupportPage,
	head: () => ({
		meta: [
			{ title: "Support — Smart Clinic" },
			{
				name: "description",
				content:
					"Get help with Smart Clinic — documentation, live chat, email support, and 1:1 training for your clinic.",
			},
		],
	}),
});

// ─── Page ──────────────────────────────────────────────────────────────────

function SupportPage() {
	const [query, setQuery] = useState("");

	return (
		<AppShell
			breadcrumbs={[{ label: "Home", href: "/" }, { label: "Support" }]}
			subtitle="Documentation, live chat, and a real human when you need one"
			title="Support"
		>
			<PageContainer className="max-w-5xl">
				<SearchPanel
					onChange={setQuery}
					value={query}
				/>
				<HelpChannelsGrid />
				<SupportTabs searchQuery={query} />
				<StatusFooter />
			</PageContainer>
		</AppShell>
	);
}

// ─── Search ────────────────────────────────────────────────────────────────

function SearchPanel({
	value,
	onChange,
}: {
	value: string;
	onChange: (next: string) => void;
}) {
	return (
		<Card>
			<CardContent className="p-4 sm:p-6">
				<form
					className="flex flex-col gap-4 sm:flex-row sm:items-center"
					onSubmit={(e) => e.preventDefault()}
					role="search"
				>
					<div className="relative flex-1">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							aria-label="Search the knowledge base"
							className="pl-9"
							onChange={(e) => onChange(e.target.value)}
							placeholder="Search documentation, guides, and FAQs…"
							type="search"
							value={value}
						/>
					</div>
					<Button
						className="gap-2"
						type="button"
						variant="default"
					>
						<Sparkles className="h-4 w-4" />
						Ask AI assistant
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

// ─── Quick-help grid ───────────────────────────────────────────────────────

function HelpChannelsGrid() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{HELP_CHANNELS.map((channel) => {
				const Icon = channel.icon;
				return (
					<Card
						className="motion-safe:transition-shadow motion-safe:hover:shadow-md"
						key={channel.id}
					>
						<CardContent className="flex flex-col items-center p-6 text-center">
							<div className="rounded-full bg-primary/10 p-3">
								<Icon
									className={cn("h-6 w-6", channel.color)}
								/>
							</div>
							<h3 className="mt-3 font-semibold">
								{channel.title}
							</h3>
							<p className="text-muted-foreground text-sm">
								{channel.description}
							</p>
							<Button
								className="mt-3 gap-1"
								render={<a href={channel.href} />}
								size="sm"
								variant="ghost"
							>
								{channel.cta}
								<ChevronRight className="h-3 w-3" />
							</Button>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

// ─── Tabs (FAQ / Guides / Contact) ─────────────────────────────────────────

function SupportTabs({ searchQuery }: { searchQuery: string }) {
	return (
		<Tabs
			className="space-y-4"
			defaultValue="faq"
		>
			<TabsList className="w-full justify-start">
				<TabsTrigger value="faq">FAQ</TabsTrigger>
				<TabsTrigger value="guides">Guides</TabsTrigger>
				<TabsTrigger value="contact">Contact</TabsTrigger>
			</TabsList>

			<TabsContent
				className="space-y-4"
				value="faq"
			>
				<FaqPanel searchQuery={searchQuery} />
			</TabsContent>

			<TabsContent value="contact">
				<ContactPanel />
			</TabsContent>
		</Tabs>
	);
}

// ─── FAQ panel ─────────────────────────────────────────────────────────────

function FaqPanel({ searchQuery }: { searchQuery: string }) {
	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return FAQ_ITEMS;
		return FAQ_ITEMS.filter(
			(item) =>
				item.question.toLowerCase().includes(q) ||
				item.answer.toLowerCase().includes(q)
		);
	}, [searchQuery]);

	return (
		<>
			<SectionCard
				description={
					searchQuery
						? `Showing results for "${searchQuery}"`
						: undefined
				}
				title="Frequently Asked Questions"
			>
				{filtered.length === 0 ? (
					<p className="py-6 text-center text-muted-foreground text-sm">
						No results. Try a different search, or{" "}
						<a
							className="text-primary underline-offset-4 hover:underline"
							href="#contact"
						>
							contact us directly
						</a>
						.
					</p>
				) : (
					<ul className="divide-y divide-border">
						{filtered.map((item) => (
							<li key={item.id}>
								<FaqDisclosure
									answer={item.answer}
									question={item.question}
								/>
							</li>
						))}
					</ul>
				)}
			</SectionCard>

			<div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground text-sm">
				<HelpCircle className="h-4 w-4" />
				<span>Still need help?</span>
				<a
					className="text-primary underline-offset-4 hover:underline"
					href="#contact"
				>
					Contact us
				</a>
			</div>
		</>
	);
}

/**
 * Native <details> — free accessibility, keyboard support, and no state.
 * If you want animated open/close, add a `motion-safe:` transition on
 * `[open]` — but keep the native element. It's the correct primitive.
 */
function FaqDisclosure({
	question,
	answer,
}: {
	question: string;
	answer: string;
}) {
	return (
		<details className="group py-4">
			<summary className="flex cursor-pointer list-none items-center justify-between font-medium marker:hidden hover:text-primary">
				<span>{question}</span>
				<ChevronRight className="h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:group-open:rotate-90" />
			</summary>
			<p className="mt-2 text-muted-foreground text-sm">{answer}</p>
		</details>
	);
}

// ─── Contact panel ─────────────────────────────────────────────────────────

function ContactPanel() {
	return (
		<SectionCard
			description="Pick the channel that works best for you."
			title="Contact Support"
		>
			<div className="space-y-6">
				<div className="grid gap-4 sm:grid-cols-2">
					{CONTACT_CHANNELS.map((channel) => {
						const Icon = channel.icon;
						return (
							<div
								className="rounded-lg border border-border p-5 text-center"
								key={channel.id}
							>
								<Icon className="mx-auto h-8 w-8 text-primary" />
								<h3 className="mt-3 font-medium">
									{channel.title}
								</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									{channel.description}
								</p>
								<p className="text-muted-foreground text-xs">
									{channel.detail}
								</p>
								<Button
									className="mt-3 w-full"
									render={<a href={channel.href} />}
									size="sm"
								>
									{channel.cta}
								</Button>
							</div>
						);
					})}
				</div>

				<div className="rounded-lg border border-border bg-muted/30 p-4">
					<p className="font-medium">{SUPPORT_HOURS.heading}</p>
					<p className="mt-1 text-muted-foreground text-sm">
						{SUPPORT_HOURS.body}
					</p>
				</div>
			</div>
		</SectionCard>
	);
}

// ─── Status footer ─────────────────────────────────────────────────────────

function StatusFooter() {
	return (
		<div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
			<CheckCircle2 className="h-4 w-4 text-success" />
			<a
				className="underline-offset-4 hover:underline"
				href={STATUS.href}
				rel="noopener noreferrer"
				target="_blank"
			>
				{STATUS.label}
			</a>
		</div>
	);
}
