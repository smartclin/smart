// packages/tanstack/src/query/factory.ts

import {
	GC_TIMES,
	type QueryConfigOptions,
	STALE_TIMES,
} from "@smart/api/config";
import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";

/**
 * Factory for creating consistent query options across the app.
 * Applies STALE_TIMES.DEFAULT (30 s) and GC_TIMES.DEFAULT (1 min) unless
 * the caller passes explicit overrides — this prevents silently inheriting
 * the global QueryClient default of 5 minutes.
 */
export function createQueryOptions<
	TQueryFnData,
	TError = Error,
	TData = TQueryFnData,
	TQueryKey extends readonly unknown[] = readonly unknown[],
>(
	queryKey: TQueryKey,
	queryFn: (context: { signal: AbortSignal }) => Promise<TQueryFnData>,
	config?: Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		"queryKey" | "queryFn"
	>
) {
	return queryOptions({
		staleTime: STALE_TIMES.DEFAULT,
		gcTime: GC_TIMES.DEFAULT,
		queryKey,
		queryFn,
		// Caller config last so explicit staleTime/gcTime overrides win
		...config,
	});
}

/**
 * Factory for detail queries (slower stale time)
 */
export function createDetailQueryOptions<
	TQueryFnData,
	TError = Error,
	TData = TQueryFnData,
	TQueryKey extends readonly unknown[] = readonly unknown[],
>(
	queryKey: TQueryKey,
	queryFn: (context: { signal: AbortSignal }) => Promise<TQueryFnData>,
	config?: Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		"queryKey" | "queryFn"
	> &
		QueryConfigOptions
) {
	return createQueryOptions(queryKey, queryFn, {
		staleTime: config?.staleTime ?? STALE_TIMES.DETAIL,
		gcTime: config?.gcTime ?? GC_TIMES.DETAIL,
		...config,
	});
}

/**
 * Factory for reference data queries (longer stale time)
 */
export function createReferenceQueryOptions<
	TQueryFnData,
	TError = Error,
	TData = TQueryFnData,
	TQueryKey extends readonly unknown[] = readonly unknown[],
>(
	queryKey: TQueryKey,
	queryFn: (context: { signal: AbortSignal }) => Promise<TQueryFnData>,
	config?: Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		"queryKey" | "queryFn"
	> &
		QueryConfigOptions
) {
	return createQueryOptions(queryKey, queryFn, {
		staleTime: config?.staleTime ?? STALE_TIMES.REFERENCE,
		gcTime: config?.gcTime ?? GC_TIMES.REFERENCE,
		...config,
	});
}

/**
 * Factory for static reference data (WHO/CDC, etc.)
 */
export function createStaticReferenceQueryOptions<
	TQueryFnData,
	TError = Error,
	TData = TQueryFnData,
	TQueryKey extends readonly unknown[] = readonly unknown[],
>(
	queryKey: TQueryKey,
	queryFn: (context: { signal: AbortSignal }) => Promise<TQueryFnData>,
	config?: Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		"queryKey" | "queryFn"
	> &
		QueryConfigOptions
) {
	return createQueryOptions(queryKey, queryFn, {
		staleTime: config?.staleTime ?? STALE_TIMES.STATIC_REFERENCE,
		gcTime: config?.gcTime ?? GC_TIMES.STATIC_REFERENCE,
		...config,
	});
}

/**
 * Factory for real-time queries (shorter stale time).
 * These are NOT persisted to IDB — the data is time-sensitive
 * (appointment slots, scheduling conflicts) and stale on the next load.
 */
export function createRealTimeQueryOptions<
	TQueryFnData,
	TError = Error,
	TData = TQueryFnData,
	TQueryKey extends readonly unknown[] = readonly unknown[],
>(
	queryKey: TQueryKey,
	queryFn: (context: { signal: AbortSignal }) => Promise<TQueryFnData>,
	config?: Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		"queryKey" | "queryFn"
	> &
		QueryConfigOptions
) {
	return createQueryOptions(queryKey, queryFn, {
		staleTime: config?.staleTime ?? STALE_TIMES.REAL_TIME,
		gcTime: config?.gcTime ?? GC_TIMES.DEFAULT,
		meta: { persist: false, ...config?.meta },
		...config,
	});
}

/**
 * Factory for critical queries (very short stale time).
 * These are NOT persisted to IDB — dashboard stats and today's schedule
 * must always reflect the live database, not a cached snapshot.
 */
export function createCriticalQueryOptions<
	TQueryFnData,
	TError = Error,
	TData = TQueryFnData,
	TQueryKey extends readonly unknown[] = readonly unknown[],
>(
	queryKey: TQueryKey,
	queryFn: (context: { signal: AbortSignal }) => Promise<TQueryFnData>,
	config?: Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		"queryKey" | "queryFn"
	> &
		QueryConfigOptions
) {
	return createQueryOptions(queryKey, queryFn, {
		staleTime: config?.staleTime ?? STALE_TIMES.CRITICAL,
		gcTime: config?.gcTime ?? GC_TIMES.DEFAULT,
		meta: { persist: false, ...config?.meta },
		...config,
	});
}
