import { Card, CardContent } from "@smart/ui/components/card";
import { PageContainer, SectionCard } from "@smart/ui/components/Section";
import { Separator } from "@smart/ui/components/separator";
import { cn } from "@smart/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
	COLLECT_PERSONAL,
	COLLECT_USAGE,
	CONTACT,
	LAST_UPDATED,
	PRINCIPLES,
	RIGHTS,
	USE_CARE,
} from "@/components/privacy/data";

export const Route = createFileRoute("/_guest/privacy")({
	component: PrivacyPage,
	head: () => ({
		meta: [
			{ title: "Privacy Policy — Smart Clinic" },
			{
				name: "description",
				content:
					"How Smart Clinic collects, uses, and protects your data — written for patients, guardians, and clinic staff.",
			},
		],
	}),
});

// ─── Page ──────────────────────────────────────────────────────────────────

function PrivacyPage() {
	return (
		<AppShell
			breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
			subtitle={`Last updated: ${LAST_UPDATED}`}
			title="Privacy Policy"
		>
			<PageContainer className="max-w-4xl">
				<PrivacyHero />
				<PrinciplesGrid />
				<CollectSection />
				<UseSection />
				<RightsSection />
				<ContactSection />
			</PageContainer>
		</AppShell>
	);
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function PrivacyHero() {
	return (
		<Card className="border-0 bg-gradient-to-r from-primary/10 to-module-growth/10 shadow-none">
			<CardContent className="p-6">
				<div className="flex items-center gap-4">
					<div className="rounded-full bg-primary/15 p-3">
						<Shield className="h-8 w-8 text-primary" />
					</div>
					<div>
						<h2 className="font-bold text-2xl">
							Your privacy is not optional
						</h2>
						<p className="text-muted-foreground">
							This policy explains what data Smart Clinic
							collects, how we use it, and the controls you have.
							It applies to every patient, guardian, and clinic
							staff member using the platform.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Principles ────────────────────────────────────────────────────────────

function PrinciplesGrid() {
	return (
		<section aria-labelledby="principles-heading">
			<h2
				className="sr-only"
				id="principles-heading"
			>
				Privacy principles
			</h2>
			<div className="grid gap-4 sm:grid-cols-2">
				{PRINCIPLES.map((principle) => {
					const Icon = principle.icon;
					return (
						<Card key={principle.id}>
							<CardContent className="p-6">
								<div className="flex items-center gap-2">
									<Icon
										className={cn(
											"h-5 w-5",
											principle.color
										)}
									/>
									<h3 className="font-semibold text-lg">
										{principle.title}
									</h3>
								</div>
								<p className="mt-2 text-muted-foreground text-sm">
									{principle.description}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</section>
	);
}

// ─── Data we collect ───────────────────────────────────────────────────────

function CollectSection() {
	return (
		<SectionCard
			description="What we gather when you use Smart Clinic — and what we deliberately don't."
			title="Data We Collect"
		>
			<div className="space-y-6">
				<div>
					<h3 className="font-semibold text-base">
						Personal & Clinical Data
					</h3>
					<ul className="mt-2 space-y-1 pl-6 text-muted-foreground text-sm">
						{COLLECT_PERSONAL.map((item) => (
							<li
								className="relative before:absolute before:left-[-1rem] before:text-primary before:content-['•']"
								key={item}
							>
								{item}
							</li>
						))}
					</ul>
				</div>

				<Separator />

				<div>
					<h3 className="font-semibold text-base">
						Usage & Diagnostics
					</h3>
					<ul className="mt-2 space-y-1 pl-6 text-muted-foreground text-sm">
						{COLLECT_USAGE.map((item) => (
							<li
								className="relative before:absolute before:left-[-1rem] before:text-primary before:content-['•']"
								key={item}
							>
								{item}
							</li>
						))}
					</ul>
				</div>
			</div>
		</SectionCard>
	);
}

// ─── How we use data ───────────────────────────────────────────────────────

function UseSection() {
	return (
		<SectionCard title="How We Use Your Data">
			<div className="space-y-6">
				<div>
					<h3 className="font-semibold text-base">To Deliver Care</h3>
					<p className="mt-1 text-muted-foreground text-sm">
						Clinical data is used exclusively to support the care
						your clinic provides. We never sell it, share it with
						advertisers, or use it to train third-party models.
					</p>
					<ul className="mt-2 space-y-1 pl-6 text-muted-foreground text-sm">
						{USE_CARE.map((item) => (
							<li
								className="relative before:absolute before:left-[-1rem] before:text-primary before:content-['•']"
								key={item}
							>
								{item}
							</li>
						))}
					</ul>
				</div>

				<Separator />

				<div>
					<h3 className="font-semibold text-base">
						To Improve the Product
					</h3>
					<p className="mt-1 text-muted-foreground text-sm">
						Aggregated, de-identified usage data helps us prioritize
						features and fix bugs. This data cannot be linked back
						to any patient, guardian, or clinic.
					</p>
				</div>
			</div>
		</SectionCard>
	);
}

// ─── Your rights ───────────────────────────────────────────────────────────

function RightsSection() {
	return (
		<SectionCard
			description="You are in control of your clinic's data at every step."
			title="Your Rights"
		>
			<div className="grid gap-4 sm:grid-cols-2">
				{RIGHTS.map((right) => (
					<div
						className="rounded-lg border border-border p-4 motion-safe:transition-colors motion-safe:hover:bg-muted/40"
						key={right.id}
					>
						<h3 className="font-semibold text-base">
							{right.title}
						</h3>
						<p className="mt-1 text-muted-foreground text-sm">
							{right.description}
						</p>
					</div>
				))}
			</div>
		</SectionCard>
	);
}

// ─── Contact ───────────────────────────────────────────────────────────────

const CONTACT_ICONS = {
	mail: Mail,
	phone: Phone,
	"map-pin": MapPin,
} as const;

function ContactSection() {
	return (
		<SectionCard
			description="Questions about this policy? We're one message away."
			title="Contact Our Privacy Team"
		>
			<ul className="flex flex-wrap gap-x-8 gap-y-3">
				{CONTACT.map((item) => {
					const Icon = CONTACT_ICONS[item.icon];
					const inner = (
						<>
							<Icon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">{item.label}</span>
						</>
					);
					return (
						<li
							className="flex items-center gap-2"
							key={item.id}
						>
							{"href" in item && item.href ? (
								<a
									className="flex items-center gap-2 motion-safe:transition-colors motion-safe:hover:text-primary"
									href={item.href}
								>
									{inner}
								</a>
							) : (
								inner
							)}
						</li>
					);
				})}
			</ul>
		</SectionCard>
	);
}
