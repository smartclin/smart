// ─── Types ───────────────────────────────────────────────────────────────────

import type {
	ComponentLayer,
	Variable,
} from "@smart/ui/components/ui-builder/types";
import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export interface NoteTemplate {
	appointmentType: string;
	createdAt: string;
	description: string;
	id: string;
	layers: ComponentLayer[];
	name: string;
	updatedAt: string;
	variables: Variable[];
}

// ─── Query options ───────────────────────────────────────────────────────────

export const noteTemplateKeys = {
	all: ["note-templates"] as const,
	list: () => [...noteTemplateKeys.all, "list"] as const,
	detail: (id: string) => [...noteTemplateKeys.all, "detail", id] as const,
};

export const noteTemplateListQueryOptions = () =>
	queryOptions({
		queryKey: noteTemplateKeys.list(),
		queryFn: async () => {
			const res = await fetch("/api/note-templates");
			if (!res.ok) throw new Error("Failed to load templates");
			return (await res.json()) as NoteTemplate[];
		},
		staleTime: 30_000,
	});

export const noteTemplateByIdQueryOptions = (id: string) =>
	queryOptions({
		queryKey: noteTemplateKeys.detail(id),
		queryFn: async () => {
			const res = await fetch(`/api/note-templates/${id}`);
			if (!res.ok) throw new Error("Template not found");
			return (await res.json()) as NoteTemplate;
		},
		staleTime: 30_000,
	});

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useNoteTemplates() {
	return useQuery(noteTemplateListQueryOptions());
}

export function useNoteTemplate(id: string) {
	return useQuery(noteTemplateByIdQueryOptions(id));
}

export function useCreateNoteTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			name: string;
			appointmentType: string;
			description?: string;
		}) => {
			const res = await fetch("/api/note-templates", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...input,
					description: input.description ?? "",
					layers: [
						{
							id: crypto.randomUUID(),
							type: "div",
							name: "Page",
							props: {
								className: "p-6 max-w-4xl mx-auto space-y-6",
							},
							children: [],
						},
					],
					variables: [],
				}),
			});
			if (!res.ok) throw new Error("Failed to create template");
			return (await res.json()) as NoteTemplate;
		},
		onSuccess: (created) => {
			queryClient.invalidateQueries({ queryKey: noteTemplateKeys.all });
			toast.success("Template created");
			return created;
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export function useUpdateNoteTemplate(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (patch: Partial<NoteTemplate>) => {
			const res = await fetch(`/api/note-templates/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(patch),
			});
			if (!res.ok) throw new Error("Failed to save template");
			return (await res.json()) as NoteTemplate;
		},
		onSuccess: (saved) => {
			queryClient.setQueryData(noteTemplateKeys.detail(id), saved);
			queryClient.invalidateQueries({ queryKey: noteTemplateKeys.all });
			toast.success("Template saved");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export function useDeleteNoteTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/note-templates/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete template");
			return id;
		},
		onSuccess: (id) => {
			queryClient.removeQueries({
				queryKey: noteTemplateKeys.detail(id),
			});
			queryClient.invalidateQueries({ queryKey: noteTemplateKeys.all });
			toast.success("Template deleted");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}
