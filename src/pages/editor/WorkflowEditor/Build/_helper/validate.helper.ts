import type { Edge, Node } from '@xyflow/react';
import type { TCanvasNodeData } from '../../_types/editor.type';
import { NODE_CATALOG_MAP } from './nodeCatalog.constants';

export type TValidationIssue = {
	type: 'error' | 'warning';
	nodeId?: string;
	message: string;
};

export const validateGraph = (
	nodes: Node<TCanvasNodeData>[],
	edges: Edge[],
): TValidationIssue[] => {
	const issues: TValidationIssue[] = [];

	// Required fields
	nodes.forEach((n) => {
		const def = NODE_CATALOG_MAP[n.data.defKey];
		if (!def) return;
		def.fields.forEach((f) => {
			if (!f.required) return;
			const v = n.data.values?.[f.key];
			if (v == null || v === '')
				issues.push({
					type: 'error',
					nodeId: n.id,
					message: `"${n.data.label}" is missing required field "${f.label}"`,
				});
		});
	});

	// Cycle detection (DFS)
	const adj = new Map<string, string[]>();
	edges.forEach((e) => {
		if (!adj.has(e.source)) adj.set(e.source, []);
		adj.get(e.source)!.push(e.target);
	});
	const WHITE = 0, GRAY = 1, BLACK = 2;
	const color = new Map<string, number>();
	nodes.forEach((n) => color.set(n.id, WHITE));
	const dfs = (id: string): boolean => {
		color.set(id, GRAY);
		for (const nxt of adj.get(id) ?? []) {
			const c = color.get(nxt);
			if (c === GRAY) return true;
			if (c === WHITE && dfs(nxt)) return true;
		}
		color.set(id, BLACK);
		return false;
	};
	for (const n of nodes) {
		if (color.get(n.id) === WHITE && dfs(n.id)) {
			issues.push({ type: 'error', message: 'Workflow contains a cycle' });
			break;
		}
	}

	return issues;
};
