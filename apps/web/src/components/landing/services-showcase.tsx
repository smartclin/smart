// src/components/landing/services-showcase.tsx

import { cn } from "@smart/ui/lib/utils";
import {
	ArrowRight,
	Baby,
	Heart,
	ShieldCheck,
	Stethoscope,
	Syringe,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Data — swap `image` for your real asset paths (or Unsplash/CDN URLs)
// ─────────────────────────────────────────────────────────────────────────────

type Service = {
	id: string;
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	/** Background image URL. Recommend 800×1000 (portrait) or 800×800 (square). */
	image: string;
	/** Tailwind gradient fallback shown while image loads / if image fails. */
	fallback: string;
	href: string;
};

const SERVICES: Service[] = [
	{
		id: "well-child",
		icon: Baby,
		title: "Well-Child Visits",
		description:
			"Routine checkups to track growth, development, and milestones from newborn through adolescence.",
		image: "/services/well-child.webp",
		fallback: "from-sky-400 to-blue-600",
		href: "/services/well-child",
	},
	{
		id: "immunizations",
		icon: Syringe,
		title: "Immunizations",
		description:
			"On-schedule vaccines following CDC and AAP guidelines to keep your child protected.",
		image: "/services/immunizations.webp",
		fallback: "from-emerald-400 to-teal-600",
		href: "/services/immunizations",
	},
	{
		id: "sick-visits",
		icon: Stethoscope,
		title: "Sick Visits",
		description:
			"Same-day appointments for fevers, coughs, ear infections, rashes, and other acute concerns.",
		image: "/services/sick-visits.webp",
		fallback: "from-rose-400 to-red-600",
		href: "/services/sick-visits",
	},
	{
		id: "chronic-care",
		icon: Heart,
		title: "Chronic Care",
		description:
			"Ongoing management for asthma, allergies, diabetes, and other long-term conditions.",
		image: "/services/chronic-care.webp",
		fallback: "from-violet-400 to-purple-600",
		href: "/services/chronic-care",
	},
	{
		id: "developmental",
		icon: Heart,
		title: "Developmental Screening",
		description:
			"Early identification of speech, motor, and behavioral concerns with referrals when needed.",
		image: "/services/developmental.webp",
		fallback: "from-amber-400 to-orange-600",
		href: "/services/developmental-screening",
	},
	{
		id: "newborn",
		icon: ShieldCheck,
		title: "Newborn Care",
		description:
			"Gentle, thorough care for your newest family member, including feeding and sleep support.",
		image: "/services/newborn.webp",
		fallback: "from-cyan-400 to-sky-600",
		href: "/services/newborn-care",
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
	const Icon = service.icon;

	return (
		<a
			className={cn(
				"group relative isolate flex h-80 flex-col justify-end overflow-hidden rounded-2xl",
				"border border-slate-200 shadow-sm",
				"transition-all duration-300",
				"hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
			)}
			href={service.href}
		>
			{/* ── Background image ────────────────────────────────────────── */}
			{/* Rendered as <img> so it can be lazy-loaded and srcset-optimized. */}
			<img
				alt=""
				aria-hidden="true"
				className={cn(
					"absolute inset-0 -z-20 size-full object-cover",
					"transition-transform duration-500 ease-out",
					"group-hover:scale-105"
				)}
				height="auto"
				loading="lazy"
				src={service.image}
				width="auto"
			/>

			{/* ── Gradient fallback (visible if image 404s or is slow) ────── */}
			<div
				aria-hidden="true"
				className={cn(
					"absolute inset-0 -z-30 bg-gradient-to-br",
					service.fallback
				)}
			/>

			{/* ── Overlay ─────────────────────────────────────────────────── */}
			{/* Idle: subtle gradient so the title reads. Hover: darkens. */}
			<div
				aria-hidden="true"
				className={cn(
					"absolute inset-0 -z-10",
					"bg-gradient-to-t from-black/70 via-black/30 to-transparent",
					"transition-opacity duration-300",
					"group-hover:from-black/85 group-hover:via-black/60"
				)}
			/>

			{/* ── Icon badge (top-left) ───────────────────────────────────── */}
			<div className="absolute top-4 left-4 z-10 flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md">
				<Icon className="size-5 text-white" />
			</div>

			{/* ── Content ─────────────────────────────────────────────────── */}
			<div className="relative z-10 space-y-2 p-5 text-white">
				<h3 className="font-semibold text-lg tracking-tight drop-shadow-sm">
					{service.title}
				</h3>

				{/*
				 * Description + button share a wrapper that animates on hover.
				 * - Idle: max-h-0, opacity-0 → hidden
				 * - Hover: max-h-40, opacity-100 → revealed
				 * Using max-h (not height) avoids needing to know content height.
				 */}
				<div
					className={cn(
						"overflow-hidden transition-all duration-300 ease-out",
						"max-h-0 opacity-0",
						"group-hover:max-h-40 group-hover:opacity-100",
						// Also reveal on keyboard focus for a11y
						"group-focus-visible:max-h-40 group-focus-visible:opacity-100"
					)}
				>
					<p className="pt-1 text-sm text-white/85 leading-relaxed">
						{service.description}
					</p>

					<span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium text-xs ring-1 ring-white/25 backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-slate-900">
						Know more
						<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
					</span>
				</div>
			</div>
		</a>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────────────────────

export function ServicesShowcase() {
	return (
		<section className="border-t bg-white py-16">
			<div className="container mx-auto max-w-6xl px-4">
				<header className="mx-auto max-w-2xl text-center">
					<h2 className="font-bold text-3xl text-slate-900 tracking-tight">
						Our services
					</h2>
					<p className="mt-3 text-slate-600">
						Comprehensive pediatric care under one roof — from
						newborn visits to adolescent wellness.
					</p>
				</header>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{SERVICES.map((service) => (
						<ServiceCard
							key={service.id}
							service={service}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
