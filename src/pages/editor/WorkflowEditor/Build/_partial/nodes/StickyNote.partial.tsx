import { type NodeProps } from '@xyflow/react';
import type { TCanvasNodeData } from '../../../_types/editor.type';

const StickyNote = ({ data, selected }: NodeProps) => {
	const d = data as TCanvasNodeData;
	const text = ((d.values?.text as string) ?? '').trim();
	return (
		<div
			className={[
				'group relative min-h-[110px] min-w-[220px] max-w-[300px] rotate-[-0.5deg] overflow-hidden rounded-lg border border-yellow-400/60 bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-900 shadow-[0_8px_20px_-8px_rgba(202,138,4,0.35)] transition-all',
				'hover:rotate-0 hover:shadow-[0_12px_28px_-8px_rgba(202,138,4,0.45)]',
				'dark:from-yellow-500/20 dark:to-yellow-600/20 dark:text-yellow-100',
				selected ? 'rotate-0 ring-2 ring-yellow-500/60' : '',
			].join(' ')}>
			{/* Folded corner */}
			<div
				className='pointer-events-none absolute right-0 top-0 h-5 w-5 bg-gradient-to-br from-yellow-300/70 to-yellow-400/90 [clip-path:polygon(100%_0,100%_100%,0_0)] dark:from-yellow-500/40 dark:to-yellow-600/60'
				aria-hidden='true'
			/>
			<div className='px-3.5 pb-3 pt-3 pr-6'>
				<div className='mb-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-yellow-700/80 dark:text-yellow-200/70'>
					<span>📝</span>
					Note
				</div>
				<div className='whitespace-pre-wrap break-words text-xs leading-relaxed'>
					{text ? (
						text
					) : (
						<span className='italic text-yellow-700/60 dark:text-yellow-200/50'>
							Double-click to edit…
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default StickyNote;
