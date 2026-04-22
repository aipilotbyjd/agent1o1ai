import dagre from 'dagre';
import type { Edge, Node } from '@xyflow/react';

const NODE_W = 260;
const NODE_H = 140;

export const autoLayout = (nodes: Node[], edges: Edge[], direction: 'LR' | 'TB' = 'LR'): Node[] => {
	const g = new dagre.graphlib.Graph();
	g.setDefaultEdgeLabel(() => ({}));
	g.setGraph({ rankdir: direction, nodesep: 40, ranksep: 90 });

	nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
	edges.forEach((e) => g.setEdge(e.source, e.target));

	dagre.layout(g);

	return nodes.map((n) => {
		const pos = g.node(n.id);
		return {
			...n,
			position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
		};
	});
};
