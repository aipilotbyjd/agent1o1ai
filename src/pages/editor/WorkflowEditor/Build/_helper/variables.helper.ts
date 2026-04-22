import type { Edge, Node } from '@xyflow/react';
import type { TCanvasNodeData } from '../../_types/editor.type';
import { NODE_CATALOG_MAP } from './nodeCatalog.constants';

export type TVariableOption = {
	nodeId: string;
	nodeLabel: string;
	outputId: string;
	outputName: string;
	token: string;
};

export const collectUpstreamVariables = (
	nodeId: string,
	nodes: Node<TCanvasNodeData>[],
	edges: Edge[],
): TVariableOption[] => {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const visited = new Set<string>();
	const queue: string[] = [nodeId];
	const options: TVariableOption[] = [];

	while (queue.length) {
		const current = queue.shift()!;
		if (visited.has(current)) continue;
		visited.add(current);

		edges
			.filter((e) => e.target === current)
			.forEach((e) => {
				const up = byId.get(e.source);
				if (!up) return;
				const def = NODE_CATALOG_MAP[up.data.defKey];
				if (!def) return;
				def.outputs.forEach((o) => {
					options.push({
						nodeId: up.id,
						nodeLabel: up.data.label,
						outputId: o.id,
						outputName: o.name,
						token: `{{${up.data.label}.${o.name}}}`,
					});
				});
				if (!visited.has(up.id)) queue.push(up.id);
			});
	}

	return options;
};

export const VAR_REGEX = /\{\{\s*([^}]+?)\s*\}\}/g;

export const resolveVariables = (
	template: string,
	bag: Record<string, unknown>,
): string =>
	template.replace(VAR_REGEX, (_, ref: string) => {
		const value = bag[ref.trim()];
		return value == null ? '' : String(value);
	});
