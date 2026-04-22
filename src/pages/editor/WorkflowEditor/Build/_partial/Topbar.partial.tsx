import { Link } from 'react-router';
import Icon from '@/components/icon/Icon';
import { useEditor } from '../_context/EditorStore.context';
import useDarkMode from '@/hooks/useDarkMode';
import DARK_MODE from '@/constants/darkMode.constant';
import type { TIcons } from '@/types/icons.type';
import type { TDarkMode } from '@/types/darkMode.type';

type TToolButtonProps = {
	icon: TIcons;
	label: string;
	onClick?: () => void;
	active?: boolean;
	disabled?: boolean;
	shortcut?: string;
};

const ToolButton = ({ icon, label, onClick, active, disabled, shortcut }: TToolButtonProps) => (
	<button
		type='button'
		onClick={onClick}
		disabled={disabled}
		title={shortcut ? `${label} (${shortcut})` : label}
		aria-label={label}
		className={[
			'inline-flex h-8 w-8 items-center justify-center rounded-none border-2 border-transparent transition',
			active
				? 'border-editorial-ink bg-editorial-ink text-white'
				: 'text-editorial-ink/60 hover:border-editorial-ink hover:text-editorial-ink',
			'disabled:pointer-events-none disabled:opacity-30',
		].join(' ')}>
		<Icon icon={icon} className='text-[17px]' />
	</button>
);

const Divider = () => (
	<div className='mx-1 h-5 w-px bg-editorial-ink/20' aria-hidden='true' />
);

const SAVE_STATE_META = {
	saved: {
		label: 'Saved',
		icon: 'Tick02' as TIcons,
		tone: 'text-emerald-600 dark:text-emerald-400',
		dot: 'bg-emerald-500',
	},
	saving: {
		label: 'Saving…',
		icon: 'FloppyDisk' as TIcons,
		tone: 'text-sky-600 dark:text-sky-400',
		dot: 'bg-sky-500 animate-pulse',
	},
	dirty: {
		label: 'Unsaved changes',
		icon: 'FloppyDisk' as TIcons,
		tone: 'text-amber-600 dark:text-amber-400',
		dot: 'bg-amber-500',
	},
	error: {
		label: 'Save failed',
		icon: 'CancelCircle' as TIcons,
		tone: 'text-red-600 dark:text-red-400',
		dot: 'bg-red-500',
	},
} as const;

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
	const consoleOpen = useEditor((s) => s.consoleOpen);
	const toggleAiPanel = useEditor((s) => s.toggleAiPanel);
	const aiOpen = useEditor((s) => s.aiPanelOpen);

	const { darkModeStatus, setDarkModeStatus } = useDarkMode();
	const themeMeta: Record<TDarkMode, { icon: TIcons; label: string; next: TDarkMode }> = {
		system: { icon: 'Computer', label: 'Theme: System', next: 'light' },
		light: { icon: 'Sun03', label: 'Theme: Light', next: 'dark' },
		dark: { icon: 'Moon02', label: 'Theme: Dark', next: 'system' },
	};
	const currentTheme = (darkModeStatus ?? DARK_MODE.SYSTEM) as TDarkMode;
	const theme = themeMeta[currentTheme];
	const cycleTheme = () => setDarkModeStatus(theme.next);

	const save = SAVE_STATE_META[meta.savingState];
	const isRunning = run.status === 'running';

	return (
		<header className='flex h-14 shrink-0 items-center gap-2 border-b-2 border-editorial-ink bg-editorial-bg/95 px-3 backdrop-blur-md'>
			{/* Left: library toggle + brand + breadcrumb */}
			<div className='flex min-w-0 items-center gap-2'>
				<ToolButton
					icon='LayoutLeft'
					label={leftOpen ? 'Hide node library' : 'Show node library'}
					onClick={toggleLeft}
					active={leftOpen}
				/>

				<Divider />

				<Link
					to='/app/workflows'
					title='Back to workflows'
					className='group flex items-center gap-2 rounded-none border-2 border-editorial-ink bg-white px-1 py-1 transition hover:shadow-editorial-soft'>
					<span className='flex h-7 w-7 items-center justify-center rounded-none bg-editorial-ink transition-transform group-hover:scale-105'>
						<Icon icon='WorkflowSquare03' className='text-sm text-white' />
					</span>
				</Link>

				<nav
					aria-label='Breadcrumb'
					className='flex min-w-0 items-center gap-1 font-mono text-[10px] tracking-tighter text-editorial-ink/60'>
					<Icon icon='Folder01' className='shrink-0 text-sm' />
					<span className='max-w-[140px] truncate'>{meta.folder || 'My workspace'}</span>
					<span className='mx-0.5 text-editorial-ink/30'>/</span>
				</nav>

				<input
					value={meta.name}
					onChange={(e) => setMeta({ name: e.target.value, savingState: 'dirty' })}
					placeholder='Untitled workflow'
					aria-label='Workflow name'
					className='min-w-0 max-w-[360px] truncate rounded-none border-2 border-transparent bg-transparent px-2 py-1 text-sm font-serif font-black italic text-editorial-ink outline-none transition placeholder:font-normal placeholder:text-editorial-ink/40 hover:border-editorial-ink/40 focus:border-editorial-ink'
				/>

				<div
					className={`hidden items-center gap-1.5 rounded-none border-2 border-editorial-ink bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${save.tone}`}
					title={save.label}>
					<span className={`h-1.5 w-1.5 rounded-none ${save.dot}`} />
					<span>{save.label}</span>
				</div>
			</div>

			{/* Right: tools + actions */}
			<div className='ml-auto flex items-center gap-1'>
				<ToolButton
					icon='Backward02'
					label='Undo'
					shortcut='⌘Z'
					onClick={undo}
					disabled={!past}
				/>
				<ToolButton
					icon='Forward02'
					label='Redo'
					shortcut='⌘⇧Z'
					onClick={redo}
					disabled={!future}
				/>

				<Divider />

				<ToolButton
					icon='Sparkles'
					label='Auto-layout'
					shortcut='L'
					onClick={runAutoLayout}
				/>
				<ToolButton
					icon='Console'
					label={consoleOpen ? 'Hide console' : 'Show console'}
					onClick={toggleConsole}
					active={consoleOpen}
				/>
				<ToolButton
					icon='LayoutRight'
					label={rightOpen ? 'Hide inspector' : 'Show inspector'}
					onClick={toggleRight}
					active={rightOpen}
				/>

				<Divider />

				<ToolButton icon='Share08' label='Share' />
				<ToolButton icon='Setting07' label='Settings' />
				<ToolButton
					icon={theme.icon}
					label={`${theme.label} — click to switch to ${themeMeta[theme.next].label.replace('Theme: ', '')}`}
					onClick={cycleTheme}
				/>

				<button
					type='button'
					onClick={toggleAiPanel}
					title='AI Builder (⌘K)'
					aria-label='AI Builder'
					className={[
						'group relative ml-1 inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-none border-2 px-3 text-[10px] font-black uppercase tracking-widest transition focus:outline-none focus:ring-2 focus:ring-editorial-ink/40',
						aiOpen
							? 'border-editorial-ink bg-editorial-ink text-white shadow-editorial-button'
							: 'border-editorial-ink bg-white text-editorial-ink hover:bg-editorial-bg shadow-editorial-soft',
					].join(' ')}>
					{!aiOpen && (
						<span className='pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-editorial-ink/10 to-transparent transition-transform duration-700 group-hover:translate-x-full' />
					)}
					<Icon
						icon='Sparkles'
						className='relative text-sm transition-transform group-hover:rotate-12'
					/>
					<span className='relative'>AI</span>
				</button>

				<div className='ml-1'>
					{isRunning ? (
						<button
							type='button'
							onClick={stopRun}
							className='inline-flex h-9 items-center gap-1.5 rounded-none border-2 border-rose-500 bg-rose-500 px-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-editorial-button transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40'>
							<Icon icon='Stop' className='text-base' />
							<span>Stop</span>
						</button>
					) : (
						<button
							type='button'
							onClick={runWorkflow}
							className='group inline-flex h-9 items-center gap-1.5 rounded-none border-2 border-emerald-500 bg-emerald-500 px-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-editorial-button transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40'>
							<Icon
								icon='Play'
								className='text-base transition-transform group-hover:scale-110'
							/>
							<span>Run</span>
						</button>
					)}
				</div>
			</div>
		</header>
	);
};

export default Topbar;
