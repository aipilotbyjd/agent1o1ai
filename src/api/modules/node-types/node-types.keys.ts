import type { TListParams } from '@/api/core';

export const nodeTypeKeys = {
	all: () => ['nodeTypes'] as const,
	list: (params?: TListParams) => ['nodeTypes', 'list', params] as const,
	categories: () => ['nodeTypes', 'categories'] as const,
	detail: (nodeType: string) => ['nodeTypes', 'detail', nodeType] as const,
};
