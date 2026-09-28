// src/query/hooks/useInfinitePatients.ts

import { useInfiniteQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/utils";
import type { PatientListFilters } from "./patients";

// ------------------------------------------------------------
// Infinite query options
// ------------------------------------------------------------

export function infinitePatientsQueryOptions(
	filters: PatientListFilters = {},
	pageSize = 50
) {
	// Strip pagination fields from the caller's filters — the infinite
	// query owns `limit` and `offset`.
	const { limit: _limit, offset: _offset, ...rest } = filters;

	return orpc.patient.list.infiniteOptions({
		input: (pageParam: number) => ({
			...rest,
			limit: pageSize,
			offset: pageParam,
		}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, _allPages, lastPageParam) => {
			// Robust termination: if the server returned fewer items than
			// requested, we've reached the end.
			const items = lastPage.data ?? [];
			if (items.length < pageSize) return undefined;

			// Increment the offset by the page size for the next request
			return lastPageParam + pageSize;
		},
	});
}

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

export function useInfinitePatients(
	filters?: PatientListFilters,
	pageSize = 50
) {
	return useInfiniteQuery(infinitePatientsQueryOptions(filters, pageSize));
}
