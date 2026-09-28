// orpc/error.ts
import { ORPCError } from "@orpc/server";

export function handleDatabaseError(error: unknown): never {
	if (error instanceof ORPCError) {
		throw error;
	}

	// PostgreSQL error handling
	if (error && typeof error === "object" && "code" in error) {
		const pgError = error as {
			code: string;
			message: string;
			detail?: string;
		};

		const errorMap: Record<
			string,
			{ code: typeof ORPCError.prototype.code; message: string }
		> = {
			"23505": {
				code: "CONFLICT",
				message: "Unique constraint violation",
			},
			"23503": {
				code: "BAD_REQUEST",
				message: "Foreign key constraint violation",
			},
			"23502": {
				code: "BAD_REQUEST",
				message: "Not null constraint violation",
			},
			"22P02": { code: "BAD_REQUEST", message: "Invalid input syntax" },
			"22001": { code: "BAD_REQUEST", message: "String too long" },
		};

		const mapped = errorMap[pgError.code];
		if (mapped) {
			console.error(new Error(pgError.message));
			throw new ORPCError(mapped.code, {
				message: mapped.message,
				data: { detail: pgError.detail },
			});
		}

		console.error(new Error(pgError.message));
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Database error occurred",
		});
	}

	console.error(
		new Error(
			error instanceof Error ? error.message : "Internal server error"
		)
	);
	throw new ORPCError("INTERNAL_SERVER_ERROR", {
		message:
			error instanceof Error ? error.message : "Internal server error",
	});
}
