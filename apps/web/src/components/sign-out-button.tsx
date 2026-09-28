import { Button } from "@smart/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { authQueryOptions } from "@/queries/auth";

export function SignOutButton() {
	const queryClient = useQueryClient();
	const router = useRouter();
	return (
		<Button
			className="w-fit"
			onClick={async () => {
				await authClient.signOut({
					fetchOptions: {
						onResponse: async () => {
							// manually set to null to avoid unnecessary refetching
							queryClient.setQueryData(
								authQueryOptions().queryKey,
								null
							);
							await router.invalidate();
						},
					},
				});
			}}
			size="lg"
			type="button"
			variant="destructive"
		>
			Sign out
		</Button>
	);
}
