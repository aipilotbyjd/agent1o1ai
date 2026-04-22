import { type NodeProps } from '@xyflow/react';
import type { TCanvasNodeData } from '../../../_types/editor.type';

const StickyNote = ({ data, selected }: NodeProps) => {
	const d = data as TCanvasNodeData;
	const text = (d.values?.text as string) ?? 'Double-click to edit';
	return (
		<div
			className={`min-h-[100px] min-w-[200px] whitespace-pre-wrap rounded-md border border-yellow-500/40 bg-yellow-200/70 px-3 py-2 text-xs text-yellow-900 shadow-md dark:bg-yellow-300/30 dark:text-yellow-100 ${
				selected ? 'ring-2 ring-yellow-500/60' : ''
			}`}>
			{text}
		</div>
	);
};

export default StickyNote;
