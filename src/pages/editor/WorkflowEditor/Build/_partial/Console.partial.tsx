import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/icon/Icon';
import { useEditor } from '../_context/EditorStore.context';

const RUN_STATUS_META: Record<
	string,
	{ label: string; dot: string; text: string; bg: string }
> = {
	idle: {
		label: 'Idle',
		dot: 'bg-zinc-400',
		text: 'text-zinc-600 dark:text-zinc-300',
		bg: 'bg-zinc-100 dark:bg-zinc-800',
	},
	running: {
		label: 'Running',
		dot: 'bg-blue-500 animate-pulse',
		text: 'text-blue-600 dark:text-blue-300',
		bg: 'bg-blue-500/10',
	},
	success: {
		label: 'Success',
		dot: 'bg-emerald-500',
		text: 'text-emerald-600 dark:text-emerald-300',
		bg: 'bg-emerald-500/10',
	},
	error: {
		label: 'Error',
		dot: 'bg-red-500',
		text: 'text-red-600 dark:text-red-300',
		bg: 'bg-red-500/10',
	},
	stopped: {
		label: 'Stopped',
		dot: 'bg-amber-500',
		text: 'text-amber-600 dark:text-amber-300',
		bg: 'bg-amber-500/10',
	},
};

const LEVEL_META: Record<
	'info' | 'warn' | 'error',
	{ icon: 'CheckmarkCircle02' | 'Alert02' | 'CancelCircle'; className: string }
> = {
	info: { icon: 'CheckmarkCircle02', className: 'text-sky-500' },
	warn: { icon: 'Alert02', className: 'text-amber-500' },
	error: { icon: 'CancelCircle', className: 'text-red-500' },
};

const Console = () => {
	const open = useEditor((s) => s.consoleOpen);
	const toggle = useEditor((s) => s.toggleConsole);
	const run = useEditor((s) => s.run);
	const nodes = useEditor((s) => s.nodes);
	const [filterNode, setFilterNode] = useState<string>('all');
	const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
	const [autoscroll, setAutoscroll] = useState(true);
	const bodyRef = useRef<HTMLDivElement>(null);

	const filtered = useMemo(() => {
		let logs = run.logs;
		if (filterNode !== 'all') logs = logs.filter((l) => l.nodeId === filterNode);
		if (levelFilter !== 'all') logs = logs.filter((l) => l.level === levelFilter);
		return logs;
	}, [run.logs, filterNode, levelFilter]);

	useEffect(() => {
		if (!autoscroll || !bodyRef.current) return;
		bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
	}, [filtered.length, autoscroll]);

	if (!open) return null;

	const statusMeta = RUN_STATUS_META[run.status] ?? RUN_STATUS_META.idle;
	const counts = {
		info: run.logs.filter((l) => l.level === 'info').length,
		warn: run.logs.filter((l) => l.level === 'warn').length,
		error: run.logs.filter((l) => l.level === 'error').length,
	};

	const copyLogs = () => {
		const text = filtered
			.map((l) => {
				const node = nodes.find((n) => n.id === l.nodeId);
				const ts = new Date(l.at).toISOString();
				return `[${ts}] [${l.level.toUpperCase()}] [${node?.data.label ?? l.nodeId}] ${l.message}`;
			})
			.join('\n');
		if (text) navigator.clipboard?.writeText(text).catch(() => {});
	};

	return (
		<div className='flex h-64 shrink-0 flex-col border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'>
			{/* Header */}
			<div className='flex h-10 shrink-0 items-center gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800'>
				<div className='flex items-center gap-2'>
					<span className='flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900/5 text-zinc-700 dark:bg-white/10 dark:text-zinc-200'>
						<Icon icon='Console' className='text-sm' />
					</span>
					<span className='text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'>
						Console
					</span>
				</div>

				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusMeta.bg} ${statusMeta.text}`}>
					<span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
					{statusMeta.label}
				</span>

				{run.startedAt && (
					<span className='inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] tabular-nums text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900'>
						<Icon icon='Clock01' className='text-[10px]' />
						{run.finishedAt
							? `${((run.finishedAt - run.startedAt) / 1000).toFixed(2)}s`
							: 'running…'}
					</span>
				)}

				{/* Level counts */}
				<div className='ml-2 hidden items-center gap-1 sm:flex'>
					<LevelChip
						label='info'
						count={counts.info}
						active={levelFilter === 'info'}
						onClick={() =>
							setLevelFilter(levelFilter === 'info' ? 'all' : 'info')
						}
					/>
					<LevelChip
						label='warn'
						count={counts.warn}
						active={levelFilter === 'warn'}
						onClick={() =>
							setLevelFilter(levelFilter === 'warn' ? 'all' : 'warn')
						}
					/>
					<LevelChip
						label='error'
						count={counts.error}
						active={levelFilter === 'error'}
						onClick={() =>
							setLevelFilter(levelFilter === 'error' ? 'all' : 'error')
						}
					/>
				</div>

				<div className='ml-auto flex items-center gap-1'>
					<select
						value={filterNode}
						onChange={(e) => setFilterNode(e.target.value)}
						className='max-w-[140px] rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
						<option value='all'>All nodes</option>
						{nodes.map((n) => (
							<option key={n.id} value={n.id}>
								{n.data.label}
							</option>
						))}
					</select>
					<button
						type='button'
						onClick={() => setAutoscroll((x) => !x)}
						title={autoscroll ? 'Auto-scroll: on' : 'Auto-scroll: off'}
						aria-label='Toggle auto-scroll'
						className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${autoscroll ? 'bg-zinc-900/5 text-zinc-900 dark:bg-white/10 dark:text-white' : 'text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white'}`}>
						<Icon icon='ArrowDown01' className='text-sm' />
					</button>
					<button
						type='button'
						onClick={copyLogs}
						title='Copy logs'
						aria-label='Copy logs'
						className='inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white'>
						<Icon icon='Copy01' className='text-sm' />
					</button>
					<button
						type='button'
						onClick={toggle}
						title='Close console'
						aria-label='Close console'
						className='inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white'>
						<Icon icon='Cancel01' className='text-sm' />
					</button>
				</div>
			</div>

			{/* Body */}
			<div
				ref={bodyRef}
				className='flex-1 overflow-y-auto bg-zinc-50/60 px-3 py-2 font-mono text-[11px] leading-relaxed dark:bg-zinc-950'>
				{filtered.length === 0 ? (
					<div className='flex h-full flex-col items-center justify-center text-center'>
						<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800'>
							<Icon icon='Console' className='text-lg' />
						</div>
						<div className='text-xs font-medium text-zinc-700 dark:text-zinc-200'>
							No logs yet
						</div>
						<div className='mt-0.5 text-[11px] text-zinc-500'>
							Click <span className='font-semibold text-emerald-600'>Run</span> to
							execute this workflow.
						</div>
					</div>
				) : (
					<div className='space-y-0.5'>
						{filtered.map((l) => {
							const node = nodes.find((n) => n.id === l.nodeId);
							const meta = LEVEL_META[l.level];
							return (
								<div
									key={l.id}
									className='flex items-start gap-2 rounded px-2 py-1 hover:bg-zinc-900/5 dark:hover:bg-white/5'>
									<Icon
										icon={meta.icon}
										className={`mt-0.5 text-[11px] shrink-0 ${meta.className}`}
									/>
									<span className='shrink-0 tabular-nums text-zinc-400'>
										{new Date(l.at).toLocaleTimeString()}
									</span>
									<span className='shrink-0 truncate rounded bg-zinc-200/50 px-1.5 py-[1px] text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'>
										{node?.data.label ?? l.nodeId}
									</span>
									<span
										className={`min-w-0 flex-1 whitespace-pre-wrap break-words ${
											l.level === 'error'
												? 'text-red-600 dark:text-red-300'
												: l.level === 'warn'
													? 'text-amber-600 dark:text-amber-300'
													: 'text-zinc-700 dark:text-zinc-200'
										}`}>
										{l.message}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

const LevelChip = ({
	label,
	count,
	active,
	onClick,
}: {
	label: 'info' | 'warn' | 'error';
	count: number;
	active: boolean;
	onClick: () => void;
}) => {
	const tone = {
		info: 'text-sky-600 dark:text-sky-300 ring-sky-500/20',
		warn: 'text-amber-600 dark:text-amber-300 ring-amber-500/20',
		error: 'text-red-600 dark:text-red-300 ring-red-500/20',
	}[label];
	return (
		<button
			type='button'
			onClick={onClick}
			className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ring-1 transition ${tone} ${
				active
					? 'bg-current/10 ring-current/40'
					: 'bg-transparent hover:bg-zinc-900/5 dark:hover:bg-white/5'
			}`}>
			{label}
			<span className='tabular-nums opacity-70'>{count}</span>
		</button>
	);
};

export default Console;
