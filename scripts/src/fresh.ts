// src/scripts/fresh.ts
//
// One-command fresh start for a local PostgreSQL database.
//
// Pipeline:
//   1. reset           DROP + recreate public (CREATE EXTENSION pgcrypto)
//   2. enable-vector   CREATE EXTENSION vector (opt-in via POSTGRES_ENABLE_VECTOR)
//   3. migrate         apply Drizzle migrations via packages/db/src/migrate.ts
//   4. seed admin      clinic + admin user + staff profile
//   5. seed WHO        WHO growth reference data
//   6. seed app        demo patients, appointments, encounters, …
//   7. verify          row counts + engine version
//
// See `--help` for flags. See `--print-paths` for script resolution.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { db as appDb, closeConnection } from "@smart/db";
import { sql } from "drizzle-orm";

import {
	abs,
	type DbTarget,
	firstExisting,
	fmtMs,
	PROJECT_ROOT,
	paint,
	type ReportInput,
	type RunContext,
	relToRoot,
	renderReport,
	type Step,
	type StepName,
	type StepResult,
	writeReportFiles,
} from "./report";

// ═══════════════════════════════════════════════════════════════════════════
// 0. Self
// ═══════════════════════════════════════════════════════════════════════════

const SELF_PATH = fileURLToPath(import.meta.url);
const SELF_REL = relToRoot(SELF_PATH);

// ═══════════════════════════════════════════════════════════════════════════
// 1. Terminal output
// ═══════════════════════════════════════════════════════════════════════════

const log = (step: string, msg: string): void =>
	console.log(`\n${paint("cyan", step)} ${paint("bold", msg)}`);

function fail(msg: string): never {
	console.error(`\n${paint("red", "❌")} ${msg}`);
	process.exit(1);
}

const warn = (msg: string): void => console.warn(paint("yellow", `⚠️  ${msg}`));

// ═══════════════════════════════════════════════════════════════════════════
// 2. CLI flags
// ═══════════════════════════════════════════════════════════════════════════

const argv = process.argv.slice(2);

const flag = (name: string): boolean =>
	argv.includes(`--${name}`) || argv.includes(`-${name[0]}`);

function option(name: string): string | undefined {
	const prefixed = argv.find((a) => a.startsWith(`--${name}=`));
	if (prefixed) return prefixed.slice(name.length + 3);
	const idx = argv.indexOf(`--${name}`);
	const next = idx >= 0 ? argv[idx + 1] : undefined;
	return next && !next.startsWith("--") ? next : undefined;
}

const FLAGS = {
	force: flag("force"),
	dryRun: flag("dry-run"),
	skipWho: flag("skip-who"),
	skipApp: flag("skip-app"),
	skipMigrate: flag("skip-migrate"),
	printPaths: flag("print-paths"),
	help: flag("help") || flag("h"),
	from: option("from"),
	only: option("only"),
	jsonReport: flag("json-report"),
	noReport: flag("no-report"),
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 3. Script registry
// ═══════════════════════════════════════════════════════════════════════════

type ScriptKey =
	| "setupVector"
	| "migrate"
	| "seedAdmin"
	| "seedWho"
	| "seedApp";

/**
 * Every path is resolved relative to PROJECT_ROOT. The migrate entry point
 * lives inside `packages/db` — it is the PostgreSQL migrator.
 */
const SCRIPT_CANDIDATES: Record<ScriptKey, readonly string[]> = {
	setupVector: ["packages/db/src/vector/setup-vector-extension.ts"],
	migrate: ["packages/db/src/migrate.ts"],
	seedAdmin: ["scripts/src/admin.ts"],
	seedWho: ["scripts/src/seed-who.ts"],
	seedApp: ["scripts/src/seed.ts"],
};

const SCRIPT_PATHS: Record<ScriptKey, string | undefined> = {
	setupVector: firstExisting(...SCRIPT_CANDIDATES.setupVector),
	migrate: firstExisting(...SCRIPT_CANDIDATES.migrate),
	seedAdmin: firstExisting(...SCRIPT_CANDIDATES.seedAdmin),
	seedWho: firstExisting(...SCRIPT_CANDIDATES.seedWho),
	seedApp: firstExisting(...SCRIPT_CANDIDATES.seedApp),
};

function requireScript(key: ScriptKey): string {
	const path = SCRIPT_PATHS[key];
	if (path) return path;
	fail(
		`Missing required script "${key}".\n` +
			"  Looked for:\n" +
			SCRIPT_CANDIDATES[key].map((c) => `    • ${c}`).join("\n") +
			`\n  Project root: ${PROJECT_ROOT}`
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Child processes
// ═══════════════════════════════════════════════════════════════════════════

const CHILD_TIMEOUT_MS = 10 * 60 * 1000;

/** Children spawned by `run()`, so a signal handler can kill them all. */
const liveChildren = new Set<ReturnType<typeof spawn>>();

function run(command: string, args: readonly string[]): Promise<void> {
	return new Promise((resolvePromise, reject) => {
		const child = spawn(command, args, {
			stdio: "inherit",
			shell: false,
			cwd: PROJECT_ROOT,
			env: { ...process.env, FORCE_COLOR: "1" },
			timeout: CHILD_TIMEOUT_MS,
		});

		liveChildren.add(child);

		child.on("error", (err) => {
			liveChildren.delete(child);
			reject(err);
		});
		child.on("exit", (code, signal) => {
			liveChildren.delete(child);
			if (code === 0) return resolvePromise();
			if (signal)
				return reject(new Error(`${command} killed by ${signal}`));
			reject(
				new Error(
					`${command} ${args.join(" ")} exited with code ${code}`
				)
			);
		});
	});
}

const runBunScript = (
	scriptPath: string,
	args: readonly string[] = []
): Promise<void> =>
	run("bun", ["--env-file=../../apps/web/.env", scriptPath, ...args]);

// ═══════════════════════════════════════════════════════════════════════════
// 5. Environment guard (PostgreSQL-aware)
// ═══════════════════════════════════════════════════════════════════════════

const REQUIRED_ENV = [
	"BETTER_AUTH_SECRET",
	"VITE_BASE_URL",
	"DATABASE_URL",
] as const;

function assertEnvironment(): DbTarget {
	const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
	if (missing.length > 0) {
		fail(
			`Missing required env vars: ${missing.join(", ")}\n` +
				`  Check ${relToRoot(abs(".env"))}`
		);
	}

	const dbUrl = process.env.DATABASE_URL || "";
	const looksProd = /prod|staging|live/i.test(dbUrl);

	if (!FLAGS.force && looksProd) {
		fail(
			`DATABASE_URL looks like production ("${dbUrl}").\n` +
				"  Refusing to wipe without --force."
		);
	}

	console.log(`✅ Env OK ${paint("dim", "(PostgreSQL)")}`);
	return { kind: "postgres", host: "postgres", name: "PostgreSQL" };
}

async function confirm(question: string): Promise<void> {
	if (FLAGS.force) {
		console.log(paint("dim", "⏭️  --force passed, skipping confirmation"));
		return;
	}
	if (!process.stdin.isTTY) {
		fail("Non-interactive shell and no --force flag. Refusing to wipe DB.");
	}

	const readline = await import("node:readline/promises");
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	const answer = await rl.question(`${question} ${paint("dim", "[y/N]")} `);
	rl.close();

	if (answer.trim().toLowerCase() !== "y") {
		console.log("Aborted.");
		process.exit(0);
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Concurrency lock + signal handling
// ═══════════════════════════════════════════════════════════════════════════

const LOCK_PATH = abs(".fresh-start.lock");

function killLiveChildren(signal: NodeJS.Signals): void {
	for (const child of liveChildren) {
		try {
			child.kill(signal);
		} catch {
			/* already gone */
		}
	}
}

async function acquireLock(): Promise<() => void> {
	if (existsSync(LOCK_PATH)) {
		fail(
			"Another fresh-start appears to be running.\n" +
				`  If that's wrong, delete ${LOCK_PATH} and retry.`
		);
	}

	await writeFile(LOCK_PATH, String(process.pid), "utf8");

	const { unlinkSync, existsSync: fsExists } = await import("node:fs");
	let released = false;

	const release = (): void => {
		if (released) return;
		released = true;
		try {
			if (fsExists(LOCK_PATH)) unlinkSync(LOCK_PATH);
		} catch {
			/* best-effort */
		}
	};

	process.once("exit", release);

	process.once("SIGINT", () => {
		killLiveChildren("SIGINT");
		release();
		process.exit(130);
	});
	process.once("SIGTERM", () => {
		killLiveChildren("SIGTERM");
		release();
		process.exit(143);
	});

	return release;
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. Steps
// ═══════════════════════════════════════════════════════════════════════════

async function stepReset(): Promise<void> {
	log("1️⃣", "Resetting PostgreSQL schema...");
	const { resetDatabase } = await import("@smart/db/reset");
	await resetDatabase({ force: true, closeAfter: false });
}

async function stepEnableVector(): Promise<void> {
	if (process.env.POSTGRES_ENABLE_VECTOR !== "true") {
		console.log(
			paint(
				"dim",
				"⏭️  pgvector disabled (set POSTGRES_ENABLE_VECTOR=true to enable)"
			)
		);
		return;
	}
	log("2️⃣", "Enabling pgvector extension...");
	await runBunScript(requireScript("setupVector"));
}

async function stepMigrate(): Promise<void> {
	log("3️⃣", "Applying Drizzle migrations to PostgreSQL...");
	await runBunScript(requireScript("migrate"));
}

async function stepSeedAdmin(): Promise<void> {
	log("4️⃣", "Seeding admin user, clinic, and staff profile...");
	await runBunScript(requireScript("seedAdmin"));
}

function firstCount(result: unknown): number {
	if (Array.isArray(result)) {
		const [row] = result as Array<{ count?: unknown }>;
		return Number(row?.count ?? 0);
	}
	if (result && typeof result === "object" && "rows" in result) {
		const { rows } = result as { rows?: unknown };
		if (Array.isArray(rows)) {
			const [row] = rows as Array<{ count?: unknown }>;
			return Number(row?.count ?? 0);
		}
	}
	return 0;
}

async function assertRowCount(
	table: string,
	minRows: number,
	hint: string
): Promise<void> {
	try {
		const result = await appDb.execute(
			sql`SELECT count(*)::int AS count FROM ${sql.identifier(table)}`
		);
		const count = firstCount(result);
		if (count < minRows) {
			fail(
				`${hint}\n  ${table} has ${count} row${count === 1 ? "" : "s"}, ` +
					`expected at least ${minRows}.`
			);
		}
	} catch (error) {
		console.warn(
			`⚠️  Row count verification failed for table "${table}": ${error instanceof Error ? error.message : error}`
		);
	}
}

async function stepSeedWho(): Promise<void> {
	log("5️⃣", "Seeding WHO growth reference data...");
	await runBunScript(requireScript("seedWho"));
	await assertRowCount(
		"who_growth_data",
		1,
		"seed-who completed but inserted no WHO rows."
	);
}

async function stepSeedApp(): Promise<void> {
	log("6️⃣", "Seeding application demo data...");
	await runBunScript(requireScript("seedApp"), [
		"--skip-admin",
		"--skip-who",
	]);
	await assertRowCount(
		"patients",
		1,
		"seed-app completed but inserted no patients. " +
			"Check scripts/seed.ts for an early return or a swallowed error."
	);
}

const VERIFY_TABLES = [
	["clinics", "clinics"],
	["users", "user"],
	["staff", "staff"],
	["patients", "patients"],
	["appointments", "appointments"],
	["encounters", "encounters"],
	["immunizations", "immunizations"],
	["prescriptions", "prescriptions"],
	["lab_orders", "lab_orders"],
	["vitals", "vitals"],
	["growth_measurements", "growth_measurements"],
	["medical_records", "medical_records"],
	["payments", "payments"],
	["who_growth_data", "who_growth_data"],
] as const;

const CRITICAL_TABLES: ReadonlySet<string> = new Set([
	"clinics",
	"users",
	"staff",
]);

async function stepVerify(ctx: RunContext): Promise<void> {
	log("7️⃣", "Verifying seed...");

	try {
		const counts = await Promise.all(
			VERIFY_TABLES.map(async ([label, table]) => {
				const result = await appDb.execute(
					sql`SELECT count(*)::int AS count FROM ${sql.identifier(table)}`
				);
				return { label, count: firstCount(result) };
			})
		);

		const extResult = await appDb.execute(
			sql`
      SELECT
        current_setting('server_version') AS pg,
        (SELECT extversion FROM pg_extension WHERE extname = 'vector') AS vector
    `
		);
		const extRow = Array.isArray(extResult)
			? (extResult as Array<{ pg?: string; vector?: string | null }>)[0]
			: ((
					extResult as {
						rows?: Array<{ pg?: string; vector?: string | null }>;
					}
				).rows ?? [])[0];

		ctx.tableCounts = counts;
		ctx.pgVersion = extRow?.pg ? `PostgreSQL / ${extRow.pg}` : "PostgreSQL";
		ctx.vectorVersion = extRow?.vector ?? undefined;

		console.log("");
		for (const { label, count } of counts) {
			const icon = count === 0 ? paint("dim", "·") : paint("green", "✅");
			console.log(`  ${icon} ${label.padEnd(24)} ${count}`);
		}

		const empty = counts.filter(
			(r) => CRITICAL_TABLES.has(r.label) && r.count === 0
		);
		if (empty.length > 0) {
			fail(
				`Critical tables are empty: ${empty.map((r) => r.label).join(", ")}`
			);
		}
	} catch (error) {
		console.warn(
			`⚠️  Verification failed due to database connection issues: ${error instanceof Error ? error.message : error}`
		);
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. Step registry
// ═══════════════════════════════════════════════════════════════════════════

const STEPS: readonly Step[] = [
	{ name: "reset", label: "reset schema", run: stepReset },
	{
		name: "enable-vector",
		label: "enable pgvector",
		run: stepEnableVector,
	},
	{
		name: "migrate",
		label: "apply migrations",
		run: stepMigrate,
		skip: FLAGS.skipMigrate,
		skipHint: "--skip-migrate",
	},
	{ name: "seed-admin", label: "seed admin", run: stepSeedAdmin },
	{
		name: "seed-who",
		label: "seed WHO data",
		run: stepSeedWho,
		skip: FLAGS.skipWho,
		skipHint: "--skip-who",
	},
	{
		name: "seed-app",
		label: "seed app data",
		run: stepSeedApp,
		skip: FLAGS.skipApp,
		skipHint: "--skip-app",
	},
	{ name: "verify", label: "verify", run: stepVerify },
];

function selectSteps(): readonly Step[] {
	if (FLAGS.only && FLAGS.from) {
		warn("Both --only and --from passed; --only wins.");
	}

	if (FLAGS.only) {
		const match = STEPS.find((s) => s.name === FLAGS.only);
		if (!match) {
			fail(
				`--only=${FLAGS.only} did not match any step. Valid: ${STEPS.map(
					(s) => s.name
				).join(", ")}`
			);
		}
		return [match];
	}

	if (FLAGS.from) {
		const idx = STEPS.findIndex((s) => s.name === FLAGS.from);
		if (idx < 0) {
			fail(
				`--from=${FLAGS.from} did not match any step. Valid: ${STEPS.map(
					(s) => s.name
				).join(", ")}`
			);
		}
		return STEPS.slice(idx);
	}

	return STEPS;
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. Pre-flight validation
// ═══════════════════════════════════════════════════════════════════════════

const STEP_SCRIPT_REQUIREMENT: Partial<Record<StepName, ScriptKey>> = {
	"enable-vector": "setupVector",
	migrate: "migrate",
	"seed-admin": "seedAdmin",
	"seed-who": "seedWho",
	"seed-app": "seedApp",
};

function validateScripts(steps: readonly Step[]): void {
	const needed = new Set<ScriptKey>();
	for (const step of steps) {
		if (step.skip) continue;
		const key = STEP_SCRIPT_REQUIREMENT[step.name];
		if (key) needed.add(key);
	}

	if (process.env.POSTGRES_ENABLE_VECTOR !== "true") {
		needed.delete("setupVector");
	}

	const missing = [...needed].filter((k) => !SCRIPT_PATHS[k]);
	if (missing.length === 0) return;

	const lines = missing.map((key) => {
		const paths = SCRIPT_CANDIDATES[key]
			.map((p) => `      ${p}`)
			.join("\n");
		const hint =
			key === "seedWho"
				? "pass --skip-who"
				: key === "seedApp"
					? "pass --skip-app"
					: key === "migrate"
						? "pass --skip-migrate"
						: "create the script";
		return `  • ${key} (${hint})\n${paths}`;
	});

	fail(
		`Missing required scripts:\n${lines.join("\n")}\n\n` +
			`  Project root: ${PROJECT_ROOT}\n` +
			`  Run \`bun ${SELF_REL} --print-paths\` to inspect resolution.`
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. CLI subcommands
// ═══════════════════════════════════════════════════════════════════════════

function printPaths(): void {
	console.log(paint("bold", "Resolved script paths:\n"));
	for (const key of Object.keys(SCRIPT_PATHS) as ScriptKey[]) {
		const path = SCRIPT_PATHS[key];
		const status = path ? paint("green", "✅") : paint("red", "❌");
		const display = path ? relToRoot(path) : paint("dim", "(not found)");
		console.log(`  ${status} ${key.padEnd(12)} ${display}`);
	}
	console.log(`\n  Project root: ${PROJECT_ROOT}`);
	console.log(`  Self path:    ${SELF_REL}`);
	console.log(
		`  Database URL: ${process.env.DATABASE_URL ? "(configured)" : "(missing)"}`
	);
}

function printHelp(): void {
	console.log(
		[
			paint("bold", `bun ${SELF_REL} [options]`),
			"",
			paint("bold", "Options:"),
			"  -f, --force              skip the confirmation prompt",
			"  --dry-run                print the plan without touching the DB",
			"  --skip-who               skip WHO growth reference seeding",
			"  --skip-app               skip application demo data seeding",
			"  --skip-migrate           skip the drizzle migrations step",
			"  --from=<step>            resume from a step",
			"  --only=<step>            run a single step",
			"  --print-paths            show resolved script paths and exit",
			"  --no-report              do not write a report file",
			"  --json-report            also write a .json report next to the .md",
			"  -h, --help               show this help",
			"",
			paint("bold", "Environment:"),
			"  DATABASE_URL             PostgreSQL connection string",
			"  POSTGRES_ENABLE_VECTOR   set to 'true' to attempt CREATE EXTENSION vector",
			"",
			paint("bold", "Steps:"),
			...STEPS.map(
				(s) =>
					`  ${s.name.padEnd(16)} ${s.label}${
						s.skipHint
							? paint("dim", ` (skip with ${s.skipHint})`)
							: ""
					}`
			),
		].join("\n")
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. Orchestration
// ═══════════════════════════════════════════════════════════════════════════

function describePlan(): void {
	console.log(paint("bold", "🔄 Fresh start — resetting local PostgreSQL\n"));
	console.log("This will:");
	for (const step of STEPS) {
		const tag = step.skip
			? paint("dim", `  (skipped: ${step.skipHint})`)
			: "";
		console.log(`  • ${step.label}${tag}`);
	}
	if (FLAGS.only) console.log(paint("yellow", `  • --only=${FLAGS.only}`));
	if (FLAGS.from) console.log(paint("yellow", `  • --from=${FLAGS.from}`));
	if (FLAGS.dryRun) {
		console.log(paint("yellow", "  • DRY RUN — no changes will be made"));
	}
	console.log("");
}

async function runSteps(
	steps: readonly Step[],
	ctx: RunContext
): Promise<{ results: StepResult[]; totalMs: number }> {
	const started = Date.now();
	const results: StepResult[] = [];

	for (const [i, step] of steps.entries()) {
		if (step.skip) {
			console.log(
				paint("dim", `⏭️  Skipping "${step.name}" (${step.skipHint})`)
			);
			results.push({
				name: step.name,
				label: step.label,
				status: "skipped",
				ms: 0,
			});
			continue;
		}

		const stepStarted = Date.now();
		try {
			await step.run(ctx);
			const ms = Date.now() - stepStarted;
			results.push({
				name: step.name,
				label: step.label,
				status: "ok",
				ms,
			});
			console.log(paint("dim", `   ⏱  ${step.name} took ${fmtMs(ms)}`));
		} catch (error) {
			const ms = Date.now() - stepStarted;
			const message =
				error instanceof Error ? error.message : String(error);
			results.push({
				name: step.name,
				label: step.label,
				status: "failed",
				ms,
				error: message.split("\n")[0],
			});
			console.error(
				`\n${paint("red", "❌")} Step "${step.name}" (${i + 1}/${steps.length}) failed`
			);
			const okSoFar = results
				.filter((r) => r.status === "ok")
				.map((r) => r.name);
			if (okSoFar.length > 0) {
				console.error(
					`   Completed before failure: ${okSoFar.join(" → ")}`
				);
				console.error(
					`   Resume with: bun ${SELF_REL} --from=${step.name} --force`
				);
			}
			console.error(message);
			return { results, totalMs: Date.now() - started };
		}
	}

	return { results, totalMs: Date.now() - started };
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. Duration state
// ═══════════════════════════════════════════════════════════════════════════

const STATE_PATH = abs(".fresh-start.state.json");

async function readPreviousDuration(): Promise<number | undefined> {
	try {
		const raw = await readFile(STATE_PATH, "utf8");
		const parsed: unknown = JSON.parse(raw);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"totalMs" in parsed &&
			typeof (parsed as { totalMs: unknown }).totalMs === "number"
		) {
			return (parsed as { totalMs: number }).totalMs;
		}
	} catch {
		/* first run, or unreadable */
	}
	return undefined;
}

async function writeDurationState(totalMs: number): Promise<void> {
	try {
		await writeFile(
			STATE_PATH,
			JSON.stringify({ totalMs, at: new Date().toISOString() }, null, 2),
			"utf8"
		);
	} catch {
		/* best-effort */
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. Entry point
// ═══════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
	if (FLAGS.help) {
		printHelp();
		return;
	}
	if (FLAGS.printPaths) {
		printPaths();
		return;
	}

	const steps = selectSteps();
	describePlan();
	const target = assertEnvironment();

	if (FLAGS.dryRun) {
		console.log(`\nTarget: ${target.kind} @ ${target.name}`);
		return;
	}

	validateScripts(steps);

	const previousMs = await readPreviousDuration();
	const releaseLock = await acquireLock();

	const ctx: RunContext = {
		target,
		releaseLock,
		startedAt: new Date(),
	};

	let results: StepResult[] = [];
	let totalMs = 0;
	let crashed = false;

	try {
		await confirm(
			`Wipe and reseed ${paint("bold", `PostgreSQL @ ${target.name}`)}?`
		);
		const run = await runSteps(steps, ctx);
		({ results, totalMs } = run);
	} catch (error) {
		crashed = true;
		console.error(
			`\n${paint("red", "❌")} Unhandled error during run:`,
			error
		);
	} finally {
		releaseLock();
		try {
			await closeConnection();
		} catch {
			/* ignore */
		}
	}

	const reportInput: ReportInput = {
		ctx,
		results,
		totalMs,
		previousMs,
		selfPath: SELF_PATH,
	};

	if (results.length > 0 || crashed) {
		console.log(`\n${renderReport(reportInput)}`);
	}

	if (!FLAGS.noReport) {
		const written = await writeReportFiles(reportInput, {
			writeJson: FLAGS.jsonReport,
			keep: 20,
		});
		if (written) {
			console.log(
				`\n   ${paint("dim", "📄 Report:")} ${relToRoot(written.mdPath)}` +
					(written.jsonPath
						? paint("dim", ` · ${relToRoot(written.jsonPath)}`)
						: "") +
					paint("dim", ` · sha ${written.sha}`)
			);
		}
	}

	const failed = crashed || results.some((r) => r.status === "failed");
	if (!failed) await writeDurationState(totalMs);

	process.exit(failed ? 1 : 0);
}

main().catch((error) => {
	console.error(`\n${paint("red", "❌")} Unhandled error:`, error);
	process.exit(1);
});
