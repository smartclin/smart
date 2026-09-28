import { env } from "@smart/env/web";
import { Button } from "@smart/ui/components/button";
import { Spinner } from "@smart/ui/components/spinner";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { authMutationKeys } from "@/hooks/auth";
import { authClient } from "@/lib/auth-client";

// ─── Mutation keys ──────────────────────────────────────────────────────────
// Local replacement for BAUI's `authMutationKeys`. Co-locate these with the
// other auth keys (e.g. `@/queries/auth`) if you have more auth mutations.

export type OidcButtonProps = {
	className?: string;
	/**
	 * Path to redirect to after a successful OIDC sign-in.
	 * Defaults to `/`.
	 */
	redirectTo?: string;
};

/**
 * Sign-in button for the server-configured OIDC provider.
 *
 * better-auth's generic-oauth plugin registers the "oidc" provider through the
 * standard `signIn.social` endpoint rather than a plugin-specific one.
 */
export function OidcButton({ className, redirectTo = "/" }: OidcButtonProps) {
	const callbackURL = `${env.VITE_BASE_URL}${redirectTo}`;

	const { mutate: signInSocial, isPending: signInSocialPending } =
		useMutation({
			mutationKey: authMutationKeys.signIn.social,
			mutationFn: async () => {
				const result = await authClient.signIn.social({
					provider: "oidc",
					callbackURL,
				});
				if (result.error) {
					throw new Error(result.error.message ?? "Sign-in failed");
				}
				return result.data;
			},
		});

	const signInMutating = useIsMutating({
		mutationKey: authMutationKeys.signIn.all,
	});
	const signUpMutating = useIsMutating({
		mutationKey: authMutationKeys.signUp.all,
	});
	const isPending = signInMutating + signUpMutating > 0;

	return (
		<Button
			className={className}
			disabled={isPending}
			onClick={() => signInSocial()}
			type="button"
			variant="outline"
		>
			{signInSocialPending && <Spinner />}
			Continue with OIDC
		</Button>
	);
}
