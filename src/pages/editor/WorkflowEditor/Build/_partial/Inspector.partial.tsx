import { useMemo, useState } from 'react';
import Icon from '@/components/icon/Icon';
import { useEditor } from '../_context/EditorStore.context';
import { NODE_CATALOG_MAP } from '../_helper/nodeCatalog.constants';
import { HUE_TO_CLASSES, PORT_TYPE_COLOR, STATUS_BADGE } from '../_helper/builder.constants';
import { collectUpstreamVariables } from '../_helper/variables.helper';
import type { TNodeField } from '../../_types/editor.type';
import type { TIcons } from '@/types/icons.type';

const FieldRenderer = ({
	field,
	value,
	onChange,
	onInsertVar,
	variables,
}: {
	field: TNodeField;
	value: unknown;
	onChange: (v: unknown) => void;
	onInsertVar: (token: string) => void;
	variables: ReturnType<typeof collectUpstreamVariables>;
}) => {
	const common =
		'w-full rounded-none border-2 border-editorial-ink bg-white px-3 py-2 text-sm text-editorial-ink outline-none transition placeholder:text-editorial-ink/40 focus:ring-2 focus:ring-editorial-ink/20';

	switch (field.kind) {
		case 'text':
		case 'credential':
		case 'model':
			return field.options?.length ? (
				<select
					className={common}
					value={(value as string) ?? ''}
					onChange={(e) => onChange(e.target.value)}>
					<option value=''>— Select —</option>
					{field.options.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			) : (
				<input
					className={common}
					placeholder={field.placeholder}
					value={(value as string) ?? ''}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
		case 'number':
			return (
				<input
					type='number'
					className={common}
					value={(value as number) ?? ''}
					onChange={(e) => onChange(Number(e.target.value))}
				/>
			);
		case 'toggle': {
			const on = Boolean(value);
			return (
				<button
					type='button'
					role='switch'
					aria-checked={on}
					onClick={() => onChange(!on)}
					className={`inline-flex h-6 w-11 items-center rounded-none border-2 transition ${
						on
							? 'border-editorial-ink bg-editorial-ink'
							: 'border-editorial-ink/30 bg-editorial-bg'
					}`}>
					<span
						className={`h-5 w-5 transform rounded-none bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
					/>
				</button>
			);
		}
		case 'select':
			return (
				<select
					className={common}
					value={(value as string) ?? ''}
					onChange={(e) => onChange(e.target.value)}>
					<option value=''>— Select —</option>
					{field.options?.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			);
		case 'longtext':
		case 'code':
			return (
				<div>
					<textarea
						rows={field.rows ?? 4}
						className={`${common} font-mono`}
						placeholder={field.placeholder}
						value={(value as string) ?? ''}
						onChange={(e) => onChange(e.target.value)}
					/>
					{field.supportsVariables && variables.length > 0 && (
						<div className='mt-1 flex flex-wrap gap-1'>
							{variables.slice(0, 8).map((v) => (
								<button
									key={`${v.nodeId}:${v.outputId}`}
									onClick={() => onInsertVar(v.token)}
									className='rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-500/20 dark:text-blue-300'>
									{v.token}
								</button>
							))}
						</div>
					)}
				</div>
			);
		case 'kv': {
			const rows = (value as Array<{ k: string; v: string }>) ?? [];
			return (
				<div className='space-y-1'>
					{rows.map((r, i) => (
						<div key={i} className='flex gap-1'>
							<input
								className={common}
								placeholder='key'
								value={r.k}
								onChange={(e) => {
									const next = [...rows];
									next[i] = { ...r, k: e.target.value };
									onChange(next);
								}}
							/>
							<input
								className={common}
								placeholder='value'
								value={r.v}
								onChange={(e) => {
									const next = [...rows];
									next[i] = { ...r, v: e.target.value };
									onChange(next);
								}}
							/>
							<button
								className='rounded px-2 text-zinc-400 hover:text-red-500'
								onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>
								×
							</button>
						</div>
					))}
					<button
						className='rounded border border-dashed border-zinc-300 px-2 py-1 text-xs text-zinc-500 hover:border-zinc-400 dark:border-zinc-700'
						onClick={() => onChange([...rows, { k: '', v: '' }])}>
						+ Add row
					</button>
				</div>
			);
		}
		case 'multiselect': {
			const arr = (value as string[]) ?? [];
			return (
				<div className='flex flex-wrap gap-1'>
					{field.options?.map((o) => {
						const on = arr.includes(o.value);
						return (
							<button
								key={o.value}
								onClick={() =>
									onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])
								}
								className={`rounded-md border px-2 py-0.5 text-xs ${
									on
										? 'border-blue-500 bg-blue-500/10 text-blue-600'
										: 'border-zinc-300 text-zinc-500 dark:border-zinc-700'
								}`}>
								{o.label}
							</button>
						);
					})}
				</div>
			);
		}
		default:
			return null;
	}
};

const TABS: Array<{ key: 'settings' | 'output' | 'docs'; label: string; icon: TIcons }> = [
	{ key: 'settings', label: 'Settings', icon: 'Setting07' },
	{ key: 'output', label: 'Output', icon: 'Code' },
	{ key: 'docs', label: 'Docs', icon: 'BookOpen01' },
];

const PortPill = ({ name, type }: { name: string; type: string }) => (
	<span className='inline-flex items-center gap-1.5 rounded-none border-2 border-editorial-ink bg-white px-2 py-1 text-[10px]'>
		<span
			className='h-2 w-2 rounded-none'
			style={{ backgroundColor: PORT_TYPE_COLOR[type] ?? PORT_TYPE_COLOR.any }}
		/>
		<span className='font-medium text-editorial-ink'>{name}</span>
		<span className='text-editorial-ink/30'>·</span>
		<span className='font-mono text-[9px] tracking-tighter text-editorial-ink/60'>{type}</span>
	</span>
);

const Inspector = () => {
	const rightPanelOpen = useEditor((s) => s.rightPanelOpen);
	const selectedNodeId = useEditor((s) => s.selectedNodeId);
	const nodes = useEditor((s) => s.nodes);
	const edges = useEditor((s) => s.edges);
	const updateNodeValue = useEditor((s) => s.updateNodeValue);
	const renameNode = useEditor((s) => s.renameNode);
	const deleteSelected = useEditor((s) => s.deleteSelected);
	const duplicateSelected = useEditor((s) => s.duplicateSelected);
	const toggleRight = useEditor((s) => s.toggleRightPanel);

	const [tab, setTab] = useState<'settings' | 'output' | 'docs'>('settings');
	const node = useMemo(
		() => nodes.find((n) => n.id === selectedNodeId) ?? null,
		[nodes, selectedNodeId],
	);
	const def = node ? NODE_CATALOG_MAP[node.data.defKey] : null;
	const variables = useMemo(
		() => (node ? collectUpstreamVariables(node.id, nodes, edges) : []),
		[node, nodes, edges],
	);

	if (!rightPanelOpen) return null;

	if (!node || !def) {
		return (
			<aside className='flex h-full w-[340px] shrink-0 flex-col border-l-2 border-editorial-ink bg-white'>
				<div className='flex items-center justify-between border-b-2 border-editorial-ink px-3 py-3'>
					<div className='flex items-center gap-2'>
						<span className='flex h-6 w-6 items-center justify-center rounded-none border-2 border-editorial-ink bg-white'>
							<Icon icon='Setting07' className='text-sm' />
						</span>
						<span className='font-serif font-black italic text-[13px] text-editorial-ink'>
							Inspector
						</span>
					</div>
					<button
						type='button'
						onClick={toggleRight}
						title='Hide inspector'
						aria-label='Hide inspector'
						className='inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-900/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white'>
						<Icon icon='LayoutRight' className='text-[15px]' />
					</button>
				</div>
				<div className='flex flex-1 flex-col items-center justify-center px-6 text-center'>
					<div className='mb-3 flex h-14 w-14 items-center justify-center rounded-none border-2 border-editorial-ink bg-editorial-bg text-editorial-ink/40'>
						<Icon icon='Cursor01' className='text-xl' />
					</div>
					<div className='font-serif font-black italic text-sm text-editorial-ink'>
						No node selected
					</div>
					<div className='mt-1 font-mono text-[10px] tracking-tighter text-editorial-ink/60'>
						Click a node on the canvas to configure its settings.
					</div>
				</div>
			</aside>
		);
	}

	const hue = HUE_TO_CLASSES[def.color] ?? HUE_TO_CLASSES.zinc;
	const status = node.data.status ?? 'idle';
	const statusMeta = STATUS_BADGE[status] ?? STATUS_BADGE.idle;

	return (
		<aside className='flex h-full w-[340px] shrink-0 flex-col border-l-2 border-editorial-ink bg-white'>
			{/* Header */}
			<div className='relative border-b-2 border-editorial-ink'>
				<div className={`absolute inset-0 opacity-60 ${hue.bg}`} aria-hidden='true' />
				<div className='relative px-3 pb-2 pt-3'>
					<div className='flex items-start justify-between gap-2'>
						<div className='flex min-w-0 flex-1 items-center gap-2.5'>
							<span
								className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-white text-lg leading-none shadow-editorial-soft`}>
								{def.icon}
							</span>
							<div className='min-w-0 flex-1'>
								<input
									className='w-full truncate bg-transparent text-sm font-serif font-black italic text-editorial-ink outline-none placeholder:text-editorial-ink/40'
									value={node.data.label}
									placeholder={def.label}
									onChange={(e) => renameNode(node.id, e.target.value)}
								/>
								<div className='mt-0.5 flex items-center gap-1.5 text-[10px]'>
									<span className='font-mono tracking-tighter text-editorial-ink/60'>{def.key}</span>
									<span className='text-editorial-ink/30'>•</span>
									<span
										className={`rounded-none px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusMeta.className}`}>
										{statusMeta.label}
									</span>
								</div>
							</div>
						</div>
						<button
							type='button'
							onClick={toggleRight}
							title='Hide inspector'
							aria-label='Hide inspector'
							className='shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-none border-2 border-transparent text-editorial-ink/60 hover:border-editorial-ink hover:text-editorial-ink'>
							<Icon icon='LayoutRight' className='text-[15px]' />
						</button>
					</div>
					<div className='mt-2 line-clamp-2 font-mono text-[10px] tracking-tighter text-editorial-ink/60'>
						{def.description}
					</div>
				</div>

				{/* Segmented tabs */}
				<div className='relative px-3 pb-3'>
					<div className='flex gap-px rounded-none border-2 border-editorial-ink bg-editorial-ink p-px'>
						{TABS.map((t) => (
							<button
								key={t.key}
								type='button'
								onClick={() => setTab(t.key)}
								className={[
									'inline-flex flex-1 items-center justify-center gap-1.5 rounded-none px-2 py-1.5 text-[10px] font-black uppercase tracking-widest transition',
									tab === t.key
										? 'bg-white text-editorial-ink'
										: 'text-editorial-ink/60 hover:text-editorial-ink',
								].join(' ')}>
								<Icon icon={t.icon} className='text-[13px]' />
								{t.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Body */}
			<div className='flex-1 overflow-y-auto px-3 py-3'>
				{tab === 'settings' && (
					<div className='space-y-4'>
						{def.fields.length === 0 && (
							<div className='rounded-none border-2 border-dashed border-editorial-ink/30 p-6 text-center font-mono text-[10px] tracking-tighter text-editorial-ink/50'>
								This node has no configurable settings.
							</div>
						)}
						{def.fields.map((f) => (
							<div key={f.key}>
								<label className='mb-1.5 flex items-center justify-between gap-1 text-[10px] font-black uppercase tracking-widest text-editorial-ink/70'>
									<span className='flex items-center gap-1'>
										{f.label}
										{f.required && <span className='text-rose-500'>*</span>}
									</span>
									{f.kind === 'credential' && (
										<span className='inline-flex items-center gap-1 text-[9px] font-medium text-editorial-ink/50'>
											<Icon icon='Key01' className='text-xs' />
											Credential
										</span>
									)}
								</label>
								<FieldRenderer
									field={f}
									value={node.data.values?.[f.key]}
									onChange={(v) => updateNodeValue(node.id, f.key, v)}
									onInsertVar={(token) => {
										const cur = (node.data.values?.[f.key] as string) ?? '';
										updateNodeValue(node.id, f.key, cur + token);
									}}
									variables={variables}
								/>
								{f.help && (
									<div className='mt-1 font-mono text-[9px] tracking-tighter text-editorial-ink/50'>{f.help}</div>
								)}
							</div>
						))}
					</div>
				)}

				{tab === 'output' && (
					<div className='space-y-2'>
						<div
							className={`inline-flex items-center gap-1.5 rounded-none border-2 px-2 py-1 text-[10px] font-black uppercase tracking-widest ${statusMeta.className}`}>
							<span className='h-1.5 w-1.5 rounded-none bg-current' />
							{statusMeta.label}
							{node.data.durationMs != null && status === 'success' && (
								<span className='font-mono tracking-tighter opacity-70'>
									· {node.data.durationMs}ms
								</span>
							)}
						</div>
						<pre className='max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-none border-2 border-editorial-ink bg-editorial-bg p-3 font-mono text-[10px] leading-relaxed tracking-tighter text-editorial-ink/80'>
							{status === 'success'
								? `// mock output for ${node.data.label}\n{\n  "ok": true,\n  "duration": ${node.data.durationMs ?? 0}\n}`
								: status === 'error'
									? `// error\n${node.data.error ?? 'Unknown error'}`
									: '// Run the workflow to see output.'}
						</pre>
					</div>
				)}

				{tab === 'docs' && (
					<div className='space-y-4'>
						<div>
							<div className='mb-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60'>
								Identity
							</div>
							<dl className='space-y-1.5 rounded-none border-2 border-editorial-ink bg-editorial-bg p-2.5'>
								<div className='flex items-center justify-between gap-2'>
									<dt className='font-mono text-[9px] tracking-tighter text-editorial-ink/60'>Type</dt>
									<dd className='font-mono tracking-tighter text-editorial-ink'>
										{def.key}
									</dd>
								</div>
								<div className='flex items-center justify-between gap-2'>
									<dt className='font-mono text-[9px] tracking-tighter text-editorial-ink/60'>Category</dt>
									<dd className='font-mono capitalize tracking-tighter text-editorial-ink'>
										{def.category}
									</dd>
								</div>
								<div className='flex items-center justify-between gap-2'>
									<dt className='font-mono text-[9px] tracking-tighter text-editorial-ink/60'>Node ID</dt>
									<dd className='font-mono text-[9px] tracking-tighter text-editorial-ink/50'>
										{node.id}
									</dd>
								</div>
							</dl>
						</div>

						<div>
							<div className='mb-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60'>
								Inputs
							</div>
							<div className='flex flex-wrap gap-1.5'>
								{def.inputs.length === 0 ? (
									<span className='font-mono text-[10px] text-editorial-ink/40'>None</span>
								) : (
									def.inputs.map((p) => (
										<PortPill key={p.id} name={p.name} type={p.type} />
									))
								)}
							</div>
						</div>

						<div>
							<div className='mb-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60'>
								Outputs
							</div>
							<div className='flex flex-wrap gap-1.5'>
								{def.outputs.length === 0 ? (
									<span className='font-mono text-[10px] text-editorial-ink/40'>None</span>
								) : (
									def.outputs.map((p) => (
										<PortPill key={p.id} name={p.name} type={p.type} />
									))
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Footer actions */}
			<div className='flex gap-1 border-t-2 border-editorial-ink p-2'>
				<button
					type='button'
					onClick={duplicateSelected}
					className='inline-flex flex-1 items-center justify-center gap-1.5 rounded-none border-2 border-editorial-ink bg-white px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink transition hover:bg-editorial-bg shadow-editorial-soft'>
					<Icon icon='Copy01' className='text-sm' />
					Duplicate
				</button>
				<button
					type='button'
					onClick={deleteSelected}
					className='inline-flex flex-1 items-center justify-center gap-1.5 rounded-none border-2 border-rose-500 bg-white px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 transition hover:bg-rose-50 shadow-editorial-soft'>
					<Icon icon='Delete02' className='text-sm' />
					Delete
				</button>
			</div>
		</aside>
	);
};

export default Inspector;
