// src/query/types.ts
import type {
	UseInfiniteQueryOptions,
	UseMutationOptions,
	UseQueryOptions,
} from "@tanstack/react-query";

export type QueryError = Error & { message?: string };

export type QueryConfig<TData, TError = QueryError> = Omit<
	UseQueryOptions<TData, TError>,
	"queryKey" | "queryFn"
>;

export type MutationConfig<TData, TVariables, TError = QueryError> = Omit<
	UseMutationOptions<TData, TError, TVariables>,
	"mutationFn"
>;

export type InfiniteQueryConfig<TData, TError = QueryError> = Omit<
	UseInfiniteQueryOptions<TData, TError>,
	"queryKey" | "queryFn" | "initialPageParam"
>;

export interface QueryState<TData = unknown> {
	data: TData | undefined;
	error: QueryError | null;
	isError: boolean;
	isFetching: boolean;
	isLoading: boolean;
	isSuccess: boolean;
}

export type MutationState<TData = unknown> = {
	data: TData | undefined;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: QueryError | null;
};
