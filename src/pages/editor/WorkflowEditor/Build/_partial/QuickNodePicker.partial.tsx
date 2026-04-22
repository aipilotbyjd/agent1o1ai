import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import Icon from '@/components/icon/Icon';
import { NODE_CATALOG, CATEGORY_META } from '../_helper/nodeCatalog.constants';
import { HUE_TO_CLASSES } from '../_helper/builder.constants';

export type TQuickNodePickerProps = {
	anchor: { x: number; y: number };
	onPick: (defKey: string) => void;
	onClose: () => void;
	title?: string;
};

const QuickNodePicker = ({ anchor, onPick, onClose, title = 'Add node' }: TQuickNodePickerProps) => {
	const [q, setQ] = useState('');
	const [cursor, setCursor] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);

	const fuse = useMemo(
		() =>
			new Fuse(NODE_CATALOG, {
				keys: ['label', 'description', 'category'],
				threshold: 0.35,
			}),
		[],
	);

	const results = useMemo(() => {
		const list = q.trim() ? fuse.search(q).map((r) => r.item) : NODE_CATALOG;
		return list.slice(0, 12);
	}, [q, fuse]);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		setCursor(0);
	}, [q]);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (!wrapRef.current?.contains(e.target as Node)) onClose();
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [onClose]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setCursor((c) => Math.min(c + 1, results.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setCursor((c) => Math.max(c - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const pick = results[cursor];
			if (pick) onPick(pick.key);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
	};

	// Clamp to viewport
	const left = Math.min(Math.max(anchor.x, 12), window.innerWidth - 320);
	const top = Math.min(Math.max(anchor.y, 12), window.innerHeight - 380);

	return (
		<div
			ref={wrapRef}
			role='dialog'
			className='fixed z-50 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950'
			style={{ left, top }}>
			<div className='border-b border-zinc-200 px-2 py-2 dark:border-zinc-800'>
				<div className='mb-1 flex items-center justify-between px-1'>
					<div className='text-[10px] font-semibold uppercase tracking-wider text-zinc-500'>
						{title}
					</div>
					<kbd className='rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 text-[9px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800'>
						esc
					</kbd>
				</div>
				<div className='relative'>
					<Icon
						icon='Search01'
						className='pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400'
					/>
					<input
						ref={inputRef}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={onKeyDown}
						placeholder='Search nodes…'
						className='w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-7 pr-2 text-[13px] text-zinc-900 outline-none focus:border-zinc-300 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
					/>
				</div>
			</div>

			<div className='max-h-72 overflow-y-auto p-1'>
				{results.length === 0 ? (
					<div className='p-6 text-center text-xs text-zinc-400'>No nodes match.</div>
				) : (
					results.map((n, i) => {
						const hue = HUE_TO_CLASSES[n.color] ?? HUE_TO_CLASSES.zinc;
						const cat = CATEGORY_META[n.category];
						const active = i === cursor;
						return (
							<button
								key={n.key}
								type='button'
								onMouseEnter={() => setCursor(i)}
								onClick={() => onPick(n.key)}
								className={[
									'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition',
									active
										? 'bg-zinc-900/5 dark:bg-white/10'
										: 'hover:bg-zinc-900/5 dark:hover:bg-white/5',
								].join(' ')}>
								<span
									className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm leading-none ${hue.border} ${hue.bg}`}>
									{n.icon}
								</span>
								<div className='min-w-0 flex-1'>
									<div className='truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100'>
										{n.label}
									</div>
									<div className='truncate text-[10px] text-zinc-500'>
										{cat.label} · {n.description}
									</div>
								</div>
								{active && (
									<kbd className='rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 text-[9px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800'>
										↵
									</kbd>
								)}
							</button>
						);
					})
				)}
			</div>
		</div>
	);
};

export default QuickNodePicker;
