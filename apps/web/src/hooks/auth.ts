import type { Role } from "@smart/auth/roles";
import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import { authQueryOptions } from "../queries/auth";

/**
 * These hooks can be used in our components.
 * They share the same deduped query as beforeLoad/loaders in __root and the _auth layout,
 * so these will not result in unnecessary duplicate calls.
 *
 * For reading auth data in loaders/beforeLoad,
 * we can use `authQueryOptions` from queries.ts with `queryClient` from loader context.
 */

export function useAuth() {
	const queryClient = useQueryClient();
	const { data: user, isPending, error } = useQuery(authQueryOptions());

	const roles = user?.role ? [user.role] : [];

	const hasPermission = async (permission: string): Promise<boolean> => {
		try {
			const result = await authClient.organization.hasPermission({
				permissions: { [permission]: ["*"] },
			});
			return result.data?.success ?? false;
		} catch {
			return false;
		}
	};

	const hasRole = (roleOrRoles: Role | Role[]) => {
		const targets = Array.isArray(roleOrRoles)
			? roleOrRoles
			: [roleOrRoles];
		return targets.some((role) => roles.includes(role));
	};

	const logout = async (): Promise<void> => {
		await authClient.signOut();
		queryClient.setQueryData(["auth"], null);
		await queryClient.invalidateQueries({ queryKey: ["auth"] });
	};

	const refresh = async (): Promise<void> => {
		await queryClient.invalidateQueries({ queryKey: ["auth"] });
	};

	return { user, isPending, error, hasPermission, hasRole, logout, refresh };
}

export function useAuthSuspense() {
	const queryClient = useQueryClient();
	const { data: user, error } = useSuspenseQuery(authQueryOptions());

	const roles = user?.role ? [user.role] : [];

	const hasPermission = async (permission: string): Promise<boolean> => {
		try {
			const result = await authClient.organization.hasPermission({
				permissions: { [permission]: ["*"] },
			});
			return result.data?.success ?? false;
		} catch {
			return false;
		}
	};

	const hasRole = (roleOrRoles: Role | Role[]) => {
		const targets = Array.isArray(roleOrRoles)
			? roleOrRoles
			: [roleOrRoles];
		return targets.some((role) => roles.includes(role));
	};

	const logout = async (): Promise<void> => {
		await authClient.signOut();
		queryClient.setQueryData(["auth"], null);
		await queryClient.invalidateQueries({ queryKey: ["auth"] });
	};

	const refresh = async (): Promise<void> => {
		await queryClient.invalidateQueries({ queryKey: ["auth"] });
	};

	return { user, error, hasPermission, hasRole, logout, refresh };
}
export const authMutationKeys = {
	all: ["auth"] as const,
	signIn: {
		all: ["auth", "signIn"] as const,
		social: ["auth", "signIn", "social"] as const,
	},
	signUp: {
		all: ["auth", "signUp"] as const,
	},
} as const;
