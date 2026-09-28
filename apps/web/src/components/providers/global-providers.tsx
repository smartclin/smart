import { ThemeProvider } from "@smart/ui/components/theme-provider";
import { TooltipProvider } from "@smart/ui/components/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";
import { createQueryClient } from "@/lib/orpc/query-client";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "./auth-provider";

type GlobalProvidersProps = {
	children?: React.ReactNode;
	layout?: React.ReactNode;
};

export const GlobalProviders = ({ children, layout }: GlobalProvidersProps) => {
	const [queryClient] = useState(createQueryClient);
	const router = useRouter();

	return (
		<QueryClientProvider client={queryClient}>
			<StoreProvider>
				<AuthProvider
					authClient={authClient}
					navigate={(options) => void router.navigate(options)}
					queryClient={queryClient}
				>
					<ThemeProvider defaultMode="auto">
						<TooltipProvider>
							{layout ?? children}
							<Toaster position="bottom-right" />
						</TooltipProvider>
					</ThemeProvider>
				</AuthProvider>
				<ReactQueryDevtools buttonPosition="bottom-left" />
			</StoreProvider>
		</QueryClientProvider>
	);
};
