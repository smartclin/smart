// packages/api/src/index.ts
import { ORPCError, os } from "@orpc/server";
import { roleEnum } from "@smart/db/schema/enums";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});
export const protectedProcedure = publicProcedure.use(requireAuth);

export function getClinicId(context: Context): string {
	if (!context.clinicId) {
		throw new ORPCError("FORBIDDEN", {
			message: "Clinic membership required",
		});
	}
	return context.clinicId;
}

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(
	async ({ next, context }) => {
		const { user } = context;
		if (user?.role !== "admin") {
			throw new ORPCError("FORBIDDEN", {
				message: "Admin role required",
			});
		}
		return next();
	}
);

export const doctorProcedure = protectedProcedure.use(
	async ({ next, context }) => {
		const { user } = context;
		if (!["admin", "doctor"].includes(user?.role || "")) {
			throw new ORPCError("FORBIDDEN", {
				message: "Admin or doctor role required",
			});
		}
		return next();
	}
);

/**
 * Staff procedure - requires admin, doctor, or staff role
 */
export const staffProcedure = protectedProcedure.use(
	async ({ next, context }) => {
		const { user } = context;
		const userRole = user?.role;
		if (
			!(
				userRole &&
				roleEnum.enumValues.includes(
					userRole as (typeof roleEnum.enumValues)[number]
				)
			)
		) {
			throw new ORPCError("FORBIDDEN", {
				message: "Admin, doctor, or staff role required",
			});
		}
		return next();
	}
);
