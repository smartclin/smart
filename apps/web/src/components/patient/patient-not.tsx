import { Button } from "@smart/ui/components/button";
import { Card, CardContent } from "@smart/ui/components/card";
import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";

export function PatientNotFound({ patientId }: { patientId: string }) {
	return (
		<div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<User className="h-12 w-12 text-muted-foreground/40" />
					<h3 className="mt-4 font-semibold text-lg">
						Patient not found
					</h3>
					<p className="text-muted-foreground text-sm">
						It may have been deleted, or you may not have access.
					</p>
					<Link
						params={{ id: patientId }}
						to="/app/patients/$id"
					>
						<Button className="mt-4">Back to patient</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
