import {
	extractData,
	extractSingle,
	type SafeResult,
} from "@smart/utils/data-extract";
import { useMemo } from "react";

/**
 * A hook that extracts data from a query result and memoizes the result
 */
export function useExtractData<T>(
	queryResult: SafeResult<T> | null | undefined,
	options?: { fallbackToEmptyArray?: boolean; warnOnUnexpected?: boolean }
): T[] {
	return useMemo(
		() => (extractData<T>(queryResult ?? undefined, options) ?? []) as T[],
		[queryResult, options]
	);
}

/**
 * A hook that extracts a single item from a query result
 */
export function useExtractSingle<T>(
	queryResult: SafeResult<T> | null | undefined
): T | null {
	return useMemo(
		() => extractSingle<T>(queryResult ?? undefined),
		[queryResult]
	);
}

/**
 * Extract data with loading/error state tracking
 */
export function useExtractDataWithState<T>(
	queryResult: SafeResult<T> | null | undefined,
	options?: { fallbackToEmptyArray?: boolean; warnOnUnexpected?: boolean }
) {
	const data = useExtractData<T>(queryResult, options);
	return {
		data,
		isLoading: queryResult?.isLoading ?? false,
		isError:
			queryResult?.error !== undefined && queryResult?.error !== null,
		error: queryResult?.error ?? null,
		isSuccess: queryResult?.isSuccess ?? false,
		refetch: () => Promise.resolve(),
		isFetching: false,
	};
}
