// apps/web/src/routes/_guest/credentials.tsx

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
	BookOpen,
	Building2,
	Calendar,
	Globe,
	GraduationCap,
	Mail,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_guest/credentials")({
	component: CredentialsPage,
	head: () => ({
		meta: [
			{ title: "Credentials — Smart Clinic" },
			{
				name: "description",
				content:
					"Board certifications, licensures, education, and professional memberships of Dr. Hazem — founder of Smart Clinic.",
			},
		],
	}),
});

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface Certification {
	expiresDate?: string;
	id: string;
	issuedBy: string;
	issuedDate: string;
	name: string;
	status: "active" | "expired" | "pending";
	/** Optional external verification link (e.g. ABP, IBLCE). */
	verifyUrl?: string;
}

interface License {
	expiresDate: string;
	id: string;
	issuedDate: string;
	jurisdiction: string;
	licenseNumber: string;
	status: "active" | "expired" | "pending";
}

interface Education {
	degree: string;
	endYear: number;
	id: string;
	institution: string;
	location: string;
	startYear: number;
}

interface Membership {
	acronym: string;
	id: string;
	name: string;
	since: number;
}

interface Publication {
	id: string;
	journal: string;
	title: string;
	url?: string;
	year: number;
}

const CERTIFICATIONS: readonly Certification[] = [
	{
		id: "abp",
		name: "Board Certified — General Pediatrics",
		issuedBy: "American Board of Pediatrics (ABP)",
		issuedDate: "2015-06-01",
		expiresDate: "2030-06-01",
		status: "active",
		verifyUrl: "https://www.abp.org/verification",
	},
	{
		id: "ibclc",
		name: "International Board Certified Lactation Consultant",
		issuedBy:
			"International Board of Lactation Consultant Examiners (IBLCE)",
		issuedDate: "2018-04-15",
		expiresDate: "2028-04-15",
		status: "active",
		verifyUrl: "https://iblce.org/verify",
	},
	{
		id: "pals",
		name: "Pediatric Advanced Life Support (PALS)",
		issuedBy: "American Heart Association",
		issuedDate: "2024-09-01",
		expiresDate: "2026-09-01",
		status: "active",
	},
	{
		id: "faap",
		name: "Fellow of the American Academy of Pediatrics",
		issuedBy: "American Academy of Pediatrics (AAP)",
		issuedDate: "2016-01-01",
		status: "active",
	},
];

const LICENSES: readonly License[] = [
	{
		id: "ca-md",
		jurisdiction: "California Medical Board",
		licenseNumber: "A-123456",
		issuedDate: "2015-07-01",
		expiresDate: "2027-07-01",
		status: "active",
	},
	{
		id: "de-md",
		jurisdiction: "DEA Registration",
		licenseNumber: "DEA-XX1234567",
		issuedDate: "2016-01-01",
		expiresDate: "2026-12-31",
		status: "active",
	},
];

const EDUCATION: readonly Education[] = [
	{
		id: "md",
		degree: "Doctor of Medicine (MD)",
		institution: "University of California, San Francisco",
		location: "San Francisco, CA",
		startYear: 2007,
		endYear: 2011,
	},
	{
		id: "residency",
		degree: "Pediatric Residency",
		institution: "Boston Children's Hospital",
		location: "Boston, MA",
		startYear: 2011,
		endYear: 2015,
	},
	{
		id: "bs",
		degree: "Bachelor of Science — Biology",
		institution: "Stanford University",
		location: "Stanford, CA",
		startYear: 2003,
		endYear: 2007,
	},
];

const MEMBERSHIPS: readonly Membership[] = [
	{
		id: "aap",
		acronym: "AAP",
		name: "American Academy of Pediatrics",
		since: 2015,
	},
	{
		id: "abp-m",
		acronym: "ABP",
		name: "American Board of Pediatrics",
		since: 2015,
	},
	{
		id: "iblce-m",
		acronym: "IBLCE",
		name: "International Board of Lactation Consultant Examiners",
		since: 2018,
	},
	{
		id: "academy-breastfeeding",
		acronym: "ABM",
		name: "Academy of Breastfeeding Medicine",
		since: 2017,
	},
];

const PUBLICATIONS: readonly Publication[] = [
	{
		id: "pub-1",
		title: "Early recognition of neonatal hyperbilirubinemia in outpatient pediatric settings",
		journal: "Pediatrics",
		year: 2021,
	},
	{
		id: "pub-2",
		title: "Integrating lactation consultation into well-child visits: a two-year cohort",
		journal: "Breastfeeding Medicine",
		year: 2022,
	},
	{
		id: "pub-3",
		title: "Reducing no-show rates in pediatric primary care with SMS reminders",
		journal: "Journal of Pediatric Health Care",
		year: 2023,
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

function CredentialsPage() {
	return (
		<AppShell
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "About", href: "/about" },
				{ label: "Credentials" },
			]}
			subtitle="Board certifications, licensures, education, and professional affiliations"
			title="Credentials"
		>
			<PageContainer>
				<CredentialsIntro />
				<CertificationsSection />
				<LicensesSection />
				<EducationSection />
				<MembershipsSection />
				<PublicationsSection />
				<VerificationCTA />
			</PageContainer>
		</AppShell>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Intro
// ─────────────────────────────────────────────────────────────────────────────

function CredentialsIntro() {
	return (
		<div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-violet-50 to-teal-50 p-6 sm:p-8">
			<div className="flex items-start gap-4">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
					<GraduationCap className="h-6 w-6 text-primary" />
				</div>
				<div className="min-w-0 flex-1">
					<h2 className="font-semibold text-lg sm:text-xl">
						Verified professional credentials
					</h2>
					<p className="mt-1 text-muted-foreground text-sm sm:text-base">
						Every certification below is maintained in good standing
						and independently verifiable through the issuing body.
						For a printed CV or a signed attestation, contact us
						directly.
					</p>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Certifications
// ─────────────────────────────────────────────────────────────────────────────

function CertificationsSection() {
	return (
		<SectionCard
			description="Board certifications and specialty credentials currently in good standing"
			title="Certifications"
		>
			<ul className="space-y-3">
				{CERTIFICATIONS.map((cert, index) => (
					<li key={cert.id}>
						{index > 0 ? <Separator /> : null}
						<div className="flex flex-col gap-2 pt-3 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<Award className="h-4 w-4 shrink-0 text-primary" />
									<span className="font-medium text-sm sm:text-base">
										{cert.name}
									</span>
									<StatusBadge status={cert.status} />
								</div>
								<p className="mt-1 text-muted-foreground text-xs sm:text-sm">
									{cert.issuedBy}
								</p>
								<p className="mt-0.5 text-muted-foreground text-xs">
									Issued {formatMonthYear(cert.issuedDate)}
									{cert.expiresDate
										? ` · Expires ${formatMonthYear(cert.expiresDate)}`
										: ""}
								</p>
							</div>
							{cert.verifyUrl ? (
								<Button
									className="w-full shrink-0 sm:w-auto"
									render={
										<a
											href={cert.verifyUrl}
											rel="noopener noreferrer"
											target="_blank"
										>
											<BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
											Verify
										</a>
									}
									size="sm"
									variant="outline"
								/>
							) : null}
						</div>
					</li>
				))}
			</ul>
		</SectionCard>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Licenses
// ─────────────────────────────────────────────────────────────────────────────

function LicensesSection() {
	return (
		<SectionCard
			description="Active medical and prescribing licenses"
			title="Licensures"
		>
			<div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
				{LICENSES.map((lic) => (
					<div
						className="rounded-lg border p-4 motion-safe:transition-colors motion-safe:hover:bg-muted/30"
						key={lic.id}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Building2 className="h-4 w-4 text-primary" />
								<span className="font-medium text-sm">
									{lic.jurisdiction}
								</span>
							</div>
							<StatusBadge status={lic.status} />
						</div>
						<div className="mt-2 space-y-0.5 text-xs">
							<p className="font-mono text-muted-foreground">
								{lic.licenseNumber}
							</p>
							<p className="text-muted-foreground">
								Issued {formatMonthYear(lic.issuedDate)}
								{" · "}
								Expires {formatMonthYear(lic.expiresDate)}
							</p>
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────────────────────────────────────

function EducationSection() {
	return (
		<SectionCard
			description="Formal training and postgraduate medical education"
			title="Education"
		>
			<ol className="relative space-y-4 border-border border-l pl-6">
				{EDUCATION.map((ed) => (
					<li
						className="relative"
						key={ed.id}
					>
						<span
							aria-hidden
							className="absolute top-1 -left-[31px] flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary"
						/>
						<div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<h4 className="font-semibold text-sm sm:text-base">
									{ed.degree}
								</h4>
								<p className="text-muted-foreground text-xs sm:text-sm">
									{ed.institution} · {ed.location}
								</p>
							</div>
							<Badge
								className="w-fit shrink-0"
								variant="outline"
							>
								<Calendar className="mr-1 h-3 w-3" />
								{ed.startYear}–{ed.endYear}
							</Badge>
						</div>
					</li>
				))}
			</ol>
		</SectionCard>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Memberships
// ─────────────────────────────────────────────────────────────────────────────

function MembershipsSection() {
	return (
		<SectionCard
			description="Professional societies and continuing education bodies"
			title="Memberships"
		>
			<div className="grid gap-3 sm:grid-cols-2">
				{MEMBERSHIPS.map((m) => (
					<div
						className="flex items-start gap-3 rounded-lg border p-3 motion-safe:transition-colors motion-safe:hover:bg-muted/50"
						key={m.id}
					>
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
							{m.acronym}
						</div>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-sm">{m.name}</p>
							<p className="text-muted-foreground text-xs">
								Member since {m.since}
							</p>
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Publications
// ─────────────────────────────────────────────────────────────────────────────

function PublicationsSection() {
	return (
		<SectionCard
			description="Peer-reviewed contributions to pediatric and lactation medicine"
			title="Selected Publications"
		>
			<ul className="space-y-3">
				{PUBLICATIONS.map((pub, index) => (
					<li key={pub.id}>
						{index > 0 ? <Separator /> : null}
						<div className="flex items-start gap-3 pt-3 first:pt-0">
							<BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<div className="min-w-0 flex-1">
								<p className="font-medium text-sm sm:text-base">
									{pub.title}
								</p>
								<p className="mt-0.5 text-muted-foreground text-xs sm:text-sm">
									<em>{pub.journal}</em> · {pub.year}
								</p>
							</div>
						</div>
					</li>
				))}
			</ul>
		</SectionCard>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Verification CTA
// ─────────────────────────────────────────────────────────────────────────────

function VerificationCTA() {
	return (
		<Card className="border-0 bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-none">
			<CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left">
				<div>
					<div className="flex items-center justify-center gap-2 sm:justify-start">
						<BadgeCheck className="h-5 w-5" />
						<h3 className="font-semibold text-lg">
							Need a formal verification?
						</h3>
					</div>
					<p className="mt-1 text-primary-foreground/80 text-sm">
						We can provide a signed attestation, primary-source
						verification, or a full CV on request.
					</p>
				</div>
				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
					<Button
						className="w-full sm:w-auto"
						render={
							<Link to="/contact">
								<Mail className="mr-2 h-4 w-4" />
								Request Verification
							</Link>
						}
						variant="secondary"
					/>
					<Button
						className="w-full sm:w-auto"
						render={
							<a
								href="https://smartclinic.app"
								rel="noopener noreferrer"
								target="_blank"
							>
								<Globe className="mr-2 h-4 w-4" />
								Website
							</a>
						}
						variant="outline"
					/>
				</div>
			</CardContent>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Small pieces
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "active" | "expired" | "pending" }) {
	const config: Record<
		typeof status,
		{
			label: string;
			variant: "default" | "secondary" | "destructive" | "outline";
		}
	> = {
		active: { label: "Active", variant: "default" },
		pending: { label: "Pending", variant: "secondary" },
		expired: { label: "Expired", variant: "destructive" },
	};

	const { label, variant } = config[status];

	return (
		<Badge
			className={cn("h-auto px-1.5 py-0 text-[10px]", {
				"bg-emerald-600 text-white hover:bg-emerald-600":
					status === "active",
			})}
			variant={variant}
		>
			{label}
		</Badge>
	);
}

function formatMonthYear(isoDate: string): string {
	const d = new Date(isoDate);
	return d.toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
	});
}
