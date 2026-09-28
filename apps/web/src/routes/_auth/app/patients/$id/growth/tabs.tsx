// src/routes/app/patients/$patientId/growth/tabs.tsx

import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { usePatient } from "@/queries/patients";

export const Route = createFileRoute("/_auth/app/patients/$id/growth/tabs")({
	component: GrowthTabsLayout,
});

function GrowthTabsLayout() {
	const { id: patientId } = Route.useParams();
	const { data: patientData } = usePatient(patientId);
	const patient = patientData;
	const location = useLocation();

	const tabs = [
		{ path: `/app/patients/${patientId}/growth`, label: "Dashboard" },
		{ path: `/app/patients/${patientId}/growth/chart`, label: "Chart" },
		{ path: `/app/patients/${patientId}/growth/history`, label: "History" },
	];

	if (!patient) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="font-bold text-2xl text-slate-800">
					Growth Tracking: {patient.firstName} {patient.lastName}
				</h1>
				<p className="text-slate-500 text-sm">
					MRN: {patient.mrn} ·{" "}
					{patient.gender === "male" ? "Boy" : "Girl"} · DOB:{" "}
					{new Date(patient.dateOfBirth).toLocaleDateString()}
				</p>
			</div>

			<div className="mb-6 border-slate-200 border-b">
				<nav className="flex gap-4">
					{tabs.map((tab) => (
						<Link
							className={`border-b-2 px-4 py-2 font-medium text-sm transition-colors ${
								location.pathname === tab.path
									? "border-teal-600 text-teal-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
							key={tab.path}
							to={tab.path}
						>
							{tab.label}
						</Link>
					))}
				</nav>
			</div>

			<Outlet />
		</div>
	);
}
