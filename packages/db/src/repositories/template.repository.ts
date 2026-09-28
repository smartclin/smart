// src/db/repositories/template.repository.ts
import { and, desc, eq, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { queryCache } from "../cache";
import { type NewTemplate, type Template, templates } from "../schema";
import { type DB, type DBorTx, db, type Transaction } from "../server";
import { BaseRepository, type BaseRow } from "./base.repository";

const CACHE_TTL = 60_000;
const LIST_CACHE_TTL = 30_000;

// ============================================================
// Types
// ============================================================

export type FindAllOptions = {
	category?: string;
	limit?: number;
	offset?: number;
};

export type CountOptions = {
	category?: string;
};

// ============================================================
// Cast helpers
// ============================================================

const asTemplate = (row: BaseRow): Template => row as Template;
const asTemplates = (rows: BaseRow[]): Template[] => rows as Template[];
const toBaseRow = (data: object): BaseRow => data as BaseRow;

// ============================================================
// Guards
// ============================================================

// function isRecord(value: unknown): value is Record<string, unknown> {
// 	return typeof value === "object" && value !== null && !Array.isArray(value);
// }

// ============================================================
// Filters
// ============================================================

function buildTemplateWhere(options: FindAllOptions): SQL | undefined {
	const conditions: SQL[] = [];
	const { category } = options;

	if (category) {
		conditions.push(eq(templates.category, category));
	}

	if (conditions.length === 0) return undefined;
	if (conditions.length === 1) return conditions[0];
	return and(...conditions);
}

// ============================================================
// Repository
// ============================================================

export class TemplateRepository extends BaseRepository {
	protected readonly table = templates;
	protected readonly idColumn: PgColumn = templates.id;
	protected readonly tableName = "templates";

	constructor(database: DB | Transaction | DBorTx = db) {
		super(database);
	}

	// --------------------------------------------------------------------------
	// Public CRUD
	// --------------------------------------------------------------------------

	async findById(id: string): Promise<Template | null> {
		const row = await this.findByIdImpl(id);
		return row ? asTemplate(row) : null;
	}

	async delete(id: string): Promise<boolean> {
		const result = await this.deleteImpl(id);
		if (result) {
			this.invalidateAfterWrite([id]);
		}
		return result;
	}

	// --------------------------------------------------------------------------
	// Reads
	// --------------------------------------------------------------------------

	async findAll(options: FindAllOptions = {}): Promise<{
		data: Template[];
		total: number;
	}> {
		const { limit = 50, offset = 0 } = options;

		const cacheKey = `templates:list:${JSON.stringify(options)}`;
		const cached = queryCache.get<{ data: Template[]; total: number }>(
			cacheKey
		);
		if (cached) return cached;

		const where = buildTemplateWhere(options);

		const [rows, total] = await Promise.all([
			this.findManyImpl(where, {
				limit,
				offset,
				orderBy: desc(templates.updatedAt),
			}),
			this.count(where),
		]);

		const result = {
			data: asTemplates(rows),
			total,
		};

		queryCache.set(cacheKey, result, {
			ttl: LIST_CACHE_TTL,
			tags: ["templates:list"],
		});

		return result;
	}

	async findByCategory(category: string): Promise<Template[]> {
		const cacheKey = `templates:category:${category}`;
		const cached = queryCache.get<Template[]>(cacheKey);
		if (cached) return cached;

		const rows = await this.findManyImpl(eq(templates.category, category), {
			orderBy: desc(templates.updatedAt),
		});
		const result = asTemplates(rows);

		queryCache.set(cacheKey, result, {
			ttl: CACHE_TTL,
			tags: [`templates:category:${category}`],
		});

		return result;
	}

	// --------------------------------------------------------------------------
	// Count
	// --------------------------------------------------------------------------

	async countBy(options: CountOptions = {}): Promise<number> {
		const cacheKey = `templates:count:${JSON.stringify({
			category: options.category,
		})}`;
		const cached = queryCache.get<number>(cacheKey);
		if (cached !== null) return cached;

		const where = buildTemplateWhere(options);
		const value = await this.count(where);

		queryCache.set(cacheKey, value, {
			ttl: CACHE_TTL,
			tags: ["templates:count"],
		});

		return value;
	}

	// --------------------------------------------------------------------------
	// Writes
	// --------------------------------------------------------------------------

	async create(data: NewTemplate): Promise<Template> {
		const row = await this.createImpl(toBaseRow(data));
		const result = asTemplate(row);

		this.invalidateAfterWrite([result.id]);
		return result;
	}

	async update(
		id: string,
		data: Partial<NewTemplate>
	): Promise<Template | null> {
		const row = await this.updateImpl(
			id,
			toBaseRow(data),
			/* hasUpdatedAt */ true
		);
		if (!row) return null;

		const result = asTemplate(row);
		this.invalidateAfterWrite([result.id]);
		return result;
	}

	// --------------------------------------------------------------------------
	// Cache invalidation
	// --------------------------------------------------------------------------

	private invalidateAfterWrite(templateIds: string[]): void {
		queryCache.invalidateTag("templates:list");
		queryCache.invalidateTag("templates:count");

		for (const templateId of new Set(templateIds)) {
			queryCache.invalidate(`templates:${templateId}`);
			queryCache.invalidatePrefix("templates:category:");
		}
	}
}

export const templateRepository = new TemplateRepository(db);
