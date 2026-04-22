import { useCallback, useMemo, useRef } from 'react';
import {
	ReactFlow,
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	useReactFlow,
	ReactFlowProvider,
	type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditor } from '../_context/EditorStore.context';
import BaseNode from './nodes/BaseNode.partial';
import StickyNote from './nodes/StickyNote.partial';

const nodeTypes: NodeTypes = {
	base: BaseNode,
	sticky: StickyNote,
};

const CanvasInner = () => {
	const nodes = useEditor((s) => s.nodes);
	const edges = useEditor((s) => s.edges);
	const onNodesChange = useEditor((s) => s.onNodesChange);
	const onEdgesChange = useEditor((s) => s.onEdgesChange);
	const onConnect = useEditor((s) => s.onConnect);
	const addNodeFromCatalog = useEditor((s) => s.addNodeFromCatalog);
	const selectNode = useEditor((s) => s.selectNode);

	const rfRef = useRef<unknown>(null);
	const { screenToFlowPosition } = useReactFlow();

	const onInit = useCallback((i: unknown) => {
		rfRef.current = i;
	}, []);

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
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

	const defaultEdgeOptions = useMemo(
		() => ({ type: 'smoothstep', animated: false, style: { strokeWidth: 1.75 } }),
		[],
	);

	return (
		<div className='relative h-full w-full' onDragOver={onDragOver} onDrop={onDrop}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onInit={onInit}
				onSelectionChange={onSelectionChange}
				nodeTypes={nodeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				snapToGrid
				snapGrid={[8, 8]}
				proOptions={{ hideAttribution: true }}
				className='bg-zinc-50 dark:bg-zinc-950'>
				<Background variant={BackgroundVariant.Dots} gap={16} size={1} />
				<MiniMap
					pannable
					zoomable
					className='!bg-white/70 !rounded-lg !border !border-zinc-200 dark:!bg-zinc-900/70 dark:!border-zinc-800'
					nodeColor={() => '#a1a1aa'}
				/>
				<Controls
					className='!bg-white/90 !rounded-lg !border !border-zinc-200 !shadow-sm dark:!bg-zinc-900 dark:!border-zinc-800'
					showInteractive={false}
				/>
			</ReactFlow>
		</div>
	);
};

const Canvas = () => (
	<ReactFlowProvider>
		<CanvasInner />
	</ReactFlowProvider>
);

export default Canvas;
