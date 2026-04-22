import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { NODE_CATALOG, CATEGORY_META } from '../_helper/nodeCatalog.constants';
import { HUE_TO_CLASSES } from '../_helper/builder.constants';
import type { TNodeDefinition } from '../../_types/editor.type';
import { useEditor } from '../_context/EditorStore.context';

const NodeLibrary = () => {
	const [q, setQ] = useState('');
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
	const addNodeFromCatalog = useEditor((s) => s.addNodeFromCatalog);
	const leftPanelOpen = useEditor((s) => s.leftPanelOpen);

	const fuse = useMemo(
		() =>
			new Fuse(NODE_CATALOG, {
				keys: ['label', 'description', 'category'],
				threshold: 0.35,
			}),
		[],
	);

	const filtered = useMemo(() => {
		if (!q.trim()) return NODE_CATALOG;
		return fuse.search(q).map((r) => r.item);
	}, [q, fuse]);

	const grouped = useMemo(() => {
		const map = new Map<string, TNodeDefinition[]>();
		filtered.forEach((n) => {
			if (!map.has(n.category)) map.set(n.category, []);
			map.get(n.category)!.push(n);
		});
		return Array.from(map.entries()).sort(
			(a, b) => CATEGORY_META[a[0] as keyof typeof CATEGORY_META].order -
				CATEGORY_META[b[0] as keyof typeof CATEGORY_META].order,
		);
	}, [filtered]);

	const onDragStart = (e: React.DragEvent, defKey: string) => {
		e.dataTransfer.setData('application/x-node-def', defKey);
		e.dataTransfer.effectAllowed = 'move';
	};

	if (!leftPanelOpen) return null;

	return (
		<aside className='flex h-full w-72 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
			<div className='border-b border-zinc-200 p-3 dark:border-zinc-800'>
				<div className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500'>
					Node Library
				</div>
				<div className='relative'>
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder='Search nodes… (/)'
						className='w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:bg-zinc-900'
					/>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-2'>
				{grouped.map(([cat, items]) => {
					const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
					const isCollapsed = collapsed[cat];
					return (
						<div key={cat} className='mb-2'>
							<button
								onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
								className='flex w-full items-center justify-between rounded px-2 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'>
								<span className='uppercase tracking-wider'>{meta.label}</span>
								<span className='text-zinc-400'>{isCollapsed ? '+' : '−'}</span>
							</button>
							{!isCollapsed && (
								<div className='mt-1 space-y-1'>
									{items.map((n) => {
										const hue = HUE_TO_CLASSES[n.color] ?? HUE_TO_CLASSES.zinc;
										return (
											<button
												key={n.key}
												draggable
												onDragStart={(e) => onDragStart(e, n.key)}
												onClick={() =>
													addNodeFromCatalog(n.key, {
														x: 120 + Math.random() * 200,
														y: 120 + Math.random() * 200,
													})
												}
												className={`group flex w-full cursor-grab items-start gap-2 rounded-md border px-2 py-2 text-left transition active:cursor-grabbing ${hue.border} ${hue.bg} hover:ring-1 ${hue.ring}`}>
												<span className='mt-0.5 text-base leading-none'>
													{n.icon}
												</span>
												<div className='min-w-0 flex-1'>
													<div className={`truncate text-xs font-medium ${hue.text}`}>
														{n.label}
													</div>
													<div className='line-clamp-2 text-[10px] text-zinc-500'>
														{n.description}
													</div>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
				{grouped.length === 0 && (
					<div className='p-4 text-center text-xs text-zinc-400'>No nodes match.</div>
				)}
			</div>
		</aside>
	);
};

export default NodeLibrary;
