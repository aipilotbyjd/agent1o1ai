import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import Icon from '@/components/icon/Icon';
import { useEditor } from '../_context/EditorStore.context';
import { NODE_CATALOG, CATEGORY_META } from '../_helper/nodeCatalog.constants';
import { HUE_TO_CLASSES } from '../_helper/builder.constants';
import type { TIcons } from '@/types/icons.type';

type TCommand = {
	id: string;
	title: string;
	hint?: string;
	section: 'Actions' | 'View' | 'AI' | 'Nodes';
	icon: TIcons;
	keywords?: string;
	run: () => void;
};

const CommandPalette = () => {
	const open = useEditor((s) => s.commandPaletteOpen);
	const close = () => setCommandPaletteOpen(false);

	const setCommandPaletteOpen = useEditor((s) => s.setCommandPaletteOpen);
	const runWorkflow = useEditor((s) => s.runWorkflow);
	const stopRun = useEditor((s) => s.stopRun);
	const undo = useEditor((s) => s.undo);
	const redo = useEditor((s) => s.redo);
	const runAutoLayout = useEditor((s) => s.runAutoLayout);
	const duplicateSelected = useEditor((s) => s.duplicateSelected);
	const deleteSelected = useEditor((s) => s.deleteSelected);
	const toggleLeftPanel = useEditor((s) => s.toggleLeftPanel);
	const toggleRightPanel = useEditor((s) => s.toggleRightPanel);
	const toggleConsole = useEditor((s) => s.toggleConsole);
	const toggleAiPanel = useEditor((s) => s.toggleAiPanel);
	const requestFitView = useEditor((s) => s.requestFitView);
	const addNodeFromCatalog = useEditor((s) => s.addNodeFromCatalog);
	const exportJson = useEditor((s) => s.exportJson);
	const setMeta = useEditor((s) => s.setMeta);

	const [q, setQ] = useState('');
	const [cursor, setCursor] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		setQ('');
		setCursor(0);
		setTimeout(() => inputRef.current?.focus(), 10);
	}, [open]);

	const actionCommands: TCommand[] = useMemo(
		() => [
			{
				id: 'run',
				title: 'Run workflow',
				hint: '⌘↵',
				section: 'Actions',
				icon: 'Play',
				run: () => runWorkflow(),
			},
			{
				id: 'stop',
				title: 'Stop run',
				section: 'Actions',
				icon: 'Stop',
				run: () => stopRun(),
			},
			{
				id: 'undo',
				title: 'Undo',
				hint: '⌘Z',
				section: 'Actions',
				icon: 'Backward02',
				run: () => undo(),
			},
			{
				id: 'redo',
				title: 'Redo',
				hint: '⌘⇧Z',
				section: 'Actions',
				icon: 'Forward02',
				run: () => redo(),
			},
			{
				id: 'layout',
				title: 'Auto-layout',
				hint: 'L',
				section: 'Actions',
				icon: 'Sparkles',
				run: () => runAutoLayout(),
			},
			{
				id: 'duplicate',
				title: 'Duplicate selected node',
				hint: '⌘D',
				section: 'Actions',
				icon: 'Copy01',
				run: () => duplicateSelected(),
			},
			{
				id: 'delete',
				title: 'Delete selected node',
				hint: '⌫',
				section: 'Actions',
				icon: 'Delete02',
				run: () => deleteSelected(),
			},
			{
				id: 'export',
				title: 'Export workflow JSON',
				section: 'Actions',
				icon: 'Code',
				run: () => {
					const json = exportJson();
					navigator.clipboard?.writeText(json).catch(() => {});
					setMeta({ savingState: 'saved' });
				},
			},
			{
				id: 'fit',
				title: 'Fit view to canvas',
				hint: 'F',
				section: 'View',
				icon: 'ArrowShrink',
				run: () => requestFitView(),
			},
			{
				id: 'toggle-library',
				title: 'Toggle node library',
				section: 'View',
				icon: 'LayoutLeft',
				run: () => toggleLeftPanel(),
			},
			{
				id: 'toggle-inspector',
				title: 'Toggle inspector',
				section: 'View',
				icon: 'LayoutRight',
				run: () => toggleRightPanel(),
			},
			{
				id: 'toggle-console',
				title: 'Toggle console',
				section: 'View',
				icon: 'Console',
				run: () => toggleConsole(),
			},
			{
				id: 'toggle-ai',
				title: 'Open AI Builder',
				hint: '⌘K',
				section: 'AI',
				icon: 'Sparkles',
				keywords: 'assistant generate',
				run: () => toggleAiPanel(),
			},
		],
		[
			runWorkflow,
			stopRun,
			undo,
			redo,
			runAutoLayout,
			duplicateSelected,
			deleteSelected,
			exportJson,
			setMeta,
			requestFitView,
			toggleLeftPanel,
			toggleRightPanel,
			toggleConsole,
			toggleAiPanel,
		],
	);

	const nodeCommands: TCommand[] = useMemo(
		() =>
			NODE_CATALOG.map((n) => ({
				id: `add:${n.key}`,
				title: `Add ${n.label}`,
				hint: CATEGORY_META[n.category].label,
				section: 'Nodes' as const,
				icon: 'PlusSign' as TIcons,
				keywords: `${n.category} ${n.description}`,
				run: () => addNodeFromCatalog(n.key, { x: 120, y: 120 }),
			})),
		[addNodeFromCatalog],
	);

	const allCommands = useMemo(
		() => [...actionCommands, ...nodeCommands],
		[actionCommands, nodeCommands],
	);

	const fuse = useMemo(
		() =>
			new Fuse(allCommands, {
				keys: ['title', 'section', 'keywords'],
				threshold: 0.35,
			}),
		[allCommands],
	);

	const filtered = useMemo(() => {
		if (!q.trim()) return allCommands.slice(0, 40);
		return fuse.search(q).slice(0, 40).map((r) => r.item);
	}, [q, fuse, allCommands]);

	const grouped = useMemo(() => {
		const map = new Map<string, TCommand[]>();
		filtered.forEach((c) => {
			if (!map.has(c.section)) map.set(c.section, []);
			map.get(c.section)!.push(c);
		});
		return Array.from(map.entries());
	}, [filtered]);

	const flat = filtered;

	useEffect(() => {
		setCursor(0);
	}, [q]);

	// Scroll active into view
	useEffect(() => {
		if (!listRef.current) return;
		const el = listRef.current.querySelector<HTMLElement>(`[data-cmd-idx="${cursor}"]`);
		el?.scrollIntoView({ block: 'nearest' });
	}, [cursor]);

	const runAt = (i: number) => {
		const cmd = flat[i];
		if (!cmd) return;
		cmd.run();
		close();
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setCursor((c) => Math.min(c + 1, flat.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setCursor((c) => Math.max(c - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			runAt(cursor);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	};

	if (!open) return null;

	let runningIdx = -1;

	return (
		<div
			className='fixed inset-0 z-[60] flex items-start justify-center bg-zinc-900/30 px-4 pt-[10vh] backdrop-blur-sm dark:bg-zinc-950/60'
			onClick={close}>
			<div
				role='dialog'
				aria-label='Command palette'
				onClick={(e) => e.stopPropagation()}
				className='w-full max-w-[560px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950'>
				{/* Search */}
				<div className='flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800'>
					<Icon icon='Search01' className='text-base text-zinc-400' />
					<input
						ref={inputRef}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={onKeyDown}
						placeholder='Type a command or search nodes…'
						className='flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100'
					/>
					<kbd className='rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800'>
						esc
					</kbd>
				</div>

				{/* Results */}
				<div ref={listRef} className='max-h-[50vh] overflow-y-auto p-2'>
					{flat.length === 0 && (
						<div className='p-6 text-center text-sm text-zinc-400'>
							No commands match &quot;{q}&quot;
						</div>
					)}
					{grouped.map(([section, items]) => (
						<div key={section} className='mb-2'>
							<div className='px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400'>
								{section}
							</div>
							<div className='space-y-0.5'>
								{items.map((c) => {
									runningIdx++;
									const i = runningIdx;
									const active = i === cursor;
									const node = c.id.startsWith('add:')
										? NODE_CATALOG.find((n) => `add:${n.key}` === c.id)
										: null;
									const hue = node
										? (HUE_TO_CLASSES[node.color] ?? HUE_TO_CLASSES.zinc)
										: null;
									return (
										<button
											key={c.id}
											type='button'
											data-cmd-idx={i}
											onMouseEnter={() => setCursor(i)}
											onClick={() => runAt(i)}
											className={[
												'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition',
												active
													? 'bg-zinc-900/5 dark:bg-white/10'
													: 'hover:bg-zinc-900/5 dark:hover:bg-white/5',
											].join(' ')}>
											{node && hue ? (
												<span
													className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm leading-none ${hue.border} ${hue.bg}`}>
													{node.icon}
												</span>
											) : (
												<span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-900/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'>
													<Icon icon={c.icon} className='text-sm' />
												</span>
											)}
											<span className='min-w-0 flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100'>
												{c.title}
											</span>
											{c.hint && (
												<kbd className='rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900'>
													{c.hint}
												</kbd>
											)}
										</button>
									);
								})}
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className='flex items-center justify-between border-t border-zinc-200 bg-zinc-50/60 px-4 py-2 text-[10px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50'>
					<div className='flex items-center gap-3'>
						<span className='inline-flex items-center gap-1'>
							<kbd className='rounded border border-zinc-200 bg-white px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800'>
								↑↓
							</kbd>
							Navigate
						</span>
						<span className='inline-flex items-center gap-1'>
							<kbd className='rounded border border-zinc-200 bg-white px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800'>
								↵
							</kbd>
							Select
						</span>
					</div>
					<span className='inline-flex items-center gap-1'>
						<Icon icon='Command' className='text-[10px]' />
						<span>{allCommands.length} commands</span>
					</span>
				</div>
			</div>
		</div>
	);
};

export default CommandPalette;
