import { useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import Icon from '@/components/icon/Icon';
import { NODE_CATALOG, CATEGORY_META } from '../../_helper/nodeCatalog.constants';
import { HUE_TO_CLASSES } from '../../_helper/builder.constants';
import type { TNodeDefinition } from '../../../_types/editor.type';
import { useEditor } from '../../_context/EditorStoreProvider.context';

const CATEGORY_DOT: Record<string, string> = {
	sky: 'bg-sky-500',
	violet: 'bg-violet-500',
	fuchsia: 'bg-fuchsia-500',
	emerald: 'bg-emerald-500',
	amber: 'bg-amber-500',
	rose: 'bg-rose-500',
	indigo: 'bg-indigo-500',
	red: 'bg-red-500',
	teal: 'bg-teal-500',
	cyan: 'bg-cyan-500',
	yellow: 'bg-yellow-500',
	zinc: 'bg-zinc-400',
};

const NodePanel = () => {
	const [q, setQ] = useState('');
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
	const [activeCat, setActiveCat] = useState<string>('all');
	const inputRef = useRef<HTMLInputElement>(null);
	const addNodeFromCatalog = useEditor((s) => s.addNodeFromCatalog);
	const leftPanelOpen = useEditor((s) => s.leftPanelOpen);
	const toggleLeft = useEditor((s) => s.toggleLeftPanel);

	const fuse = useMemo(
		() =>
			new Fuse(NODE_CATALOG, {
				keys: ['label', 'description', 'category'],
				threshold: 0.35,
			}),
		[],
	);

	const searched = useMemo(() => {
		if (!q.trim()) return NODE_CATALOG;
		return fuse.search(q).map((r) => r.item);
	}, [q, fuse]);

	const filtered = useMemo(() => {
		if (activeCat === 'all') return searched;
		return searched.filter((n) => n.category === activeCat);
	}, [searched, activeCat]);

	const grouped = useMemo(() => {
		const map = new Map<string, TNodeDefinition[]>();
		filtered.forEach((n) => {
			if (!map.has(n.category)) map.set(n.category, []);
			map.get(n.category)!.push(n);
		});
		return Array.from(map.entries()).sort(
			(a, b) =>
				CATEGORY_META[a[0] as keyof typeof CATEGORY_META].order -
				CATEGORY_META[b[0] as keyof typeof CATEGORY_META].order,
		);
	}, [filtered]);

	const categoryChips = useMemo(() => {
		const counts = new Map<string, number>();
		NODE_CATALOG.forEach((n) => counts.set(n.category, (counts.get(n.category) ?? 0) + 1));
		return Array.from(counts.entries()).sort(
			(a, b) =>
				CATEGORY_META[a[0] as keyof typeof CATEGORY_META].order -
				CATEGORY_META[b[0] as keyof typeof CATEGORY_META].order,
		);
	}, []);

	const onDragStart = (e: React.DragEvent, defKey: string) => {
		e.dataTransfer.setData('application/x-node-def', defKey);
		e.dataTransfer.effectAllowed = 'move';
	};

	const clearSearch = () => {
		setQ('');
		inputRef.current?.focus();
	};

	if (!leftPanelOpen) return null;

	return (
		<aside className='flex h-full w-96 shrink-0 flex-col border-r-2 border-editorial-ink bg-white'>
			{/* Header */}
			<div className='border-b-2 border-editorial-ink px-3 pb-3 pt-3'>
				<div className='mb-2.5 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<span className='flex h-6 w-6 items-center justify-center rounded-none border-2 border-editorial-ink bg-white text-zinc-700'>
							<Icon icon='Cube' className='text-sm' />
						</span>
						<div className='flex flex-col leading-tight'>
							<span className='font-serif font-black italic text-[13px] text-editorial-ink'>
								Nodes
							</span>
							<span className='font-mono text-[10px] tracking-tighter text-editorial-ink/60'>
								{NODE_CATALOG.length} available
							</span>
						</div>
					</div>
					<button
						type='button'
						onClick={toggleLeft}
						title='Hide library'
						aria-label='Hide library'
						className='inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-900/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white'>
						<Icon icon='LayoutLeft' className='text-[15px]' />
					</button>
				</div>

				{/* Search */}
				<div className='relative'>
					<span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-editorial-ink/40'>
						<Icon icon='Search01' className='text-sm' />
					</span>
					<input
						ref={inputRef}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder='Search nodes…'
						className='w-full rounded-none border-2 border-editorial-ink bg-editorial-bg py-2 pl-9 pr-16 text-sm text-editorial-ink outline-none transition placeholder:text-editorial-ink/40 focus:ring-2 focus:ring-editorial-ink/20'
					/>
					{q ? (
						<button
							type='button'
							onClick={clearSearch}
							title='Clear search'
							aria-label='Clear search'
							className='absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-none border border-editorial-ink text-editorial-ink/60 hover:bg-editorial-bg'>
							<Icon icon='Cancel01' className='text-xs' />
						</button>
					) : (
						<kbd className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-none border border-editorial-ink bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-editorial-ink/60'>
							/
						</kbd>
					)}
				</div>

				{/* Category filter chips */}
				<div className='-mx-3 mt-3 flex gap-1.5 overflow-x-auto px-3 pb-0.5 [&::-webkit-scrollbar]:hidden'>
					<button
						type='button'
						onClick={() => setActiveCat('all')}
						className={[
							'inline-flex shrink-0 items-center gap-1.5 rounded-none border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition',
							activeCat === 'all'
								? 'border-editorial-ink bg-editorial-ink text-white'
								: 'border-editorial-ink/30 bg-white text-editorial-ink/70 hover:border-editorial-ink hover:bg-editorial-bg',
						].join(' ')}>
						All
						<span className='tabular-nums opacity-70'>{NODE_CATALOG.length}</span>
					</button>
					{categoryChips.map(([cat, count]) => {
						const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
						const active = activeCat === cat;
						return (
							<button
								key={cat}
								type='button'
								onClick={() => setActiveCat(cat)}
								className={[
									'inline-flex shrink-0 items-center gap-1.5 rounded-none border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition',
									active
										? 'border-editorial-ink bg-editorial-ink text-white'
										: 'border-editorial-ink/30 bg-white text-editorial-ink/70 hover:border-editorial-ink hover:bg-editorial-bg',
								].join(' ')}>
								<span
									className={`h-1.5 w-1.5 rounded-none ${CATEGORY_DOT[meta.hue] ?? 'bg-zinc-400'}`}
								/>
								{meta.label}
								<span className='tabular-nums opacity-70'>{count}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* List */}
			<div className='flex-1 overflow-y-auto px-2 py-2'>
				{grouped.map(([cat, items]) => {
					const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
					const isCollapsed = collapsed[cat];
					const dot = CATEGORY_DOT[meta.hue] ?? 'bg-zinc-400';
					return (
						<div key={cat} className='mb-3'>
							<button
								type='button'
								onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
								className='flex w-full items-center justify-between rounded-md px-2 py-1.5 text-zinc-600 hover:bg-zinc-900/5 dark:text-zinc-400 dark:hover:bg-white/5'>
								<span className='inline-flex items-center gap-2'>
									<span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
									<span className='text-[11px] font-semibold uppercase tracking-wider'>
										{meta.label}
									</span>
									<span className='rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
										{items.length}
									</span>
								</span>
								<Icon
									icon='ArrowDown01'
									className={`text-xs text-zinc-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
								/>
							</button>
							{!isCollapsed && (
								<div className='mt-1 space-y-1'>
									{items.map((n) => {
										const hue = HUE_TO_CLASSES[n.color] ?? HUE_TO_CLASSES.zinc;
										return (
											<button
												key={n.key}
												type='button'
												draggable
												onDragStart={(e) => onDragStart(e, n.key)}
												onClick={() =>
													addNodeFromCatalog(n.key, {
														x: 120 + Math.random() * 200,
														y: 120 + Math.random() * 200,
													})
												}
												className='group relative flex w-full cursor-grab items-center gap-2.5 rounded-none border-2 border-transparent bg-transparent px-2 py-2 text-left transition hover:border-editorial-ink hover:bg-editorial-bg hover:shadow-editorial-soft active:cursor-grabbing'>
												<span
													className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink text-base leading-none ${hue.bg}`}>
													{n.icon}
												</span>
												<div className='min-w-0 flex-1'>
													<div className='flex items-center gap-1.5'>
														<span className='truncate font-serif font-black italic text-[13px] text-editorial-ink'>
															{n.label}
														</span>
													</div>
													<div className='line-clamp-1 font-mono text-[10px] tracking-tighter text-editorial-ink/60'>
														{n.description}
													</div>
												</div>
												<span
													className='text-zinc-300 opacity-0 transition group-hover:opacity-100 dark:text-zinc-600'
													aria-hidden='true'
													title='Drag to canvas'>
													<Icon icon='More' className='text-sm' />
												</span>
											</button>
										);
									})}
								</div>
							)}
						</div>
					);
				})}

				{grouped.length === 0 && (
					<div className='flex flex-col items-center justify-center px-4 py-12 text-center'>
						<div className='mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800'>
							<Icon icon='Search01' className='text-lg' />
						</div>
						<div className='text-sm font-medium text-zinc-700 dark:text-zinc-200'>
							No nodes found
						</div>
						<div className='mt-0.5 text-xs text-zinc-500'>
							Try a different search or category.
						</div>
						{(q || activeCat !== 'all') && (
							<button
								type='button'
								onClick={() => {
									setQ('');
									setActiveCat('all');
								}}
								className='mt-3 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'>
								Reset filters
							</button>
						)}
					</div>
				)}
			</div>

			{/* Footer hint */}
			<div className='border-t border-zinc-200 px-3 py-2 dark:border-zinc-800'>
				<div className='flex items-center gap-1.5 text-[11px] text-zinc-500'>
					<Icon icon='Cursor01' className='text-sm' />
					<span>Drag a node onto the canvas, or click to add.</span>
				</div>
			</div>
		</aside>
	);
};

export default NodePanel;
