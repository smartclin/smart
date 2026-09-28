import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/utils";

export interface TemplateListFilters {
	category?: string;
}

export const templateQueryOptions = {
	list: (filters?: TemplateListFilters) =>
		orpc.templates.list.queryOptions({
			input: filters ?? {},
		}),

	detail: (id: string) =>
		orpc.templates.get.queryOptions({
			input: { id },
			enabled: Boolean(id),
		}),
};

export function useTemplates(filters?: TemplateListFilters) {
	return useQuery(templateQueryOptions.list(filters));
}

export function useTemplatesSuspense(filters?: TemplateListFilters) {
	return useSuspenseQuery(templateQueryOptions.list(filters));
}

export function useTemplate(id: string) {
	return useQuery(templateQueryOptions.detail(id));
}

export function useTemplateSuspense(id: string) {
	return useSuspenseQuery(templateQueryOptions.detail(id));
}
