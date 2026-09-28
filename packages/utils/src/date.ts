export function combineDateAndTime(
	dateStr: string,
	timeValue: string | Date | undefined
): Date | null {
	if (!(dateStr && timeValue)) return null;

	let hours: number;
	let minutes: number;

	if (timeValue instanceof Date) {
		hours = timeValue.getHours();
		minutes = timeValue.getMinutes();
	} else {
		const parts = timeValue.split(":");
		hours = Number(parts[0]);
		minutes = Number(parts[1] ?? 0);
	}

	if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

	const dateParts = dateStr.split("-").map(Number);
	if (dateParts.length !== 3) return null;

	const [y, mo, d] = dateParts as [number, number, number];
	if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d)) return null;

	return new Date(y, mo - 1, d, hours, minutes);
}
