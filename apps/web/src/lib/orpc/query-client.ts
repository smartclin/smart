import type { StandardRPCJsonSerializedMetaItem } from "@orpc/client/standard";
import { serializer } from "@smart/api/serializer";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
	defaultShouldDehydrateQuery,
	MutationCache,
	QueryCache,
	QueryClient,
} from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { toast } from "sonner";

/**
 * Narrow shape of an oRPC error.
 * We don't rely on `isDefinedError` narrowing here because it collapses to
 * `never` when the client's error union can't be inferred at this layer.
 */
interface ORPCErrorShape {
	code: string;
	data?: unknown;
	message: string;
	status?: number;
}

function isORPCErrorShape(error: unknown): error is ORPCErrorShape {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof (error as { code: unknown }).code === "string" &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	);
}

function handleMutationError(error: unknown) {
	if (isORPCErrorShape(error)) {
		switch (error.code) {
			case "UNAUTHORIZED":
				toast.error("Please log in to continue.");
				setTimeout(() => {
					window.location.assign(
						`/login?redirect=${encodeURIComponent(window.location.pathname)}`
					);
				}, 1500);
				return;
			case "FORBIDDEN":
				toast.error(
					"You don't have permission to perform this action."
				);
				return;
			case "NOT_FOUND":
				toast.error("The requested resource was not found.");
				return;
			case "CONFLICT":
				toast.error(error.message || "A conflict occurred.");
				return;
			case "BAD_REQUEST":
				toast.error(
					error.message || "Invalid request. Please check your input."
				);
				return;
			case "INTERNAL_SERVER_ERROR":
				toast.error("Something went wrong. Please try again later.");
				return;
			default:
				toast.error(error.message || "An unexpected error occurred.");
				return;
		}
	}

	if (error instanceof Error) {
		toast.error(error.message || "An unexpected error occurred.");
		return;
	}

	toast.error("An unexpected error occurred.");
}

export function createQueryClient() {
	const queryClient: QueryClient = new QueryClient({
		queryCache: new QueryCache({
			onError: (error, query) => {
				if (query.state.data !== undefined) return;
				toast.error(
					error instanceof Error ? error.message : "Request failed",
					{
						action: {
							label: "Retry",
							onClick: () => {
								void query.invalidate();
							},
						},
					}
				);
			},
		}),

		mutationCache: new MutationCache({
			onSuccess: (_data, _variables, _context, mutation) => {
				const mutationKey = mutation.options?.mutationKey;
				if (!mutationKey || mutationKey.length === 0) return;

				const primaryKey = String(mutationKey[0]);

				const pluralMap: Record<string, string> = {
					patient: "patients",
					appointment: "appointments",
					clinic: "clinics",
					vaccination: "vaccinations",
					encounter: "encounters",
				};

				void queryClient.invalidateQueries({ queryKey: [primaryKey] });
				const plural = pluralMap[primaryKey];
				if (plural) {
					void queryClient.invalidateQueries({ queryKey: [plural] });
				}

				if (
					[
						"patient",
						"patients",
						"appointment",
						"appointments",
						"vaccination",
						"vaccinations",
						"encounter",
						"encounters",
					].includes(primaryKey)
				) {
					void queryClient.invalidateQueries({
						queryKey: ["dashboard"],
					});
				}

				if (mutationKey.some((k) => String(k).includes("auth"))) {
					void queryClient.invalidateQueries({ queryKey: ["auth"] });
				}
			},

			onError: (error) => {
				handleMutationError(error);
			},
		}),

		defaultOptions: {
			queries: {
				staleTime: 30_000,
				gcTime: 5 * 60_000,
				retry: 1,
				refetchOnWindowFocus: false,
				queryKeyHashFn(queryKey) {
					const [json, meta] = serializer.serialize(queryKey);
					return JSON.stringify({ json, meta });
				},
			},

			dehydrate: {
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
				serializeData(data) {
					const [json, meta] = serializer.serialize(data);
					return { json, meta };
				},
			},

			hydrate: {
				deserializeData(data: {
					json: unknown;
					meta: readonly StandardRPCJsonSerializedMetaItem[];
				}) {
					return serializer.deserialize(data.json, data.meta);
				},
			},

			mutations: {
				retry: 1,
			},
		},
	});

	return queryClient;
}

export function setupQueryPersistence(queryClient: QueryClient) {
	if (typeof window === "undefined") return;

	const persister = createAsyncStoragePersister({
		storage: window.localStorage,
		key: "orpc-query-cache",
		throttleTime: 1000,
	});

	void persistQueryClient({
		queryClient,
		persister,
		maxAge: 1000 * 60 * 60 * 24,
		dehydrateOptions: {
			shouldDehydrateQuery: (query) =>
				query.state.status === "success" &&
				defaultShouldDehydrateQuery(query),
		},
	});
}
