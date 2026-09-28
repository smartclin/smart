// src/hooks/use-staff-auth.tsx
import { createContext, type ReactNode, useContext, useMemo } from "react";

type StaffRole = "admin" | "doctor" | "staff";

export interface StaffUser {
	email: string;
	id: string;
	image: string | null;
	name: string;
	role: StaffRole;
	[key: string]: unknown;
}

export interface StaffAuthProviderUser {
	email: string;
	id: string;
	image?: string | null;
	name: string;
	role?: string | null;
	[key: string]: unknown;
}

interface StaffAuthContextValue {
	isAdmin: boolean;
	isDoctor: boolean;
	isStaff: boolean;
	role: StaffRole;
	user: StaffUser;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

export function StaffAuthProvider({
	user,
	children,
}: {
	user: StaffAuthProviderUser;
	children: ReactNode;
}) {
	const value = useMemo<StaffAuthContextValue>(() => {
		const role = (user.role ?? "staff") as StaffRole;
		return {
			user: { ...user, role } as StaffUser,
			role,
			isAdmin: role === "admin",
			isDoctor: role === "doctor",
			isStaff: role === "staff",
		};
	}, [user]);

	return (
		<StaffAuthContext.Provider value={value}>
			{children}
		</StaffAuthContext.Provider>
	);
}

export function useStaffAuth(): StaffAuthContextValue {
	const ctx = useContext(StaffAuthContext);
	if (!ctx) {
		throw new Error(
			"useStaffAuth must be used within a <StaffAuthProvider>"
		);
	}
	return ctx;
}

export function useStaffUser(): StaffUser {
	return useStaffAuth().user;
}
