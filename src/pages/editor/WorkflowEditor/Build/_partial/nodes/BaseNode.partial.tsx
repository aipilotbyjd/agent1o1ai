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
				'group relative min-w-[260px] overflow-hidden rounded-2xl border bg-white shadow-sm transition-all dark:bg-zinc-900',
				'hover:shadow-md hover:-translate-y-[1px]',
				hasError
					? 'border-red-300 dark:border-red-800'
					: selected
						? `${hue.border} ring-2 ${hue.ring} shadow-lg`
						: 'border-zinc-200 dark:border-zinc-800',
			].join(' ')}>
			{/* Accent gradient strip */}
			<div className={`h-1 w-full bg-gradient-to-r ${gradient}`} aria-hidden='true' />

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
						width: 12,
						height: 12,
						background: PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
						border: '2px solid white',
						boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
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
						width: 12,
						height: 12,
						background: PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
						border: '2px solid white',
						boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
					}}
				/>
			))}

			{/* Header */}
			<div className='relative flex items-center gap-2.5 px-3.5 pb-2.5 pt-3'>
				<span
					className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white text-lg leading-none shadow-sm dark:bg-zinc-800 ${hue.border}`}>
					{def.icon}
				</span>
				<div className='min-w-0 flex-1'>
					<div className='truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
						{d.label}
					</div>
					<div className='mt-0.5 flex items-center gap-1.5'>
						<span className='text-[10px] uppercase tracking-wider text-zinc-400'>
							{def.category}
						</span>
						<span className='text-zinc-300 dark:text-zinc-700'>·</span>
						<span className='inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500'>
							<span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
							{status.label}
						</span>
					</div>
				</div>
			</div>

			{/* Divider */}
			<div className='mx-3.5 h-px bg-zinc-100 dark:bg-zinc-800' aria-hidden='true' />

			{/* Body — field preview */}
			<div className='relative space-y-1.5 px-3.5 py-2.5'>
				{def.fields.slice(0, 2).map((f) => {
					const v = d.values?.[f.key];
					const isEmpty = v == null || v === '';
					return (
						<div
							key={f.key}
							className='flex items-center justify-between gap-2 text-[11px]'>
							<span className='shrink-0 text-zinc-400'>{f.label}</span>
							<span
								className={`truncate font-mono ${isEmpty ? 'italic text-zinc-300 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-200'}`}>
								{isEmpty ? '—' : String(v).slice(0, 40)}
							</span>
						</div>
					);
				})}
				{def.fields.length === 0 && (
					<div className='text-[11px] italic text-zinc-400'>No settings</div>
				)}
			</div>

			{/* Footer meta */}
			{(def.outputs.length > 0 || d.durationMs != null) && (
				<div className='flex items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/50 px-3.5 py-1.5 text-[10px] dark:border-zinc-800 dark:bg-zinc-950/30'>
					<div className='flex min-w-0 flex-wrap gap-1'>
						{def.outputs.slice(0, 3).map((p) => (
							<span
								key={p.id}
								className='inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700'>
								<span
									className='h-1.5 w-1.5 rounded-full'
									style={{
										backgroundColor:
											PORT_TYPE_COLOR[p.type] ?? PORT_TYPE_COLOR.any,
									}}
								/>
								<span className='font-mono'>{p.name}</span>
							</span>
						))}
					</div>
					{d.durationMs != null && (
						<span className='shrink-0 font-mono tabular-nums text-zinc-500'>
							{d.durationMs}ms
						</span>
					)}
				</div>
			)}

			{/* Error banner */}
			{d.error && (
				<div className='border-t border-red-200 bg-red-50 px-3.5 py-2 text-[11px] text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-300'>
					<span className='mr-1 font-semibold'>Error:</span>
					{d.error}
				</div>
			)}
		</div>
	);
};

export default BaseNode;
