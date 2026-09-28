// packages/db/src/repositories/factory.ts

import {
	appointmentRepository,
	encounterRepository,
	growthRepository,
	immunizationRepository,
	labRepository,
	patientRepository,
	prescriptionRepository,
	staffRepository,
	vitalRepository,
	whoGrowthRepository,
} from "@smart/db/repositories";

export interface Repositories {
	appointment: typeof appointmentRepository;
	encounter: typeof encounterRepository;
	growth: typeof growthRepository;
	immunization: typeof immunizationRepository;
	lab: typeof labRepository;
	patient: typeof patientRepository;
	prescription: typeof prescriptionRepository;
	staff: typeof staffRepository;
	vital: typeof vitalRepository;
	whoGrowth: typeof whoGrowthRepository;
}

export class RepositoryFactory {
	private static instance: RepositoryFactory;
	private readonly repos: Map<string, unknown> = new Map();

	private constructor() {}

	static getInstance(): RepositoryFactory {
		RepositoryFactory.instance = new RepositoryFactory();
		return RepositoryFactory.instance;
	}

	private getOrCreate<T>(key: string, repository: T): T {
		if (!this.repos.has(key)) {
			this.repos.set(key, repository);
		}
		return this.repos.get(key) as T;
	}

	getRepositories(): Repositories {
		return {
			appointment: this.getOrCreate("appointment", appointmentRepository),
			encounter: this.getOrCreate("encounter", encounterRepository),
			growth: this.getOrCreate("growth", growthRepository),
			immunization: this.getOrCreate(
				"immunization",
				immunizationRepository
			),
			lab: this.getOrCreate("lab", labRepository),
			patient: this.getOrCreate("patient", patientRepository),
			prescription: this.getOrCreate(
				"prescription",
				prescriptionRepository
			),
			staff: this.getOrCreate("staff", staffRepository),
			vital: this.getOrCreate("vital", vitalRepository),
			whoGrowth: this.getOrCreate("whoGrowth", whoGrowthRepository),
		};
	}

	getRepository<K extends keyof Repositories>(key: K): Repositories[K] {
		const repos = this.getRepositories();
		return repos[key];
	}

	clearCache(): void {
		this.repos.clear();
	}
}

export const repoFactory = RepositoryFactory.getInstance();
