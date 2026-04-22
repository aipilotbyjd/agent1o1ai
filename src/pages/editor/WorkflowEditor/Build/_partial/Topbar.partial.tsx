import { useEditor } from '../_context/EditorStore.context';

const Topbar = () => {
	const meta = useEditor((s) => s.meta);
	const setMeta = useEditor((s) => s.setMeta);
	const run = useEditor((s) => s.run);
	const runWorkflow = useEditor((s) => s.runWorkflow);
	const stopRun = useEditor((s) => s.stopRun);
	const undo = useEditor((s) => s.undo);
	const redo = useEditor((s) => s.redo);
	const past = useEditor((s) => s.past.length);
	const future = useEditor((s) => s.future.length);
	const runAutoLayout = useEditor((s) => s.runAutoLayout);
	const toggleLeft = useEditor((s) => s.toggleLeftPanel);
	const toggleRight = useEditor((s) => s.toggleRightPanel);
	const toggleConsole = useEditor((s) => s.toggleConsole);
	const leftOpen = useEditor((s) => s.leftPanelOpen);
	const rightOpen = useEditor((s) => s.rightPanelOpen);

	const saveLabel = {
		saved: '✓ Saved',
		saving: '… Saving',
		dirty: '• Unsaved',
		error: '⚠ Save failed',
	}[meta.savingState];

	const saveClass = {
		saved: 'text-emerald-500',
		saving: 'text-blue-500',
		dirty: 'text-amber-500',
		error: 'text-red-500',
	}[meta.savingState];

	const isRunning = run.status === 'running';

	return (
		<header className='flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900'>
			<button
				onClick={toggleLeft}
				title='Toggle library'
				className={`rounded px-2 py-1 text-sm ${leftOpen ? 'bg-zinc-100 dark:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
				▤
			</button>

			<div className='mx-1 text-xs text-zinc-400'>
				{meta.folder} <span className='mx-1'>/</span>
			</div>
			<input
				value={meta.name}
				onChange={(e) => setMeta({ name: e.target.value, savingState: 'dirty' })}
				className='min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-sm font-semibold outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800'
			/>

			<span className={`hidden text-[11px] sm:inline ${saveClass}`}>{saveLabel}</span>

			<div className='mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-800' />

			<button
				disabled={!past}
				onClick={undo}
				title='Undo (⌘Z)'
				className='rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800'>
				↶
			</button>
			<button
				disabled={!future}
				onClick={redo}
				title='Redo (⌘⇧Z)'
				className='rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800'>
				↷
			</button>
			<button
				onClick={runAutoLayout}
				title='Auto-layout (L)'
				className='rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'>
				Auto-layout
			</button>

			<div className='mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-800' />

			<button
				onClick={toggleConsole}
				className='rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'>
				Console
			</button>
			<button
				onClick={toggleRight}
				className={`rounded px-2 py-1 text-sm ${rightOpen ? 'bg-zinc-100 dark:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
				title='Toggle inspector'>
				▥
			</button>

			{isRunning ? (
				<button
					onClick={stopRun}
					className='ml-1 rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-600'>
					■ Stop
				</button>
			) : (
				<button
					onClick={runWorkflow}
					className='ml-1 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-600'>
					▶ Run
				</button>
			)}
		</header>
	);
};

export default Topbar;
