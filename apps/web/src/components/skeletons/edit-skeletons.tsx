import { Card, CardContent, CardHeader } from "@smart/ui/components/card";
import { Skeleton } from "@smart/ui/components/skeleton";

export function EditPatientSkeleton() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
					<Skeleton className="mt-2 h-4 w-48" />
				</CardHeader>
				<CardContent className="space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton
							className="h-12 w-full"
							key={i}
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
