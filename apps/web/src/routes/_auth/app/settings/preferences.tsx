import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@smart/ui/components/select";
import { Switch } from "@smart/ui/components/switch";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/settings/preferences")({
	component: PreferencesPage,
});

function PreferencesPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
					<CardDescription>
						How the app looks on this device.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Row
						description="Follow your system's light or dark mode."
						label="Theme"
					>
						<Select defaultValue="system">
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="light">Light</SelectItem>
								<SelectItem value="dark">Dark</SelectItem>
								<SelectItem value="system">System</SelectItem>
							</SelectContent>
						</Select>
					</Row>
					<Row
						description="Compact rows in tables and lists."
						label="Density"
					>
						<Select defaultValue="comfortable">
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="comfortable">
									Comfortable
								</SelectItem>
								<SelectItem value="compact">Compact</SelectItem>
							</SelectContent>
						</Select>
					</Row>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
					<CardDescription>
						Choose what you want to be notified about.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-5">
					<Row
						description="New appointment booked for you or your clinic."
						label="New appointments"
					>
						<Switch defaultChecked />
					</Row>
					<Row
						description="Patient checked in and is ready to be seen."
						label="Patient check-ins"
					>
						<Switch defaultChecked />
					</Row>
					<Row
						description="Lab result is ready for review."
						label="Lab results"
					>
						<Switch defaultChecked />
					</Row>
					<Row
						description="Immunization is overdue for one of your patients."
						label="Overdue immunizations"
					>
						<Switch defaultChecked />
					</Row>
					<Row
						description="Daily summary of clinic activity, sent at end of day."
						label="Daily summary email"
					>
						<Switch />
					</Row>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Localization</CardTitle>
					<CardDescription>
						Language, timezone, and regional formats.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Row
						description="Interface language."
						label="Language"
					>
						<Select defaultValue="en">
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="ar">العربية</SelectItem>
							</SelectContent>
						</Select>
					</Row>
					<Row
						description="Used for appointments and reminders."
						label="Timezone"
					>
						<Select defaultValue="utc">
							<SelectTrigger className="w-56">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="utc">UTC</SelectItem>
								<SelectItem value="africa/cairo">
									Africa/Cairo (EET)
								</SelectItem>
								<SelectItem value="asia/dubai">
									Asia/Dubai (GST)
								</SelectItem>
								<SelectItem value="europe/london">
									Europe/London (GMT)
								</SelectItem>
							</SelectContent>
						</Select>
					</Row>
				</CardContent>
			</Card>
		</div>
	);
}

function Row({
	label,
	description,
	children,
}: {
	label: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-6">
			<div className="flex flex-col">
				<span className="font-medium text-foreground text-sm">
					{label}
				</span>
				<span className="text-muted-foreground text-xs">
					{description}
				</span>
			</div>
			{children}
		</div>
	);
}
