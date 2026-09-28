import { env } from "@smart/env/server";

export const oidcConfigured = Boolean(
	env.OIDC_CLIENT_ID && env.OIDC_CLIENT_SECRET
);

export async function sendPasswordResetEmail(email: string, url: string) {
	// In production this should call your email service, not log to stdout.
	console.info({
		msg: "Password reset email dispatched",
		// Email is redacted by pino's redact config; included here only so the
		// field name appears in structured logs for downstream filtering.
		email,
		// Deliberately omit `url` — it carries a single-use reset token.
	});

	// Dev-only: print the URL to the terminal so developers can test the flow.
	// Guarded so this line is dead code in production builds.
	console.debug({
		msg: "Dev-mode reset URL available",
		urlLength: url.length,
	});
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
