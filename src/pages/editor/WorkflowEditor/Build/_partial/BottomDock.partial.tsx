import { useState } from 'react';
import Icon from '@/components/icon/Icon';
import { useEditor } from '../_context/EditorStore.context';
import QuickNodePicker from './QuickNodePicker.partial';
import type { TIcons } from '@/types/icons.type';

type TDockBtn = {
	icon: TIcons;
	label: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	active?: boolean;
	tone?: 'default' | 'primary' | 'danger';
};

const DockButton = ({ icon, label, onClick, active, tone = 'default' }: TDockBtn) => {
	const toneClass =
		tone === 'primary'
			? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/50'
			: tone === 'danger'
				? 'bg-red-500 text-white shadow-md shadow-red-500/40 hover:bg-red-600'
				: active
					? 'bg-zinc-900/10 text-zinc-900 dark:bg-white/15 dark:text-white'
					: 'text-zinc-600 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white';

	const size =
		tone === 'primary' || tone === 'danger' ? 'h-10 w-10 rounded-xl' : 'h-9 w-9 rounded-lg';

	return (
		<button
			type='button'
			onClick={onClick}
			title={label}
			aria-label={label}
			className={`group relative inline-flex items-center justify-center transition ${size} ${toneClass}`}>
			<Icon
				icon={icon}
				className={`${tone === 'primary' || tone === 'danger' ? 'text-lg' : 'text-base'}`}
			/>
			<span className='pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900'>
				{label}
			</span>
		</button>
	);
};

const Divider = () => (
	<div className='mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-700' aria-hidden='true' />
);

const BottomDock = () => {
	const runWorkflow = useEditor((s) => s.runWorkflow);
	const stopRun = useEditor((s) => s.stopRun);
	const runAutoLayout = useEditor((s) => s.runAutoLayout);
	const toggleAi = useEditor((s) => s.toggleAiPanel);
	const togglePalette = useEditor((s) => s.toggleCommandPalette);
	const toggleConsole = useEditor((s) => s.toggleConsole);
	const requestFitView = useEditor((s) => s.requestFitView);
	const addNode = useEditor((s) => s.addNodeFromCatalog);
	const isRunning = useEditor((s) => s.run.status === 'running');
	const aiOpen = useEditor((s) => s.aiPanelOpen);
	const consoleOpen = useEditor((s) => s.consoleOpen);

	const [pickerAt, setPickerAt] = useState<{ x: number; y: number } | null>(null);

	const openAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
		const r = e.currentTarget.getBoundingClientRect();
		setPickerAt({ x: r.left + r.width / 2 - 140, y: r.top - 400 });
	};

	return (
		<>
			<div className='pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center'>
				<div className='pointer-events-auto flex items-center gap-1 rounded-2xl border border-zinc-200 bg-white/80 p-1.5 shadow-xl ring-1 ring-black/5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80'>
					<DockButton icon='Command' label='Command palette (⌘P)' onClick={togglePalette} />
					<DockButton icon='PlusSign' label='Add node' onClick={openAdd} />
					<DockButton
						icon='Sparkles'
						label='AI Builder (⌘K)'
						onClick={toggleAi}
						active={aiOpen}
					/>
					<Divider />
					<DockButton icon='ArrowShrink' label='Fit view' onClick={requestFitView} />
					<DockButton icon='Stars' label='Auto-layout (L)' onClick={runAutoLayout} />
					<DockButton
						icon='Console'
						label={consoleOpen ? 'Hide console' : 'Show console'}
						onClick={toggleConsole}
						active={consoleOpen}
					/>
					<Divider />
					{isRunning ? (
						<DockButton icon='Stop' label='Stop' onClick={stopRun} tone='danger' />
					) : (
						<DockButton
							icon='Play'
							label='Run (⌘↵)'
							onClick={runWorkflow}
							tone='primary'
						/>
					)}
				</div>
			</div>

			{pickerAt && (
				<QuickNodePicker
					anchor={pickerAt}
					onPick={(key) => {
						addNode(key, { x: 240, y: 200 });
						setPickerAt(null);
					}}
					onClose={() => setPickerAt(null)}
				/>
			)}
		</>
	);
};

export default BottomDock;
