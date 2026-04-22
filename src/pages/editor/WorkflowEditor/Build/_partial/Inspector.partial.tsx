import { useMemo, useState } from 'react';
import { useEditor } from '../_context/EditorStore.context';
import { NODE_CATALOG_MAP } from '../_helper/nodeCatalog.constants';
import { HUE_TO_CLASSES } from '../_helper/builder.constants';
import { collectUpstreamVariables } from '../_helper/variables.helper';
import type { TNodeField } from '../../_types/editor.type';

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
		'w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950';

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
		case 'toggle':
			return (
				<label className='inline-flex cursor-pointer items-center gap-2'>
					<input
						type='checkbox'
						checked={Boolean(value)}
						onChange={(e) => onChange(e.target.checked)}
					/>
					<span className='text-xs text-zinc-500'>Enabled</span>
				</label>
			);
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

const Inspector = () => {
	const rightPanelOpen = useEditor((s) => s.rightPanelOpen);
	const selectedNodeId = useEditor((s) => s.selectedNodeId);
	const nodes = useEditor((s) => s.nodes);
	const edges = useEditor((s) => s.edges);
	const updateNodeValue = useEditor((s) => s.updateNodeValue);
	const renameNode = useEditor((s) => s.renameNode);
	const deleteSelected = useEditor((s) => s.deleteSelected);
	const duplicateSelected = useEditor((s) => s.duplicateSelected);

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
			<aside className='flex h-full w-80 shrink-0 flex-col border-l border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500'>
					Inspector
				</div>
				<div className='mt-12 text-center text-xs text-zinc-400'>
					Select a node to edit its settings.
				</div>
			</aside>
		);
	}

	const hue = HUE_TO_CLASSES[def.color] ?? HUE_TO_CLASSES.zinc;

	return (
		<aside className='flex h-full w-80 shrink-0 flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
			<div className={`border-b border-zinc-200 p-3 dark:border-zinc-800 ${hue.bg}`}>
				<div className='flex items-center gap-2'>
					<span className='text-lg'>{def.icon}</span>
					<input
						className={`flex-1 bg-transparent text-sm font-semibold outline-none ${hue.text}`}
						value={node.data.label}
						onChange={(e) => renameNode(node.id, e.target.value)}
					/>
				</div>
				<div className='mt-1 text-[11px] text-zinc-500'>{def.description}</div>

				<div className='mt-3 flex gap-1 border-b-0 text-xs'>
					{(['settings', 'output', 'docs'] as const).map((t) => (
						<button
							key={t}
							onClick={() => setTab(t)}
							className={`rounded px-2 py-1 capitalize ${
								tab === t
									? 'bg-white font-medium text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
									: 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
							}`}>
							{t}
						</button>
					))}
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-3'>
				{tab === 'settings' && (
					<div className='space-y-3'>
						{def.fields.length === 0 && (
							<div className='text-xs text-zinc-400'>No settings for this node.</div>
						)}
						{def.fields.map((f) => (
							<div key={f.key}>
								<label className='mb-1 flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300'>
									{f.label}
									{f.required && <span className='text-red-500'>*</span>}
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
									<div className='mt-1 text-[10px] text-zinc-400'>{f.help}</div>
								)}
							</div>
						))}
					</div>
				)}

				{tab === 'output' && (
					<pre className='whitespace-pre-wrap rounded bg-zinc-100 p-2 text-[11px] text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300'>
{node.data.status === 'success'
	? `// mock output for ${node.data.label}\n{ "ok": true, "duration": ${node.data.durationMs ?? 0} }`
	: node.data.status === 'error'
	? `// error\n${node.data.error ?? 'Unknown'}`
	: '// run the workflow to see output'}
					</pre>
				)}

				{tab === 'docs' && (
					<div className='space-y-2 text-xs text-zinc-500'>
						<div><b>Type:</b> {def.key}</div>
						<div><b>Category:</b> {def.category}</div>
						<div><b>Inputs:</b> {def.inputs.map((p) => `${p.name}:${p.type}`).join(', ') || '—'}</div>
						<div><b>Outputs:</b> {def.outputs.map((p) => `${p.name}:${p.type}`).join(', ') || '—'}</div>
					</div>
				)}
			</div>

			<div className='flex border-t border-zinc-200 p-2 dark:border-zinc-800'>
				<button
					onClick={duplicateSelected}
					className='flex-1 rounded px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'>
					Duplicate
				</button>
				<button
					onClick={deleteSelected}
					className='flex-1 rounded px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10'>
					Delete
				</button>
			</div>
		</aside>
	);
};

export default Inspector;
