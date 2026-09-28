import { queryOptions } from "@tanstack/react-query";
import { getUser } from "@/functions/get-user";

export const authQueryOptions = () =>
	queryOptions({
		queryKey: ["auth"],
		queryFn: ({ signal }) => getUser({ signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10,
		refetchOnWindowFocus: true,
		refetchOnMount: false, // Prevents duplicate mounts from firing requests
		retry: 1,
	});
