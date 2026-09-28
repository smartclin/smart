// apps/web/src/routes/_guest/about.tsx

import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";

import { Card, CardContent } from "@smart/ui/components/card";
import { PageContainer, SectionCard } from "@smart/ui/components/Section";
import { Separator } from "@smart/ui/components/separator";
import { cn } from "@smart/ui/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Award,
	BadgeCheck,
	Globe,
	Heart,
	Mail,
	MapPin,
	Phone,
	Sparkles,
	Stethoscope,
} from "lucide-react";
import { FEATURES, STATS, TEAM, VALUES } from "@/components/hero-section/data";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_guest/about")({
	component: AboutPage,
	head: () => ({
		meta: [
			{ title: "About — Smart Clinic" },
			{
				name: "description",
				content:
					"Meet the team behind Smart Clinic — a pediatric EMR built by clinicians, for clinicians.",
			},
		],
	}),
});

// ─── Page ──────────────────────────────────────────────────────────────────

function AboutPage() {
	return (
		<AppShell
			breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
			subtitle="Our mission, our team, and the clinical values behind every feature"
			title="About Smart Clinic"
		>
			<PageContainer>
				<FounderHero />
				<MissionBanner />
				<StatsGrid />
				<StorySection />
				<ValuesSection />
				<FeaturesSection />
				<TeamSection />
				<ContactSection />
			</PageContainer>
		</AppShell>
	);
}

// ─── Founder hero ──────────────────────────────────────────────────────────

function FounderHero() {
	const founder = TEAM[0];

	return (
		<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-violet-50 to-teal-50 p-6 shadow-lg md:p-10">
			<div
				aria-hidden
				className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
			/>
			<div
				aria-hidden
				className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-violet-500/5 blur-2xl"
			/>

			<div className="relative flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
				<div className="flex-1 space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge className="bg-primary text-primary-foreground">
							<Award className="mr-1 h-3 w-3" />
							Founder & CEO
						</Badge>
						<Badge
							className="border-violet-500 text-violet-700"
							variant="outline"
						>
							<BadgeCheck className="mr-1 h-3 w-3" />
							IBCLC Certified
						</Badge>
					</div>

					<h1 className="font-bold text-3xl leading-tight sm:text-4xl md:text-5xl">
						{founder?.name}
						<span className="block text-lg text-primary sm:text-xl md:text-2xl">
							Board Certified Pediatrician & IBCLC
						</span>
					</h1>

					<div className="flex flex-wrap gap-2">
						{founder?.certifications.map((cert) => (
							<Badge
								className="bg-background/80 text-xs sm:text-sm"
								key={cert}
								variant="secondary"
							>
								{cert}
							</Badge>
						))}
					</div>

					<p className="text-base text-muted-foreground sm:text-lg">
						Passionate about transforming pediatric healthcare
						through innovation, compassion, and evidence-based
						practice.
					</p>

					<div className="flex flex-wrap gap-3 pt-2">
						<Button
							className="gap-2"
							render={<Link to="/contact" />}
						>
							<Heart className="h-4 w-4" />
							Schedule Consultation
						</Button>
						<Button
							className="gap-2"
							render={<Link to="/credentials" />}
							variant="outline"
						>
							<Stethoscope className="h-4 w-4" />
							View Credentials
						</Button>
					</div>
				</div>

				<FounderPortrait />
			</div>
		</div>
	);
}

function FounderPortrait() {
	return (
		<div className="flex shrink-0 justify-center md:justify-end">
			<div className="relative">
				<div
					aria-hidden
					className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary via-violet-500 to-teal-500 opacity-20 blur-2xl motion-safe:animate-[pulse_4s_ease-in-out_infinite]"
				/>
				<div
					aria-hidden
					className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary to-teal-500 opacity-10"
				/>

				<div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-background shadow-2xl sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72">
					<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-teal-500/20">
						<div className="text-center">
							<Stethoscope className="mx-auto h-12 w-12 text-primary/40 sm:h-16 sm:w-16" />
							<span className="block font-semibold text-primary/60 text-xs sm:text-sm">
								Dr. Hazem
							</span>
						</div>
					</div>
				</div>

				<div className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 p-1.5 text-white shadow-lg sm:p-2">
					<BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" />
				</div>
				<div className="absolute -top-1 -left-1 rounded-full bg-violet-500 p-1 text-white shadow-lg sm:p-1.5">
					<Award className="h-3 w-3 sm:h-4 sm:w-4" />
				</div>
			</div>
		</div>
	);
}

// ─── Mission banner ────────────────────────────────────────────────────────

function MissionBanner() {
	return (
		<Card className="border-0 bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-none">
			<CardContent className="p-6 text-center sm:p-8">
				<div className="mx-auto max-w-2xl">
					<Badge className="bg-background/20 text-primary-foreground hover:bg-background/30">
						<Sparkles className="mr-1 h-3 w-3" />
						Our Mission
					</Badge>
					<h2 className="mt-4 font-bold text-2xl sm:text-3xl">
						Pediatric care that feels personal again
					</h2>
					<p className="mt-2 text-primary-foreground/80 text-sm sm:text-base">
						We build software that gives pediatricians more time
						with patients — and less time with paperwork.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Stats grid ────────────────────────────────────────────────────────────

function StatsGrid() {
	return (
		<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
			{STATS.map((stat) => (
				<Card
					className="motion-safe:transition-transform motion-safe:hover:scale-[1.03]"
					key={stat.id}
				>
					<CardContent className="p-4 text-center sm:p-6">
						<p
							className={cn(
								"whitespace-nowrap font-bold text-2xl sm:text-3xl",
								stat.color
							)}
						>
							{stat.value}
						</p>
						<p className="mt-1 text-muted-foreground text-xs sm:text-sm">
							{stat.label}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// ─── Story ─────────────────────────────────────────────────────────────────

function StorySection() {
	return (
		<SectionCard
			description="From a frustrated pediatrician to a full clinical platform"
			title="Our Story"
		>
			<div className="space-y-4">
				<p className="text-muted-foreground text-sm sm:text-base">
					Smart Clinic started in a small pediatric office where the
					waiting room was always full, the charts were always
					incomplete, and the software was always one click away from
					being useful. We knew there had to be something better.
				</p>
				<p className="text-muted-foreground text-sm sm:text-base">
					Years later, Smart Clinic is used by pediatric clinics on
					every continent except Antarctica — with the same goal we
					started with: fewer clicks, more care.
				</p>

				<Separator />

				<div className="flex items-center gap-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
						<Heart className="h-5 w-5 text-primary" />
					</div>
					<div>
						<p className="font-semibold text-sm sm:text-base">
							Founded in 2019
						</p>
						<p className="text-muted-foreground text-xs sm:text-sm">
							By clinicians, for clinicians
						</p>
					</div>
				</div>
			</div>
		</SectionCard>
	);
}

// ─── Values ────────────────────────────────────────────────────────────────

function ValuesSection() {
	return (
		<SectionCard
			description="Four principles that shape every decision we make"
			title="What We Value"
		>
			<div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
				{VALUES.map((value) => {
					const Icon = value.icon;
					return (
						<div
							className="group space-y-2 rounded-lg border p-3 motion-safe:transition-all motion-safe:hover:shadow-md motion-safe:hover:shadow-primary/10 sm:p-4"
							key={value.id}
						>
							<div className="flex items-center gap-2">
								<div className="rounded-full bg-primary/10 p-1.5 motion-safe:transition-colors motion-safe:group-hover:bg-primary/20 sm:p-2">
									<Icon
										className={cn(
											"h-4 w-4 sm:h-5 sm:w-5",
											value.color
										)}
									/>
								</div>
								<h4 className="font-semibold text-sm sm:text-base">
									{value.title}
								</h4>
							</div>
							<p className="text-muted-foreground text-xs sm:text-sm">
								{value.description}
							</p>
						</div>
					);
				})}
			</div>
		</SectionCard>
	);
}

// ─── Features ──────────────────────────────────────────────────────────────

function FeaturesSection() {
	return (
		<SectionCard
			description="The clinical tools pediatric teams use every day"
			title="Platform Features"
		>
			<div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
				{FEATURES.map((feature) => {
					const Icon = feature.icon;
					return (
						<div
							className="flex items-start gap-3 rounded-lg border p-3 motion-safe:transition-colors motion-safe:hover:bg-muted/50 sm:p-4"
							key={feature.id}
						>
							<div className="rounded-full bg-primary/10 p-1.5 sm:p-2">
								<Icon
									className={cn(
										"h-3 w-3 sm:h-4 sm:w-4",
										feature.color
									)}
								/>
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="font-semibold text-sm sm:text-base">
									{feature.title}
								</h4>
								<p className="text-muted-foreground text-xs sm:text-sm">
									{feature.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</SectionCard>
	);
}

// ─── Team ──────────────────────────────────────────────────────────────────

function TeamSection() {
	return (
		<SectionCard
			description="Clinicians and engineers building the product together"
			title="Meet the Team"
		>
			<div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
				{TEAM.map((member) => (
					<TeamCard
						key={member.id}
						member={member}
					/>
				))}
			</div>
		</SectionCard>
	);
}

function TeamCard({ member }: { member: (typeof TEAM)[number] }) {
	const initials = member.name
		.split(" ")
		.map((n) => n[0])
		.join("");

	return (
		<div className="group rounded-lg border p-4 text-center motion-safe:transition-shadow motion-safe:hover:shadow-lg sm:p-6">
			<div
				className={cn(
					"mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r sm:h-24 sm:w-24",
					member.gradient
				)}
			>
				<span className="font-bold text-white text-xl sm:text-2xl">
					{initials}
				</span>
			</div>

			<h4 className="mt-3 font-semibold text-sm sm:text-base">
				{member.name}
			</h4>
			<p className="font-medium text-primary text-xs sm:text-sm">
				{member.role}
			</p>
			<p className="text-muted-foreground text-xs sm:text-sm">
				{member.specialty}
			</p>

			{member.certifications.length > 0 ? (
				<ul className="mt-3 space-y-1 text-left">
					{member.certifications.slice(0, 2).map((cert) => (
						<li
							className="text-muted-foreground text-xs before:mr-1 before:content-['•']"
							key={cert}
						>
							{cert}
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

// ─── Contact ───────────────────────────────────────────────────────────────

const CONTACT = [
	{
		id: "address",
		icon: MapPin,
		label: "123 Healthcare Way, Suite 100",
	},
	{
		id: "email",
		icon: Mail,
		label: "hello@smartclinic.app",
		href: "mailto:hello@smartclinic.app",
	},
	{
		id: "phone",
		icon: Phone,
		label: "1-800-SMART-MD",
		href: "tel:+18007627863",
	},
] as const;

function ContactSection() {
	return (
		<SectionCard
			description="We'd love to hear from you"
			title="Get in Touch"
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<ul className="space-y-2 sm:space-y-3">
					{CONTACT.map((item) => {
						const Icon = item.icon;
						const content = (
							<>
								<Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
								<span className="text-xs sm:text-sm">
									{item.label}
								</span>
							</>
						);

						return (
							<li
								className="flex items-center gap-3 rounded-lg border p-2 motion-safe:transition-colors motion-safe:hover:bg-muted/50 sm:p-3"
								key={item.id}
							>
								{"href" in item && item.href ? (
									<a
										className="flex items-center gap-3"
										href={item.href}
									>
										{content}
									</a>
								) : (
									content
								)}
							</li>
						);
					})}
				</ul>

				<div className="flex flex-col gap-2 sm:items-end sm:gap-3">
					<Button
						className="w-full gap-2 sm:w-auto"
						render={<Link to="/contact" />}
					>
						<Mail className="h-4 w-4" />
						Contact Us
					</Button>
					<Button
						className="w-full gap-2 sm:w-auto"
						render={<a href="https://smartclinic.app" />}
						variant="outline"
					>
						<Globe className="h-4 w-4" />
						Visit Website
					</Button>
				</div>
			</div>
		</SectionCard>
	);
}
