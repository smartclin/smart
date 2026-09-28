import type { QueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import type { authClient } from "@/lib/auth-client";

type NavigateOptions = Parameters<
	ReturnType<typeof import("@tanstack/react-router").useRouter>["navigate"]
>[0];

type AuthProviderProps = {
	authClient: typeof authClient;
	navigate: (options: NavigateOptions) => void | Promise<void>;
	queryClient: QueryClient;
	children: React.ReactNode;
};

type AuthContextValue = Omit<AuthProviderProps, "children">;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
	authClient,
	navigate,
	queryClient,
	children,
}: AuthProviderProps) {
	return (
		<AuthContext.Provider value={{ authClient, navigate, queryClient }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within <AuthProvider>");
	}
	return ctx;
}
