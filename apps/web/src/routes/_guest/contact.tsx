import { Button } from "@smart/ui/components/button";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import { PageContainer, SectionCard } from "@smart/ui/components/Section";
import { cn } from "@smart/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
	CONTACT_CHANNELS,
	SUPPORT_HOURS,
} from "@/components/privacy/support-data";

export const Route = createFileRoute("/_guest/contact")({
	component: ContactPage,
	head: () => ({
		meta: [
			{ title: "Contact — Smart Clinic" },
			{
				name: "description",
				content:
					"Get in touch with Smart Clinic — sales, support, and general inquiries.",
			},
		],
	}),
});

// ─── Page ──────────────────────────────────────────────────────────────────

function ContactPage() {
	return (
		<AppShell
			breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
			subtitle="Sales, support, and everything in between"
			title="Contact Us"
		>
			<PageContainer className="max-w-5xl">
				<div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
					<ContactForm />
					<SidePanel />
				</div>
			</PageContainer>
		</AppShell>
	);
}

// ─── Form ──────────────────────────────────────────────────────────────────

type SubmissionState =
	| { kind: "idle" }
	| { kind: "submitting" }
	| { kind: "success"; message: string }
	| { kind: "error"; message: string };

function ContactForm() {
	const [state, setState] = useState<SubmissionState>({ kind: "idle" });

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setState({ kind: "submitting" });

		const formData = new FormData(e.currentTarget);
		const payload = {
			name: String(formData.get("name") ?? ""),
			email: String(formData.get("email") ?? ""),
			subject: String(formData.get("subject") ?? ""),
			message: String(formData.get("message") ?? ""),
		};

		// TODO: replace with a real server fn call:
		//   await $sendContactMessage({ data: payload })
		// Left as a stub so the page renders today.
		try {
			await new Promise((resolve) => setTimeout(resolve, 600));
			console.info("[contact] submission", payload);
			setState({
				kind: "success",
				message:
					"Thanks — we received your message and will reply within one business day.",
			});
			e.currentTarget.reset();
		} catch {
			setState({
				kind: "error",
				message:
					"Something went wrong. Please email us directly at support@smartclinic.app.",
			});
		}
	}

	const isSubmitting = state.kind === "submitting";

	return (
		<SectionCard
			description="We respond within one business day."
			title="Send us a message"
		>
			<form
				className="space-y-5"
				onSubmit={handleSubmit}
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="contact-name">Name</Label>
						<Input
							autoComplete="name"
							id="contact-name"
							name="name"
							placeholder="Dr. Jane Smith"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="contact-email">Email</Label>
						<Input
							autoComplete="email"
							id="contact-email"
							name="email"
							placeholder="jane@clinic.example"
							required
							type="email"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="contact-subject">Subject</Label>
					<Input
						id="contact-subject"
						name="subject"
						placeholder="e.g. Migration from another EMR"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="contact-message">Message</Label>
					<textarea
						className={cn(
							"flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
							"placeholder:text-muted-foreground",
							"focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
							"disabled:cursor-not-allowed disabled:opacity-50"
						)}
						id="contact-message"
						name="message"
						placeholder="Tell us about your clinic and what you need…"
						required
						rows={6}
					/>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3">
					{state.kind === "success" ? (
						<p className="text-sm text-success">{state.message}</p>
					) : state.kind === "error" ? (
						<p className="text-destructive text-sm">
							{state.message}
						</p>
					) : (
						<p className="text-muted-foreground text-xs">
							We'll never share your email with anyone.
						</p>
					)}
					<Button
						className="gap-2"
						disabled={isSubmitting}
						type="submit"
					>
						<Send className="h-4 w-4" />
						{isSubmitting ? "Sending…" : "Send message"}
					</Button>
				</div>
			</form>
		</SectionCard>
	);
}

// ─── Side panel ────────────────────────────────────────────────────────────

function SidePanel() {
	return (
		<div className="space-y-6">
			<SectionCard title="Prefer a faster channel?">
				<ul className="space-y-3">
					{CONTACT_CHANNELS.map((channel) => {
						const Icon = channel.icon;
						return (
							<li
								className="rounded-lg border border-border p-4"
								key={channel.id}
							>
								<div className="flex items-center gap-3">
									<Icon className="h-5 w-5 text-primary" />
									<div>
										<p className="font-medium text-sm">
											{channel.title}
										</p>
										<p className="text-muted-foreground text-xs">
											{channel.description}
										</p>
									</div>
								</div>
								<Button
									className="mt-3 w-full"
									render={<a href={channel.href} />}
									size="sm"
									variant="outline"
								>
									{channel.cta}
								</Button>
							</li>
						);
					})}
				</ul>
			</SectionCard>

			<SectionCard title={SUPPORT_HOURS.heading}>
				<p className="text-muted-foreground text-sm">
					{SUPPORT_HOURS.body}
				</p>
				<div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
					<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
					<div>
						<p className="font-medium text-sm">
							Prefer plain email?
						</p>
						<a
							className="text-primary text-sm underline-offset-4 hover:underline"
							href="mailto:support@smartclinic.app"
						>
							support@smartclinic.app
						</a>
					</div>
				</div>
			</SectionCard>

			<SectionCard title="Looking for something else?">
				<ul className="space-y-2 text-sm">
					<li className="flex items-center gap-2">
						<MessageCircle className="h-4 w-4 text-muted-foreground" />
						<a
							className="text-primary underline-offset-4 hover:underline"
							href="/support"
						>
							Visit the support center
						</a>
					</li>
					<li className="flex items-center gap-2">
						<Mail className="h-4 w-4 text-muted-foreground" />
					</li>
				</ul>
			</SectionCard>
		</div>
	);
}
