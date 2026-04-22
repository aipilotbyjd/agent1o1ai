import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { TCanvasNodeData } from '../../../_types/editor.type';
import { NODE_CATALOG_MAP } from '../../_helper/nodeCatalog.constants';
import {
	HUE_TO_CLASSES,
	PORT_TYPE_COLOR,
	STATUS_BADGE,
} from '../../_helper/builder.constants';

const HUE_TO_GRADIENT: Record<string, string> = {
	sky: 'from-sky-400 to-sky-600',
	violet: 'from-violet-400 to-violet-600',
	fuchsia: 'from-fuchsia-400 to-fuchsia-600',
	emerald: 'from-emerald-400 to-emerald-600',
	amber: 'from-amber-400 to-amber-600',
	rose: 'from-rose-400 to-rose-600',
	indigo: 'from-indigo-400 to-indigo-600',
	red: 'from-red-400 to-red-600',
	green: 'from-green-400 to-green-600',
	teal: 'from-teal-400 to-teal-600',
	purple: 'from-purple-400 to-purple-600',
	cyan: 'from-cyan-400 to-cyan-600',
	yellow: 'from-yellow-400 to-yellow-600',
	zinc: 'from-zinc-400 to-zinc-600',
};

const STATUS_DOT: Record<string, string> = {
	idle: 'bg-zinc-400',
	queued: 'bg-sky-500',
	running: 'bg-blue-500 animate-pulse',
	success: 'bg-emerald-500',
	error: 'bg-red-500',
	skipped: 'bg-zinc-400',
};

const BaseNode = ({ data, selected }: NodeProps) => {
	const d = data as TCanvasNodeData;
	const def = NODE_CATALOG_MAP[d.defKey];
	if (!def) return null;
	const hue = HUE_TO_CLASSES[def.color] ?? HUE_TO_CLASSES.zinc;
	const gradient = HUE_TO_GRADIENT[def.color] ?? HUE_TO_GRADIENT.zinc;
	const statusKey = d.status ?? 'idle';
	const status = STATUS_BADGE[statusKey];
	const dot = STATUS_DOT[statusKey] ?? STATUS_DOT.idle;
	const isRunning = statusKey === 'running';
	const hasError = statusKey === 'error';

	return (
		<div
			className={[
				'group relative min-w-[260px] overflow-hidden rounded-none border-2 border-editorial-ink bg-white shadow-editorial-soft transition-all',
				'hover:shadow-editorial hover:-translate-y-[1px]',
				hasError
					? 'border-rose-500'
					: selected
						? `${hue.border} ring-2 ${hue.ring} shadow-editorial`
						: 'border-editorial-ink',
			].join(' ')}>
			{/* Accent color strip */}
			<div className={`h-1.5 w-full ${hue.bg}`} aria-hidden='true' />

			{/* Running glow */}
			{isRunning && (
				<div
					className={`pointer-events-none absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br ${gradient} opacity-10`}
					aria-hidden='true'
				/>
			)}

			{/* Input handles */}
			{def.inputs.map((p, i) => (
				<Handle
					key={p.id}
					id={p.id}
					type='target'
					position={Position.Left}
					style={{
						top: 58 + i * 20,
						width: 10,
						height: 10,
						background: PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
						border: '2px solid #1A1A1A',
						borderRadius: 0,
						boxShadow: '2px 2px 0px rgba(26,26,26,0.2)',
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
						top: 58 + i * 20,
						width: 10,
						height: 10,
						background: PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
						border: '2px solid #1A1A1A',
						borderRadius: 0,
						boxShadow: '2px 2px 0px rgba(26,26,26,0.2)',
					}}
				/>
			))}

			{/* Header */}
			<div className='relative flex items-center gap-2.5 px-3.5 pb-2.5 pt-3'>
				<span
					className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-white text-lg leading-none shadow-editorial-soft`}>
					{def.icon}
				</span>
				<div className='min-w-0 flex-1'>
					<div className='truncate text-sm font-serif font-black italic text-editorial-ink'>
						{d.label}
					</div>
					<div className='mt-0.5 flex items-center gap-1.5'>
						<span className='font-black uppercase tracking-[0.3em] text-[9px] text-editorial-ink/60'>
							{def.category}
						</span>
						<span className='text-editorial-ink/30'>·</span>
						<span className='inline-flex items-center gap-1 font-mono text-[10px] tracking-tighter text-editorial-ink/70'>
							<span className={`h-1.5 w-1.5 rounded-none ${dot}`} />
							{status.label}
						</span>
					</div>
				</div>
			</div>

			{/* Divider */}
			<div className='mx-0 h-px bg-editorial-ink' aria-hidden='true' />

			{/* Body — field preview */}
			<div className='relative space-y-1.5 px-3.5 py-2.5'>
				{def.fields.slice(0, 2).map((f) => {
					const v = d.values?.[f.key];
					const isEmpty = v == null || v === '';
					return (
						<div
							key={f.key}
							className='flex items-center justify-between gap-2 text-[11px]'>
							<span className='shrink-0 font-black uppercase tracking-[0.2em] text-[9px] text-editorial-ink/50'>{f.label}</span>
							<span
								className={`truncate font-mono tracking-tighter text-[10px] ${isEmpty ? 'italic text-editorial-ink/30' : 'text-editorial-ink/80'}`}>
								{isEmpty ? '—' : String(v).slice(0, 40)}
							</span>
						</div>
					);
				})}
				{def.fields.length === 0 && (
					<div className='text-[11px] italic text-editorial-ink/40'>No settings</div>
				)}
			</div>

			{/* Footer meta */}
			{(def.outputs.length > 0 || d.durationMs != null) && (
				<div className='flex items-center justify-between gap-2 border-t-2 border-editorial-ink bg-editorial-bg px-3.5 py-1.5 text-[10px]'>
					<div className='flex min-w-0 flex-wrap gap-1'>
						{def.outputs.slice(0, 3).map((p) => (
							<span
								key={p.id}
								className='inline-flex items-center gap-1 rounded-none border border-editorial-ink bg-white px-1.5 py-0.5 text-editorial-ink/70'>
								<span
									className='h-1.5 w-1.5 rounded-none'
									style={{
										backgroundColor:
											PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
									}}
								/>
								<span className='font-mono tracking-tighter text-[9px]'>{p.name}</span>
							</span>
						))}
					</div>
					{d.durationMs != null && (
						<span className='shrink-0 font-mono tabular-nums tracking-tighter text-editorial-ink/60'>
							{d.durationMs}ms
						</span>
					)}
				</div>
			)}

			{/* Error banner */}
			{d.error && (
				<div className='border-t-2 border-rose-500 bg-rose-500/10 px-3.5 py-2 text-[11px] text-rose-600'>
					<span className='mr-1 font-black uppercase tracking-widest'>Error:</span>
					{d.error}
				</div>
			)}
		</div>
	);
};

export default BaseNode;
