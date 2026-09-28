// src/components/settings/DatabaseSettings.tsx

import type {
	DatabaseBackup,
	DatabaseTableName,
} from "@smart/api/routers/database";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@smart/ui/components/alert-dialog";
import { Button } from "@smart/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@smart/ui/components/card";
import { Input } from "@smart/ui/components/input";
import { Label } from "@smart/ui/components/label";
import { cn } from "@smart/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	Database,
	Download,
	FileJson,
	HardDriveDownload,
	RefreshCcw,
	Trash2,
	Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthSuspense } from "@/hooks/auth";
import { orpc } from "@/lib/orpc/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror the router's shapes, no imports from @smart/db
// ─────────────────────────────────────────────────────────────────────────────

type BackupFile = {
	version: 1;
	createdAt: string;
	clinicId?: string;
	tables: Record<string, unknown[]>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DatabaseSettings() {
	const { user } = useAuthSuspense();

	if (user?.role !== "admin") {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="size-4 text-muted-foreground" />
						Database
					</CardTitle>
					<CardDescription>
						Only clinic administrators can manage database settings.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<StorageOverviewCard />
			<ExportCard />
			<ImportCard />
			<ResetCard />
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage overview
// ─────────────────────────────────────────────────────────────────────────────

function StorageOverviewCard() {
	const queryClient = useQueryClient();

	const {
		data: counts,
		isPending,
		isFetching,
		error,
	} = useQuery(orpc.database.getTableCounts.queryOptions());

	const handleRefresh = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: orpc.database.getTableCounts.key(),
		});
	}, [queryClient]);

	const total = counts
		? Object.values(counts).reduce((sum, n) => sum + n, 0)
		: 0;
	const tableNames = counts
		? (Object.keys(counts) as DatabaseTableName[])
		: [];

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div>
					<CardTitle className="flex items-center gap-2">
						<HardDriveDownload className="size-4 text-primary" />
						Local Storage
					</CardTitle>
					<CardDescription>
						Row counts per table in the clinic database.
					</CardDescription>
				</div>
				<Button
					disabled={isFetching}
					onClick={handleRefresh}
					size="sm"
					variant="outline"
				>
					<RefreshCcw
						className={cn(
							"mr-1.5 size-3.5",
							isFetching && "animate-spin"
						)}
					/>
					Refresh
				</Button>
			</CardHeader>
			<CardContent>
				{isPending ? (
					<p className="text-muted-foreground text-sm">Loading…</p>
				) : error ? (
					<p className="text-destructive text-sm">{error.message}</p>
				) : (
					<>
						<div className="mb-4 flex items-baseline gap-2">
							<span className="font-bold text-3xl tabular-nums">
								{total.toLocaleString()}
							</span>
							<span className="text-muted-foreground text-sm">
								total rows across {tableNames.length} tables
							</span>
						</div>

						<ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{tableNames.map((table) => (
								<li
									className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2"
									key={table}
								>
									<span className="truncate font-medium text-sm capitalize">
										{table.replace(/_/g, " ")}
									</span>
									<span className="font-mono text-muted-foreground text-xs tabular-nums">
										{counts![table].toLocaleString()}
									</span>
								</li>
							))}
						</ul>
					</>
				)}
			</CardContent>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

function ExportCard() {
	// We don't know the table list until the counts query resolves.
	const { data: counts } = useQuery(
		orpc.database.getTableCounts.queryOptions()
	);
	const tableNames = counts ? Object.keys(counts) : [];

	const [selectedTable, setSelectedTable] = useState<
		DatabaseTableName | "all"
	>("all");
	const exportMutation = useMutation(
		orpc.database.export.mutationOptions({
			onSuccess: (payload) => {
				const filename =
					selectedTable === "all"
						? `smart-clinic-backup-${dateStamp()}.json`
						: `smart-clinic-${selectedTable}-${dateStamp()}.json`;
				downloadJson(filename, payload);
				toast.success(
					selectedTable === "all"
						? "Full backup downloaded."
						: `Exported ${selectedTable}.`
				);
			},
			onError: (err) => {
				toast.error(err.message || "Export failed.");
			},
		})
	);

	const handleExport = useCallback(() => {
		exportMutation.mutate({
			table: selectedTable === "all" ? undefined : selectedTable,
		});
	}, [exportMutation, selectedTable]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Download className="size-4 text-primary" />
					Export
				</CardTitle>
				<CardDescription>
					Download your data as a JSON file. Lossless — safe to
					re-import later.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
					<div className="flex-1 space-y-2">
						<Label htmlFor="export-table">Table</Label>
						<select
							onChange={(e) =>
								setSelectedTable(
									e.target.value as DatabaseTableName | "all"
								)
							}
							value={selectedTable}
						>
							<option value="all">All tables</option>
							{tableNames.map((t) => (
								<option
									key={t}
									value={t}
								>
									{t.replace(/_/g, " ")}
								</option>
							))}
						</select>
					</div>
					<Button
						disabled={exportMutation.isPending}
						onClick={handleExport}
					>
						<Download className="mr-2 size-4" />
						{exportMutation.isPending ? "Preparing…" : "Export"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Import
// ─────────────────────────────────────────────────────────────────────────────

function ImportCard() {
	const queryClient = useQueryClient();
	const [file, setFile] = useState<File | null>(null);
	const [parsed, setParsed] = useState<DatabaseBackup | null>(null);
	const [parseError, setParseError] = useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const importMutation = useMutation(
		orpc.database.import.mutationOptions({
			onSuccess: (result) => {
				toast.success(
					`Imported ${result.rowCount.toLocaleString()} rows across ${result.tableCount} tables.`
				);
				setConfirmOpen(false);
				setFile(null);
				setParsed(null);
				if (inputRef.current) inputRef.current.value = "";
				// Refresh the counts so the overview reflects the new data.
				queryClient.invalidateQueries({
					queryKey: orpc.database.getTableCounts.key(),
				});
			},
			onError: (err) => {
				toast.error(err.message || "Import failed.");
			},
		})
	);

	const handleFileChange = useCallback(async (f: File | null) => {
		setFile(f);
		setParsed(null);
		setParseError(null);
		if (!f) return;

		try {
			const text = await f.text();
			const json: unknown = JSON.parse(text);
			const validated = validateBackupFile(json);
			setParsed(validated);
		} catch (err) {
			setParseError(
				err instanceof Error ? err.message : "Invalid backup file."
			);
		}
	}, []);

	const handleConfirm = useCallback(() => {
		if (!parsed) return;
		importMutation.mutate({ tables: parsed.tables });
	}, [importMutation, parsed]);

	const rowCount = parsed
		? Object.values(parsed.tables).reduce(
				(sum, rows) => sum + rows.length,
				0
			)
		: 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Upload className="size-4 text-primary" />
					Import
				</CardTitle>
				<CardDescription>
					Restore from a JSON backup. This replaces all data in the
					affected tables.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="import-file">Backup file</Label>
					<Input
						accept="application/json,.json"
						id="import-file"
						onChange={(e) =>
							void handleFileChange(e.target.files?.[0] ?? null)
						}
						ref={inputRef}
						type="file"
					/>
				</div>

				{parseError ? (
					<div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-destructive text-sm">
						<AlertTriangle className="mt-0.5 size-4 shrink-0" />
						<span>{parseError}</span>
					</div>
				) : null}

				{parsed ? (
					<div className="rounded-xl border border-border bg-muted/30 p-4">
						<div className="flex items-center gap-2 text-sm">
							<FileJson className="size-4 text-muted-foreground" />
							<span className="font-medium">
								{file?.name ?? "backup.json"}
							</span>
						</div>
						<p className="mt-2 text-muted-foreground text-xs">
							Created{" "}
							{new Date(parsed.createdAt).toLocaleString()} ·{" "}
							{rowCount.toLocaleString()} rows across{" "}
							{Object.keys(parsed.tables).length} tables
						</p>
					</div>
				) : null}

				<Button
					disabled={!parsed || importMutation.isPending}
					onClick={() => setConfirmOpen(true)}
					variant="destructive"
				>
					<Upload className="mr-2 size-4" />
					{importMutation.isPending
						? "Importing…"
						: "Import and replace"}
				</Button>
			</CardContent>

			<AlertDialog
				onOpenChange={setConfirmOpen}
				open={confirmOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10">
							<AlertTriangle className="text-destructive" />
						</AlertDialogMedia>
						<AlertDialogTitle>
							Replace existing data?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will overwrite the current contents of the{" "}
							{Object.keys(parsed?.tables ?? {}).length} tables in
							this backup with {rowCount.toLocaleString()} rows.
							This action cannot be undone — export a fresh backup
							first if you are unsure.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={importMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={importMutation.isPending}
							onClick={(e) => {
								e.preventDefault();
								handleConfirm();
							}}
						>
							{importMutation.isPending
								? "Importing…"
								: "Replace data"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset
// ─────────────────────────────────────────────────────────────────────────────

function ResetCard() {
	const queryClient = useQueryClient();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmText, setConfirmText] = useState("");

	const REQUIRED_CONFIRMATION = "DELETE ALL DATA";
	const canConfirm = confirmText === REQUIRED_CONFIRMATION;

	const exportMutation = useMutation(orpc.database.export.mutationOptions());

	const clearMutation = useMutation(
		orpc.database.clear.mutationOptions({
			onSuccess: () => {
				toast.success(
					"All data has been cleared. Backup saved to your downloads."
				);
				setConfirmOpen(false);
				setConfirmText("");
				queryClient.invalidateQueries({
					queryKey: orpc.database.getTableCounts.key(),
				});
			},
			onError: (err) => {
				toast.error(err.message || "Reset failed.");
			},
		})
	);

	const isBusy = exportMutation.isPending || clearMutation.isPending;

	const handleReset = useCallback(async () => {
		if (!canConfirm) return;

		// 1. Download a safety backup first.
		try {
			const backup = await exportMutation.mutateAsync({});
			downloadJson(
				`smart-clinic-pre-reset-backup-${dateStamp()}.json`,
				backup
			);
		} catch {
			toast.error("Could not create a backup — aborting reset.");
			return;
		}

		// 2. Then wipe.
		clearMutation.mutate();
	}, [canConfirm, clearMutation, exportMutation]);

	return (
		<Card className="border-destructive/40">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<Trash2 className="size-4" />
					Reset
				</CardTitle>
				<CardDescription>
					Wipe the entire database. A backup is downloaded
					automatically before anything is deleted.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive text-sm">
					<p className="font-medium">This action is irreversible.</p>
					<p className="mt-1 text-destructive/80">
						All patients, appointments, encounters, immunizations,
						growth records, prescriptions, labs, staff, and vitals
						will be permanently deleted.
					</p>
				</div>
				<Button
					onClick={() => setConfirmOpen(true)}
					variant="destructive"
				>
					<Trash2 className="mr-2 size-4" />
					Reset database
				</Button>
			</CardContent>

			<AlertDialog
				onOpenChange={setConfirmOpen}
				open={confirmOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10">
							<AlertTriangle className="text-destructive" />
						</AlertDialogMedia>
						<AlertDialogTitle>Wipe all data?</AlertDialogTitle>
						<AlertDialogDescription>
							A backup will be downloaded automatically. To
							confirm, type{" "}
							<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
								{REQUIRED_CONFIRMATION}
							</code>{" "}
							below.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="space-y-2">
						<Label htmlFor="reset-confirm">Confirmation</Label>
						<Input
							autoCapitalize="characters"
							autoComplete="off"
							id="reset-confirm"
							onChange={(e) => setConfirmText(e.target.value)}
							placeholder={REQUIRED_CONFIRMATION}
							spellCheck={false}
							value={confirmText}
						/>
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isBusy}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={!canConfirm || isBusy}
							onClick={(e) => {
								e.preventDefault();
								void handleReset();
							}}
						>
							{isBusy ? "Resetting…" : "Delete everything"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function dateStamp(): string {
	return new Date().toISOString().slice(0, 10);
}

function downloadJson(filename: string, payload: unknown): void {
	const blob = new Blob([JSON.stringify(payload, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function validateBackupFile(input: unknown): BackupFile {
	if (typeof input !== "object" || input === null) {
		throw new Error("Backup file is not a JSON object.");
	}
	const obj = input as Record<string, unknown>;

	if (obj.version !== 1) {
		throw new Error(
			`Unsupported backup version: ${String(obj.version)}. Expected 1.`
		);
	}
	if (typeof obj.createdAt !== "string") {
		throw new Error("Backup file is missing `createdAt`.");
	}
	if (typeof obj.tables !== "object" || obj.tables === null) {
		throw new Error("Backup file is missing `tables`.");
	}

	const tables: Record<string, unknown[]> = {};
	for (const [key, value] of Object.entries(obj.tables)) {
		if (!Array.isArray(value)) {
			throw new Error(`Table "${key}" is not an array.`);
		}
		tables[key] = value;
	}

	return {
		version: 1,
		createdAt: obj.createdAt,
		...(typeof obj.clinicId === "string" ? { clinicId: obj.clinicId } : {}),
		tables,
	};
}
