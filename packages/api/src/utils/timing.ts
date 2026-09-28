import { AsyncLocalStorage } from "node:async_hooks";

interface DrizzleTiming {
	duration: number;
	model: string;
	operation: string;
}

interface TimingStore {
	drizzle: DrizzleTiming[];
}

export const timingStore = new AsyncLocalStorage<TimingStore>();
