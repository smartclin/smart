import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@smart/ui/components/avatar";
import { Badge } from "@smart/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Separator } from "@smart/ui/components/separator";
import { getInitial } from "@smart/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

import { useAuthUser } from "@/lib/store";

export const Route = createFileRoute("/_auth/app/settings/")({
	component: MyAccountPage,
});

function MyAccountPage() {
	const user = useAuthUser();

	if (!user) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground text-sm">
					You are not signed in.
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>
						Your name and photo are visible to other clinic staff.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center gap-4">
					<Avatar className="size-16">
						<AvatarImage
							alt={user.name}
							src={user.image ?? ""}
						/>
						<AvatarFallback>{getInitial(user.name)}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="font-medium text-foreground text-lg">
							{user.name}
						</span>
						<span className="text-muted-foreground text-sm">
							{user.email}
						</span>
						<Badge
							className="mt-1.5 w-fit capitalize"
							variant="secondary"
						>
							{user.role}
						</Badge>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Contact</CardTitle>
					<CardDescription>
						How other staff reach you during clinic hours.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Field
						label="Email"
						value={user.email}
					/>
					<Separator />
					{/* Placeholder — wire to your staff record if you have one */}
					<Field
						label="Phone"
						value="—"
					/>
					<Separator />
					<Field
						label="Role"
						value={user.role}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Security</CardTitle>
					<CardDescription>
						Password and two-factor authentication.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{/*
						Wire these buttons to real mutations from your auth router.
						Example: orpc.auth.changePassword.mutationOptions()
					*/}
					<button
						className="w-fit text-primary text-sm underline-offset-4 hover:underline"
						type="button"
					>
						Change password
					</button>
					<button
						className="w-fit text-primary text-sm underline-offset-4 hover:underline"
						type="button"
					>
						Enable two-factor authentication
					</button>
				</CardContent>
			</Card>
		</div>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className="text-foreground text-sm">{value}</span>
		</div>
	);
}
