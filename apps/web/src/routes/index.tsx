// routes/index.tsx

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, Syringe } from "lucide-react";
import HeroSection from "@/components/hero-section/hero-section";
import { ServicesShowcase } from "@/components/landing/services-showcase";
import { CLINIC_HOURS, CLINIC_INFO } from "@/config/clinic-info";
import { orpc } from "../lib/orpc/utils";

export const Route = createFileRoute("/")({
	// ✅ SSR stays ON — marketing page needs crawlable HTML.
	component: HomeComponent,
	head: () => ({
		meta: [
			{ title: "Smart Clinic — Compassionate Pediatric Care" },
			{
				name: "description",
				content:
					"Board-certified pediatricians offering well-child visits, immunizations, sick visits, and newborn care. Same-day appointments available.",
			},
		],
	}),
});

// ─────────────────────────────────────────────────────────────────────────────
// Portal status
// ─────────────────────────────────────────────────────────────────────────────
//
// Renders the live API status. Skipped during SSR to avoid hydration mismatch
// and a "Checking…" flash on the server-rendered HTML.

function PortalStatus() {
	const { status } = useQuery({
		...orpc.healthCheck.queryOptions(),
		// Don't fire during SSR — the query would suspend and the server has
		// no business calling the clinic's health endpoint anyway.
		enabled: typeof window !== "undefined",
	});

	const { dot, label, labelClass } = (() => {
		switch (status) {
			case "pending":
				return {
					dot: "bg-amber-400",
					label: "Checking…",
					labelClass: "text-slate-600",
				};
			case "error":
				return {
					dot: "bg-red-500",
					label: "Offline",
					labelClass: "text-slate-600",
				};
			default:
				return {
					dot: "bg-green-500",
					label: "Online",
					labelClass: "text-emerald-700",
				};
		}
	})();

	return (
		<div className="flex items-center gap-2">
			<span
				aria-hidden="true"
				className={`h-2 w-2 rounded-full ${dot}`}
			/>
			<span
				aria-live="polite"
				className={labelClass}
			>
				{label}
			</span>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

function HomeComponent() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
			<HeroSection
				brandLogos={[
					{
						name: "ClinicLogo",
						image: "/logo.png",
					},
				]}
			/>
			<ServicesShowcase />
			<HoursAndContact />
		</div>
	);
}

export function TodayAtAGlance() {
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
			<h2 className="font-semibold text-lg text-slate-900">
				Today at a glance
			</h2>

			<ul className="mt-4 space-y-3 text-sm">
				<li className="flex items-start gap-3">
					<Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
					<span className="text-slate-700">
						<strong className="font-medium text-slate-900">
							Same-day sick visits
						</strong>{" "}
						— call before 3:00 PM
					</span>
				</li>
				<li className="flex items-start gap-3">
					<Calendar className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
					<span className="text-slate-700">
						<strong className="font-medium text-slate-900">
							Well-child openings
						</strong>{" "}
						— next available this week
					</span>
				</li>
				<li className="flex items-start gap-3">
					<Syringe className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
					<span className="text-slate-700">
						<strong className="font-medium text-slate-900">
							Flu & routine vaccines
						</strong>{" "}
						— walk-ins welcome
					</span>
				</li>
			</ul>

			<div className="mt-6 border-t pt-4">
				<div className="flex items-center justify-between text-xs">
					<span className="text-slate-500">Clinic portal status</span>
					<PortalStatus />
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hours + contact
// ─────────────────────────────────────────────────────────────────────────────

function HoursAndContact() {
	return (
		<section
			className="bg-slate-50 py-16"
			id="contact"
		>
			<div className="container mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
				<OfficeHours />
				<VisitUs />
			</div>
		</section>
	);
}

function OfficeHours() {
	return (
		<div>
			<h2 className="font-bold text-2xl text-slate-900 tracking-tight">
				Office hours
			</h2>
			<ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
				{CLINIC_HOURS.map(({ day, time }) => (
					<li
						className="flex items-center justify-between px-5 py-3 text-sm"
						key={day}
					>
						<span className="font-medium text-slate-800">
							{day}
						</span>
						<span className="text-slate-600">{time}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function VisitUs() {
	return (
		<div>
			<h2 className="font-bold text-2xl text-slate-900 tracking-tight">
				Visit us
			</h2>

			<div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-700 text-sm">
				<p>
					<strong className="block font-medium text-slate-900">
						Address
					</strong>
					{CLINIC_INFO.addressLine1}
					<br />
					{CLINIC_INFO.addressLine2}
				</p>

				<p>
					<strong className="block font-medium text-slate-900">
						Phone
					</strong>
					<a
						className="text-sky-700 hover:underline"
						href={`tel:${CLINIC_INFO.phoneE164}`}
					>
						{CLINIC_INFO.phoneDisplay}
					</a>
				</p>

				<p>
					<strong className="block font-medium text-slate-900">
						Email
					</strong>
					<a
						className="text-sky-700 hover:underline"
						href={`mailto:${CLINIC_INFO.email}`}
					>
						{CLINIC_INFO.email}
					</a>
				</p>

				<p className="rounded-lg bg-sky-50 p-3 text-sky-900">
					<strong className="font-medium">Medical emergency?</strong>{" "}
					Call 911. For urgent after-hours questions, use our 24/7
					nurse line.
				</p>
			</div>
		</div>
	);
}
