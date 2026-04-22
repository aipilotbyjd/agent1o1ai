import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { TCanvasNodeData } from '../../../_types/editor.type';
import { NODE_CATALOG_MAP } from '../../_helper/nodeCatalog.constants';
import {
	HUE_TO_CLASSES,
	PORT_TYPE_COLOR,
	STATUS_BADGE,
} from '../../_helper/builder.constants';

const BaseNode = ({ data, selected }: NodeProps) => {
	const d = data as TCanvasNodeData;
	const def = NODE_CATALOG_MAP[d.defKey];
	if (!def) return null;
	const hue = HUE_TO_CLASSES[def.color] ?? HUE_TO_CLASSES.zinc;
	const status = STATUS_BADGE[d.status ?? 'idle'];

	return (
		<div
			className={`relative min-w-[240px] rounded-xl border bg-white/90 backdrop-blur-sm shadow-sm transition-all dark:bg-zinc-900/90 ${hue.border} ${
				selected ? `ring-2 ${hue.ring}` : ''
			}`}>
			{/* Input handles */}
			{def.inputs.map((p, i) => (
				<Handle
					key={p.id}
					id={p.id}
					type='target'
					position={Position.Left}
					style={{
						top: 44 + i * 18,
						width: 10,
						height: 10,
						background: PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
						border: '2px solid white',
					}}
				/>
			))}

			{/* Output handles */}
			{def.outputs.map((p, i) => (
				<Handle
					key={p.id}
					id={p.id}
					type='source'
					position={Position.Right}
					style={{
						top: 44 + i * 18,
						width: 10,
						height: 10,
						background: PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
						border: '2px solid white',
					}}
				/>
			))}

			{/* Header */}
			<div className={`flex items-center gap-2 rounded-t-xl px-3 py-2 ${hue.bg}`}>
				<span className='text-lg leading-none'>{def.icon}</span>
				<div className='min-w-0 flex-1'>
					<div className={`truncate text-sm font-semibold ${hue.text}`}>
						{d.label}
					</div>
					<div className='truncate text-[10px] uppercase tracking-wider text-zinc-400'>
						{def.category}
					</div>
				</div>
				<span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${status.className}`}>
					{status.label}
				</span>
			</div>

			{/* Body — tiny preview of key field values */}
			<div className='space-y-1 px-3 py-2'>
				{def.fields.slice(0, 2).map((f) => {
					const v = d.values?.[f.key];
					return (
						<div key={f.key} className='flex items-center gap-2 text-[11px]'>
							<span className='text-zinc-400'>{f.label}</span>
							<span className='truncate text-zinc-600 dark:text-zinc-300'>
								{v == null || v === '' ? '—' : String(v).slice(0, 48)}
							</span>
						</div>
					);
				})}
				{def.inputs.length + def.outputs.length > 0 && (
					<div className='flex flex-wrap gap-1 pt-1'>
						{def.outputs.map((p) => (
							<span
								key={p.id}
								className='rounded bg-zinc-500/10 px-1.5 py-0.5 text-[10px] text-zinc-500'>
								{p.name}: {p.type}
							</span>
						))}
					</div>
				)}
				{d.durationMs != null && (
					<div className='pt-1 text-[10px] text-zinc-400'>{d.durationMs}ms</div>
				)}
				{d.error && (
					<div className='rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-500'>
						{d.error}
					</div>
				)}
			</div>
		</div>
	);
};

export default BaseNode;
