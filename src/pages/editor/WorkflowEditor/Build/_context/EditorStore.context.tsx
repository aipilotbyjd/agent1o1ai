import { create } from 'zustand';
import { useStore } from 'zustand';
import { createContext, useContext, useRef, ReactNode } from 'react';
import {
	applyNodeChanges,
	applyEdgeChanges,
	addEdge,
	type Node,
	type Edge,
	type NodeChange,
	type EdgeChange,
	type Connection,
	type XYPosition,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import type {
	TCanvasNodeData,
	TNodeRunStatus,
	TRunLog,
	TRunState,
	TWorkflowMeta,
} from '../../_types/editor.type';
import { NODE_CATALOG_MAP } from '../_helper/nodeCatalog.constants';
import { HISTORY_LIMIT } from '../_helper/builder.constants';
import { autoLayout } from '../_helper/layout.helper';

export type TSnapshot = {
	nodes: Node<TCanvasNodeData>[];
	edges: Edge[];
};

export type TEditorState = {
	// graph
	nodes: Node<TCanvasNodeData>[];
	edges: Edge[];

	// selection
	selectedNodeId: string | null;

	// history
	past: TSnapshot[];
	future: TSnapshot[];

	// ui
	leftPanelOpen: boolean;
	rightPanelOpen: boolean;
	consoleOpen: boolean;
	consoleHeight: number;
	aiPanelOpen: boolean;
	commandPaletteOpen: boolean;

	// run
	run: TRunState;

	// meta
	meta: TWorkflowMeta;

	// ─── actions ───────────────────────────────────────────
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	onConnect: (conn: Connection) => void;

	addNodeFromCatalog: (defKey: string, position: XYPosition) => string | null;
	updateNodeData: (id: string, patch: Partial<TCanvasNodeData>) => void;
	updateNodeValue: (id: string, fieldKey: string, value: unknown) => void;
	renameNode: (id: string, label: string) => void;
	duplicateSelected: () => void;
	deleteSelected: () => void;
	selectNode: (id: string | null) => void;

	setNodeStatus: (id: string, status: TNodeRunStatus, durationMs?: number, error?: string) => void;
	appendLog: (log: Omit<TRunLog, 'id' | 'at'>) => void;

	undo: () => void;
	redo: () => void;
	pushHistory: () => void;

	runAutoLayout: () => void;
	runWorkflow: () => Promise<void>;
	stopRun: () => void;

	setMeta: (patch: Partial<TWorkflowMeta>) => void;
	toggleLeftPanel: () => void;
	toggleRightPanel: () => void;
	toggleConsole: () => void;
	setConsoleHeight: (h: number) => void;
	toggleAiPanel: () => void;
	setAiPanelOpen: (open: boolean) => void;
	toggleCommandPalette: () => void;
	setCommandPaletteOpen: (open: boolean) => void;
	insertNodeOnEdge: (edgeId: string, defKey: string, position: XYPosition) => string | null;
	fitViewRequest: number;
	requestFitView: () => void;

	loadSnapshot: (snap: TSnapshot) => void;
	exportJson: () => string;
};

const initialMeta: TWorkflowMeta = {
	id: 'local',
	name: 'Untitled Workflow',
	folder: 'My Workflows',
	updatedAt: Date.now(),
	savingState: 'saved',
};

const initialRun: TRunState = {
	id: null,
	status: 'idle',
	startedAt: null,
	finishedAt: null,
	logs: [],
};

const snapshot = (s: TEditorState): TSnapshot => ({
	nodes: structuredClone(s.nodes),
	edges: structuredClone(s.edges),
});

export const createEditorStore = () =>
	create<TEditorState>()((set, get) => ({
		nodes: [],
		edges: [],
		selectedNodeId: null,
		past: [],
		future: [],
		leftPanelOpen: true,
		rightPanelOpen: true,
		consoleOpen: false,
		consoleHeight: 240,
		aiPanelOpen: false,
		commandPaletteOpen: false,
		fitViewRequest: 0,
		run: initialRun,
		meta: initialMeta,

		onNodesChange: (changes) =>
			set((s) => ({
				nodes: applyNodeChanges(changes, s.nodes) as Node<TCanvasNodeData>[],
				meta: { ...s.meta, savingState: 'dirty' },
			})),

		onEdgesChange: (changes) =>
			set((s) => ({
				edges: applyEdgeChanges(changes, s.edges),
				meta: { ...s.meta, savingState: 'dirty' },
			})),

		onConnect: (conn) => {
			get().pushHistory();
			set((s) => ({
				edges: addEdge(
					{ ...conn, id: nanoid(8), type: 'smoothstep', animated: false },
					s.edges,
				),
				meta: { ...s.meta, savingState: 'dirty' },
			}));
		},

		addNodeFromCatalog: (defKey, position) => {
			const def = NODE_CATALOG_MAP[defKey];
			if (!def) return null;
			get().pushHistory();
			const id = `n_${nanoid(6)}`;
			const values: Record<string, unknown> = {};
			def.fields.forEach((f) => {
				if (f.default !== undefined) values[f.key] = f.default;
			});
			const node: Node<TCanvasNodeData> = {
				id,
				type: def.key === 'misc.sticky' ? 'sticky' : 'base',
				position,
				data: {
					defKey,
					label: def.label,
					values,
					status: 'idle',
				},
			};
			set((s) => ({
				nodes: [...s.nodes, node],
				selectedNodeId: id,
				meta: { ...s.meta, savingState: 'dirty' },
			}));
			return id;
		},

		updateNodeData: (id, patch) =>
			set((s) => ({
				nodes: s.nodes.map((n) =>
					n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
				),
				meta: { ...s.meta, savingState: 'dirty' },
			})),

		updateNodeValue: (id, fieldKey, value) =>
			set((s) => ({
				nodes: s.nodes.map((n) =>
					n.id === id
						? {
								...n,
								data: {
									...n.data,
									values: { ...n.data.values, [fieldKey]: value },
								},
							}
						: n,
				),
				meta: { ...s.meta, savingState: 'dirty' },
			})),

		renameNode: (id, label) =>
			set((s) => ({
				nodes: s.nodes.map((n) =>
					n.id === id ? { ...n, data: { ...n.data, label } } : n,
				),
				meta: { ...s.meta, savingState: 'dirty' },
			})),

		duplicateSelected: () => {
			const s = get();
			const id = s.selectedNodeId;
			if (!id) return;
			const node = s.nodes.find((n) => n.id === id);
			if (!node) return;
			s.pushHistory();
			const newId = `n_${nanoid(6)}`;
			set((st) => ({
				nodes: [
					...st.nodes,
					{
						...structuredClone(node),
						id: newId,
						position: { x: node.position.x + 40, y: node.position.y + 40 },
						selected: true,
					},
				],
				selectedNodeId: newId,
				meta: { ...st.meta, savingState: 'dirty' },
			}));
		},

		deleteSelected: () => {
			const s = get();
			const id = s.selectedNodeId;
			if (!id) return;
			s.pushHistory();
			set((st) => ({
				nodes: st.nodes.filter((n) => n.id !== id),
				edges: st.edges.filter((e) => e.source !== id && e.target !== id),
				selectedNodeId: null,
				meta: { ...st.meta, savingState: 'dirty' },
			}));
		},

		selectNode: (id) =>
			set((s) => ({
				selectedNodeId: id,
				rightPanelOpen: id ? true : s.rightPanelOpen,
			})),

		setNodeStatus: (id, status, durationMs, error) =>
			set((s) => ({
				nodes: s.nodes.map((n) =>
					n.id === id
						? { ...n, data: { ...n.data, status, durationMs, error } }
						: n,
				),
			})),

		appendLog: (log) =>
			set((s) => ({
				run: {
					...s.run,
					logs: [...s.run.logs, { ...log, id: nanoid(8), at: Date.now() }],
				},
			})),

		pushHistory: () => {
			const snap = snapshot(get());
			set((s) => ({
				past: [...s.past.slice(-HISTORY_LIMIT + 1), snap],
				future: [],
			}));
		},

		undo: () => {
			const s = get();
			if (!s.past.length) return;
			const prev = s.past[s.past.length - 1];
			const curr = snapshot(s);
			set({
				past: s.past.slice(0, -1),
				future: [curr, ...s.future],
				nodes: prev.nodes,
				edges: prev.edges,
				meta: { ...s.meta, savingState: 'dirty' },
			});
		},

		redo: () => {
			const s = get();
			if (!s.future.length) return;
			const next = s.future[0];
			const curr = snapshot(s);
			set({
				past: [...s.past, curr],
				future: s.future.slice(1),
				nodes: next.nodes,
				edges: next.edges,
				meta: { ...s.meta, savingState: 'dirty' },
			});
		},

		runAutoLayout: () => {
			const s = get();
			s.pushHistory();
			set({ nodes: autoLayout(s.nodes, s.edges) as Node<TCanvasNodeData>[] });
		},

		runWorkflow: async () => {
			const s = get();
			const runId = `r_${nanoid(6)}`;
			set({
				run: {
					id: runId,
					status: 'running',
					startedAt: Date.now(),
					finishedAt: null,
					logs: [],
				},
				consoleOpen: true,
			});

			// Topological run order (Kahn)
			const indeg = new Map<string, number>();
			s.nodes.forEach((n) => indeg.set(n.id, 0));
			s.edges.forEach((e) => indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1));
			const queue: string[] = [];
			indeg.forEach((v, k) => v === 0 && queue.push(k));
			const order: string[] = [];
			while (queue.length) {
				const id = queue.shift()!;
				order.push(id);
				s.edges
					.filter((e) => e.source === id)
					.forEach((e) => {
						indeg.set(e.target, (indeg.get(e.target) ?? 1) - 1);
						if (indeg.get(e.target) === 0) queue.push(e.target);
					});
			}

			// Mock execution — each node pretends to do work.
			for (const id of order) {
				if (get().run.status !== 'running') break;
				const node = get().nodes.find((n) => n.id === id);
				if (!node) continue;
				const def = NODE_CATALOG_MAP[node.data.defKey];
				if (def?.category === 'misc') continue;

				get().setNodeStatus(id, 'running');
				get().appendLog({
					nodeId: id,
					level: 'info',
					message: `▶ ${node.data.label} started`,
				});
				const start = performance.now();
				await new Promise((r) => setTimeout(r, 350 + Math.random() * 600));
				const durationMs = Math.round(performance.now() - start);

				// 5% synthetic failure rate for demo
				const failed = Math.random() < 0.05;
				if (failed) {
					get().setNodeStatus(id, 'error', durationMs, 'Mock failure');
					get().appendLog({
						nodeId: id,
						level: 'error',
						message: `✖ ${node.data.label} failed after ${durationMs}ms`,
					});
					set((st) => ({ run: { ...st.run, status: 'error', finishedAt: Date.now() } }));
					return;
				}

				get().setNodeStatus(id, 'success', durationMs);
				get().appendLog({
					nodeId: id,
					level: 'info',
					message: `✔ ${node.data.label} done in ${durationMs}ms`,
				});
			}
			set((st) => ({ run: { ...st.run, status: 'success', finishedAt: Date.now() } }));
		},

		stopRun: () => {
			set((s) => ({ run: { ...s.run, status: 'stopped', finishedAt: Date.now() } }));
			const st = get();
			st.nodes.forEach((n) => {
				if (n.data.status === 'running' || n.data.status === 'queued')
					st.setNodeStatus(n.id, 'skipped');
			});
		},

		setMeta: (patch) => set((s) => ({ meta: { ...s.meta, ...patch } })),
		toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
		toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
		toggleConsole: () => set((s) => ({ consoleOpen: !s.consoleOpen })),
		setConsoleHeight: (h) => set({ consoleHeight: h }),
		toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
		setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
		toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
		setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
		requestFitView: () => set((s) => ({ fitViewRequest: s.fitViewRequest + 1 })),

		insertNodeOnEdge: (edgeId, defKey, position) => {
			const s = get();
			const edge = s.edges.find((e) => e.id === edgeId);
			if (!edge) return s.addNodeFromCatalog(defKey, position);
			const def = NODE_CATALOG_MAP[defKey];
			if (!def) return null;
			s.pushHistory();
			const newId = s.addNodeFromCatalog(defKey, position);
			if (!newId) return null;
			const firstIn = def.inputs[0]?.id;
			const firstOut = def.outputs[0]?.id;
			set((st) => {
				const withoutOld = st.edges.filter((e) => e.id !== edgeId);
				const a: Edge | null = firstIn
					? {
							id: nanoid(8),
							source: edge.source,
							target: newId,
							sourceHandle: edge.sourceHandle ?? undefined,
							targetHandle: firstIn,
							type: 'addable',
						}
					: null;
				const b: Edge | null = firstOut
					? {
							id: nanoid(8),
							source: newId,
							target: edge.target,
							sourceHandle: firstOut,
							targetHandle: edge.targetHandle ?? undefined,
							type: 'addable',
						}
					: null;
				return {
					edges: [...withoutOld, ...(a ? [a] : []), ...(b ? [b] : [])],
					meta: { ...st.meta, savingState: 'dirty' },
				};
			});
			return newId;
		},

		loadSnapshot: (snap) =>
			set({ nodes: snap.nodes, edges: snap.edges, past: [], future: [] }),

		exportJson: () => {
			const s = get();
			return JSON.stringify(
				{
					meta: s.meta,
					nodes: s.nodes.map(({ id, position, data, type }) => ({
						id,
						type,
						position,
						data,
					})),
					edges: s.edges,
				},
				null,
				2,
			);
		},
	}));

// ── Context so each editor instance has its own store ────────
type TStoreApi = ReturnType<typeof createEditorStore>;
const StoreCtx = createContext<TStoreApi | null>(null);

export const EditorStoreProvider = ({ children }: { children: ReactNode }) => {
	const ref = useRef<TStoreApi | null>(null);
	if (!ref.current) ref.current = createEditorStore();
	return <StoreCtx.Provider value={ref.current}>{children}</StoreCtx.Provider>;
};

export function useEditor<T>(selector: (s: TEditorState) => T): T {
	const api = useContext(StoreCtx);
	if (!api) throw new Error('useEditor must be used inside <EditorStoreProvider>');
	return useStore(api, selector);
}

export const useEditorApi = (): TStoreApi => {
	const api = useContext(StoreCtx);
	if (!api) throw new Error('useEditorApi must be used inside <EditorStoreProvider>');
	return api;
};
