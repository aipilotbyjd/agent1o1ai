import { useMemo, useState } from 'react';
import { useEditor } from '../_context/EditorStore.context';

const Console = () => {
	const open = useEditor((s) => s.consoleOpen);
	const toggle = useEditor((s) => s.toggleConsole);
	const run = useEditor((s) => s.run);
	const nodes = useEditor((s) => s.nodes);
	const [filterNode, setFilterNode] = useState<string>('all');

	const filtered = useMemo(
		() => (filterNode === 'all' ? run.logs : run.logs.filter((l) => l.nodeId === filterNode)),
		[run.logs, filterNode],
	);

	if (!open) return null;

	const statusClass = {
		idle: 'text-zinc-500',
		running: 'text-blue-500',
		success: 'text-emerald-500',
		error: 'text-red-500',
		stopped: 'text-amber-500',
	}[run.status];

	return (
		<div className='flex h-60 shrink-0 flex-col border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
			<div className='flex h-9 items-center gap-3 border-b border-zinc-200 px-3 dark:border-zinc-800'>
				<div className='text-[11px] font-semibold uppercase tracking-wider text-zinc-500'>
					Execution Console
				</div>
				<span className={`text-[11px] font-medium ${statusClass}`}>
					{run.status.toUpperCase()}
				</span>
				{run.startedAt && (
					<span className='text-[11px] text-zinc-400'>
						{run.finishedAt
							? `${((run.finishedAt - run.startedAt) / 1000).toFixed(2)}s`
							: 'running…'}
					</span>
				)}
				<select
					value={filterNode}
					onChange={(e) => setFilterNode(e.target.value)}
					className='ml-auto rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] outline-none dark:border-zinc-800 dark:bg-zinc-950'>
					<option value='all'>All nodes</option>
					{nodes.map((n) => (
						<option key={n.id} value={n.id}>
							{n.data.label}
						</option>
					))}
				</select>
				<button
					onClick={toggle}
					className='rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'>
					✕
				</button>
			</div>
			<div className='flex-1 overflow-y-auto p-2 font-mono text-[11px]'>
				{filtered.length === 0 && (
					<div className='p-3 text-zinc-400'>No logs yet. Click ▶ Run to start.</div>
				)}
				{filtered.map((l) => {
					const node = nodes.find((n) => n.id === l.nodeId);
					const cls =
						l.level === 'error'
							? 'text-red-500'
							: l.level === 'warn'
								? 'text-amber-500'
								: 'text-zinc-600 dark:text-zinc-300';
					return (
						<div key={l.id} className='flex gap-2'>
							<span className='text-zinc-400'>
								{new Date(l.at).toLocaleTimeString()}
							</span>
							<span className='text-zinc-500'>[{node?.data.label ?? l.nodeId}]</span>
							<span className={cls}>{l.message}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Console;
