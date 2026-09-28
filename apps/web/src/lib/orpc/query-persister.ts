// src/lib/orpc/query-persister.ts
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Persister } from "@tanstack/react-query-persist-client";
import { createStore, del, get, set } from "idb-keyval";

const PERSIST_PREFIX_BLOCKLIST = ["_serverFn", "server-fn"];

/**
 * Predicate used by PersistQueryClientProvider's dehydrateOptions.
 * Exposed separately so __root.tsx can pass it to the provider.
 */
export function shouldPersistQueryKey(queryKey: readonly unknown[]): boolean {
	const [head] = queryKey;
	if (typeof head !== "string") return false;
	return !PERSIST_PREFIX_BLOCKLIST.some((prefix) => head.startsWith(prefix));
}

function createNoopPersister(): Persister {
	const store = new Map<string, string>();
	return {
		persistClient: async () => {},
		restoreClient: async () => undefined,
		removeClient: async () => {
			store.clear();
		},
	};
}

function createPersister(): Persister {
	if (typeof window === "undefined") {
		return createNoopPersister();
	}

	const store = createStore("pedia-care-query-cache", "query-cache");

	return createAsyncStoragePersister({
		storage: {
			getItem: (key) => get<string>(key, store).then((v) => v ?? null),
			setItem: (key, value) => set(key, value, store),
			removeItem: (key) => del(key, store),
		},
		key: "orpc-query-cache",
		throttleTime: 1000,
	});
}

export const queryPersister: Persister = createPersister();
