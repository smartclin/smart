import { Spinner } from "@smart/ui/components/spinner";
import { cn } from "@smart/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth";

export type SignOutProps = {
	className?: string;
	redirectTo?: string;
};

/**
 * Signs the current user out on mount and renders a centered spinner while
 * the operation completes.
 */
export function SignOut({ className, redirectTo = "/sign-in" }: SignOutProps) {
	const { logout } = useAuth();
	const navigate = useNavigate();
	const hasSignedOut = useRef(false);

	useEffect(() => {
		if (hasSignedOut.current) return;
		hasSignedOut.current = true;

		void (async () => {
			try {
				await logout();
			} catch {
				// swallow — we still want to redirect
			} finally {
				await navigate({ to: redirectTo, replace: true });
			}
		})();
	}, [logout, navigate, redirectTo]);

	return <Spinner className={cn("m-auto", className)} />;
}
