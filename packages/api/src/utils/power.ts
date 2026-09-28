/**
 * Safely validates and returns a string value.
 * Throws an error if the value is null, undefined, or not a string.
 */
export function getRequiredString(value: unknown, fieldName: string): string {
	if (typeof value === "string" && value.trim().length > 0) {
		return value;
	}

	if (typeof value === "number" || typeof value === "bigint") {
		return String(value);
	}

	throw new Error(
		`Missing or invalid required string field "${fieldName}". Received: ${JSON.stringify(value)}`
	);
}

/**
 * Safely converts string, number, or Date objects to a valid JS Date instance.
 * Throws an error if the value is missing or represents an invalid date.
 */
export function getRequiredDate(value: unknown, fieldName: string): Date {
	if (!value) {
		throw new Error(`Missing required date field "${fieldName}".`);
	}

	if (value instanceof Date) {
		if (Number.isNaN(value.getTime())) {
			throw new Error(
				`Invalid Date instance provided for field "${fieldName}".`
			);
		}
		return value;
	}

	if (typeof value === "string" || typeof value === "number") {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return date;
		}
	}

	throw new Error(
		`Field "${fieldName}" cannot be parsed into a valid Date. Received: ${JSON.stringify(value)}`
	);
}
