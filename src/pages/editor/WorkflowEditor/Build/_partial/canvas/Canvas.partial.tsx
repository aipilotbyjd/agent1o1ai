import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ReactFlow,
	Controls,
	MiniMap,
	useReactFlow,
	ReactFlowProvider,
	type NodeTypes,
	type EdgeTypes,
	type OnConnectEnd,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditor, useEditorApi } from '../../_context/EditorStoreProvider.context';
import { NODE_CATALOG_MAP } from '../../_helper/nodeCatalog.constants';
import FlowNode from './nodes/FlowNode.partial';
import StickyNote from './nodes/StickyNote.partial';
import ClickEdge from './ClickEdge.partial';
import AddNodeDialog from '../dialogs/AddNodeDialog.partial';

const nodeTypes: NodeTypes = {
	base: FlowNode,
	sticky: StickyNote,
};

const edgeTypes: EdgeTypes = {
	addable: ClickEdge,
};

type TTemplate = {
	label: string;
	description: string;
	icon: string;
	nodes: string[];
};

const TEMPLATES: TTemplate[] = [
	{
		label: 'Scrape & summarize',
		description: 'Ask for a URL, scrape it, summarize.',
		icon: '🕸️',
		nodes: ['input.ask_ai', 'scrape.url', 'ai.summarize', 'output.display'],
	},
	{
		label: 'Extract from URL',
		description: 'Scrape a URL and extract structured data.',
		icon: '🔎',
		nodes: ['input.ask_ai', 'scrape.url', 'ai.extract', 'output.display'],
	},
	{
		label: 'Ask AI chain',
		description: 'Simple prompt → AI → display.',
		icon: '🧠',
		nodes: ['input.ask_ai', 'ai.chat', 'output.display'],
	},
	{
		label: 'Categorize & notify',
		description: 'Classify text, post to Slack.',
		icon: '🏷️',
		nodes: ['input.ask_ai', 'ai.categorizer', 'int.slack', 'output.display'],
	},
];

const HUE_TO_HEX: Record<string, string> = {
	sky: '#0ea5e9',
	violet: '#8b5cf6',
	fuchsia: '#d946ef',
	emerald: '#10b981',
	amber: '#f59e0b',
	rose: '#f43f5e',
	indigo: '#6366f1',
	red: '#ef4444',
	green: '#22c55e',
	teal: '#14b8a6',
	purple: '#a855f7',
	cyan: '#06b6d4',
	yellow: '#eab308',
	zinc: '#a1a1aa',
};

const CanvasInner = () => {
	const nodes = useEditor((s) => s.nodes);
	const edges = useEditor((s) => s.edges);
	const onNodesChange = useEditor((s) => s.onNodesChange);
	const onEdgesChange = useEditor((s) => s.onEdgesChange);
	const onConnectRaw = useEditor((s) => s.onConnect);
	const addNodeFromCatalog = useEditor((s) => s.addNodeFromCatalog);
	const selectNode = useEditor((s) => s.selectNode);
	const isRunning = useEditor((s) => s.run.status === 'running');
	const fitViewRequest = useEditor((s) => s.fitViewRequest);
	const api = useEditorApi();

	const rfRef = useRef<unknown>(null);
	const rfInstance = useRef<ReturnType<typeof useReactFlow> | null>(null);
	const { screenToFlowPosition, fitView } = useReactFlow();
	rfInstance.current = { screenToFlowPosition, fitView } as ReturnType<typeof useReactFlow>;
	const [isDragging, setIsDragging] = useState(false);
	const [dropPicker, setDropPicker] = useState<
		| {
				screen: { x: number; y: number };
				flow: { x: number; y: number };
				fromNodeId: string;
				fromHandle?: string | null;
		  }
		| null
	>(null);

	const onInit = useCallback((i: unknown) => {
		rfRef.current = i;
	}, []);

	// External fit-view trigger
	useEffect(() => {
		if (fitViewRequest > 0) {
			try {
				fitView({ duration: 300, padding: 0.2 });
			} catch {
				// ignore if canvas not ready
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fitViewRequest]);

	// Drag a connection to empty canvas → open picker there
	const onConnectEnd: OnConnectEnd = useCallback(
		(event, connectionState) => {
			if (connectionState.isValid) return;
			if (!connectionState.fromNode) return;
			const mouse =
				'clientX' in event
					? { x: event.clientX, y: event.clientY }
					: {
							x: (event as TouchEvent).changedTouches[0].clientX,
							y: (event as TouchEvent).changedTouches[0].clientY,
						};
			const flow = screenToFlowPosition(mouse);
			setDropPicker({
				screen: mouse,
				flow,
				fromNodeId: connectionState.fromNode.id,
				fromHandle: connectionState.fromHandle?.id,
			});
		},
		[screenToFlowPosition],
	);

	const handleDropPick = (defKey: string) => {
		if (!dropPicker) return;
		const def = NODE_CATALOG_MAP[defKey];
		if (!def) {
			setDropPicker(null);
			return;
		}
		const newId = api.getState().addNodeFromCatalog(defKey, dropPicker.flow);
		if (newId && def.inputs[0]) {
			api.getState().onConnect({
				source: dropPicker.fromNodeId,
				target: newId,
				sourceHandle: dropPicker.fromHandle ?? null,
				targetHandle: def.inputs[0].id,
			});
		}
		setDropPicker(null);
	};

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		if (!isDragging) setIsDragging(true);
	}, [isDragging]);

	const onDragLeave = useCallback((e: React.DragEvent) => {
		// only reset when leaving the wrapper, not child elements
		if (e.currentTarget === e.target) setIsDragging(false);
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const defKey = e.dataTransfer.getData('application/x-node-def');
			if (!defKey) return;
			const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
			addNodeFromCatalog(defKey, position);
		},
		[addNodeFromCatalog, screenToFlowPosition],
	);

	const onSelectionChange = useCallback(
		({ nodes: sel }: { nodes: { id: string }[] }) => {
			selectNode(sel[0]?.id ?? null);
		},
		[selectNode],
	);

	// Animate edges while a run is in progress; ensure addable type
	const displayedEdges = useMemo(
		() =>
			edges.map((e) => ({
				...e,
				type: e.type ?? 'addable',
				animated: isRunning || e.animated,
				style: {
					strokeWidth: 2,
					stroke: '#a1a1aa',
					...(e.style ?? {}),
				},
			})),
		[edges, isRunning],
	);

	const defaultEdgeOptions = useMemo(
		() => ({
			type: 'addable',
			animated: false,
			style: { strokeWidth: 2, stroke: '#a1a1aa' },
		}),
		[],
	);

	const applyTemplate = (tpl: TTemplate) => {
		const state = api.getState();
		state.setMeta({ name: tpl.label });
		const y = 160;
		const ids: string[] = [];
		tpl.nodes.forEach((key, idx) => {
			const id = state.addNodeFromCatalog(key, { x: 80 + idx * 300, y });
			if (id) ids.push(id);
		});
		for (let i = 0; i < ids.length - 1; i++) {
			const aKey = tpl.nodes[i];
			const bKey = tpl.nodes[i + 1];
			const src = NODE_CATALOG_MAP[aKey]?.outputs[0]?.id;
			const tgt = NODE_CATALOG_MAP[bKey]?.inputs[0]?.id;
			if (!src || !tgt) continue;
			api.getState().onConnect({
				source: ids[i],
				target: ids[i + 1],
				sourceHandle: src,
				targetHandle: tgt,
			});
		}
		setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50);
	};

	const nodeCount = nodes.length;

	return (
		<div
			className='relative h-full w-full'
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}>
			<ReactFlow
				nodes={nodes}
				edges={displayedEdges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnectRaw}
				onConnectEnd={onConnectEnd}
				onInit={onInit}
				onSelectionChange={onSelectionChange}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				snapToGrid
				snapGrid={[8, 8]}
				proOptions={{ hideAttribution: true }}
				className='bg-editorial-bg'>
				<div
					className='absolute inset-0 pointer-events-none'
					style={{
						backgroundImage: 'radial-gradient(#1A1A1A 0.5px, transparent 0.5px)',
						backgroundSize: '32px 32px',
						opacity: 0.08,
					}}
					aria-hidden='true'
				/>
				<MiniMap
					pannable
					zoomable
					maskColor='rgba(245, 242, 237, 0.6)'
					className='!rounded-none !border-2 !border-editorial-ink !bg-white !shadow-editorial-soft'
					nodeColor={(n) => {
						const def = NODE_CATALOG_MAP[(n.data as { defKey?: string })?.defKey ?? ''];
						return HUE_TO_HEX[def?.color ?? 'zinc'] ?? HUE_TO_HEX.zinc;
					}}
					nodeStrokeColor='transparent'
					nodeBorderRadius={0}
				/>
				<Controls
					className='!overflow-hidden !rounded-none !border-2 !border-editorial-ink !bg-white !shadow-editorial-button [&_button]:!border-b [&_button]:!border-editorial-ink [&_button]:!bg-transparent [&_button]:!text-editorial-ink [&_button:hover]:!bg-editorial-bg'
					showInteractive={false}
				/>
			</ReactFlow>

			{/* Drop-target highlight */}
			{isDragging && (
				<div
					className='pointer-events-none absolute inset-3 rounded-none border-2 border-dashed border-editorial-ink/40 bg-editorial-ink/5 transition-opacity'
					aria-hidden='true'>
					<div className='flex h-full items-center justify-center'>
						<div className='rounded-none bg-editorial-ink/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-editorial-ink'>
							Drop to add node
						</div>
					</div>
				</div>
			)}

			{/* Empty state */}
			{nodeCount === 0 ? (
				<div className='pointer-events-none absolute inset-0 flex items-center justify-center p-6'>
					<div className='pointer-events-auto w-full max-w-2xl'>
						<div className='mb-6 text-center'>
							<div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none border-2 border-editorial-ink bg-editorial-ink text-xl text-white shadow-editorial-button'>
								✨
							</div>
							<div className='font-serif font-black italic text-xl text-editorial-ink'>
								Start building your workflow
							</div>
							<div className='mt-1 font-mono text-[10px] tracking-tighter text-editorial-ink/60'>
								Pick a template, drag from the library, or press{' '}
								<kbd className='rounded-none border border-editorial-ink bg-white px-1.5 py-0.5 font-mono text-[10px]'>
									⌘K
								</kbd>{' '}
								to generate one with AI.
							</div>
						</div>
						<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
							{TEMPLATES.map((tpl) => (
								<button
									key={tpl.label}
									type='button'
									onClick={() => applyTemplate(tpl)}
									className='group rounded-none border-2 border-editorial-ink bg-white p-4 text-left shadow-editorial-soft transition hover:shadow-editorial'>
									<div className='mb-2 flex items-center gap-2'>
										<span className='text-lg'>{tpl.icon}</span>
										<span className='font-serif font-black italic text-sm text-editorial-ink'>
											{tpl.label}
										</span>
									</div>
									<div className='mb-3 font-mono text-[10px] tracking-tighter text-editorial-ink/60'>{tpl.description}</div>
									<div className='flex items-center gap-1'>
										{tpl.nodes.map((k, i) => {
											const def = NODE_CATALOG_MAP[k];
											return (
												<span
													key={`${k}-${i}`}
													className='inline-flex items-center gap-1'>
													<span className='text-sm'>{def?.icon ?? '•'}</span>
													{i < tpl.nodes.length - 1 && (
														<span className='text-editorial-ink/30'>
															→
														</span>
													)}
												</span>
											);
										})}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className='pointer-events-none absolute left-3 top-3 flex items-center gap-1'>
					<StatChip label='Nodes' value={nodeCount} />
					<StatChip label='Edges' value={edges.length} />
				</div>
			)}

			{dropPicker && (
				<AddNodeDialog
					anchor={dropPicker.screen}
					onPick={handleDropPick}
					onClose={() => setDropPicker(null)}
					title='Add connected node'
				/>
			)}
		</div>
	);
};

const StatChip = ({ label, value }: { label: string; value: number }) => (
	<div className='pointer-events-auto inline-flex items-center gap-1.5 rounded-none border-2 border-editorial-ink bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-editorial-ink shadow-editorial-soft'>
		<span className='font-mono tracking-tighter'>{label}</span>
		<span className='font-mono tabular-nums'>{value}</span>
	</div>
);

const Canvas = () => (
	<ReactFlowProvider>
		<CanvasInner />
	</ReactFlowProvider>
);

export default Canvas;
