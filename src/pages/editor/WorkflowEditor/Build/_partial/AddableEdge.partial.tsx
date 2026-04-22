import { useState } from 'react';
import {
	BaseEdge,
	EdgeLabelRenderer,
	getSmoothStepPath,
	useReactFlow,
	type EdgeProps,
} from '@xyflow/react';
import Icon from '@/components/icon/Icon';
import { useEditor } from '../_context/EditorStore.context';
import QuickNodePicker from './QuickNodePicker.partial';

const AddableEdge = (props: EdgeProps) => {
	const {
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		markerEnd,
		style,
	} = props;

	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const [pickerAt, setPickerAt] = useState<{ x: number; y: number } | null>(null);
	const insertNodeOnEdge = useEditor((s) => s.insertNodeOnEdge);
	const { flowToScreenPosition, screenToFlowPosition } = useReactFlow();

	const openPicker = (e: React.MouseEvent) => {
		e.stopPropagation();
		setPickerAt({ x: e.clientX, y: e.clientY });
	};

	const closePicker = () => setPickerAt(null);

	const handlePick = (defKey: string) => {
		// Flow-space position at the edge midpoint
		const screen = flowToScreenPosition({ x: labelX, y: labelY });
		const pos = screenToFlowPosition({ x: screen.x, y: screen.y });
		insertNodeOnEdge(id, defKey, pos);
		closePicker();
	};

	return (
		<>
			<BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
			<EdgeLabelRenderer>
				<div
					className='pointer-events-auto absolute group/edge'
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}>
					<button
						type='button'
						onClick={openPicker}
						title='Insert node'
						aria-label='Insert node on edge'
						className='flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-500 opacity-0 shadow-sm transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 hover:shadow group-hover/edge:opacity-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-violet-500/60 dark:hover:bg-violet-500/10 dark:hover:text-violet-300'>
						<Icon icon='PlusSign' className='text-[10px]' />
					</button>
				</div>
			</EdgeLabelRenderer>
			{pickerAt && (
				<EdgeLabelRenderer>
					<QuickNodePicker
						anchor={pickerAt}
						onPick={handlePick}
						onClose={closePicker}
						title='Insert node'
					/>
				</EdgeLabelRenderer>
			)}
		</>
	);
};

export default AddableEdge;
