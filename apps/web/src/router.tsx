import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import Loader from "./components/loader";
import { createQueryClient } from "./lib/orpc/query-client";
import { orpc } from "./lib/orpc/utils";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
	const queryClient = createQueryClient();

	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		context: { orpc, queryClient },
		defaultPendingComponent: () => <Loader />,
		defaultNotFoundComponent: () => <div>Not Found</div>,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
		wrapQueryClient: true,
	});

	return router;
};

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
