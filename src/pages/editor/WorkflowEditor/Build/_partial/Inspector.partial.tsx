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
		'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-[#ff6d5a] focus:ring-2 focus:ring-[#ff6d5a]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-[#ff6d5a]';

	switch (field.kind) {
		case 'text':
		case 'credential':
		case 'model':
			return field.options?.length ? (
				<select
					className={common}
					value={(value as string) ?? ''}
					onChange={(e) => onChange(e.target.value)}>
					<option value=''>Select an option...</option>
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
					className={`inline-flex h-6 w-11 items-center rounded-full transition ${
						on
							? 'bg-[#ff6d5a]'
							: 'bg-zinc-300 dark:bg-zinc-700'
					}`}>
					<span
						className={`h-5 w-5 transform rounded-full bg-white shadow transition ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
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
					<option value=''>Select an option...</option>
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
						className={`${common} font-mono text-[13px] leading-relaxed`}
						placeholder={field.placeholder}
						value={(value as string) ?? ''}
						onChange={(e) => onChange(e.target.value)}
					/>
					{field.supportsVariables && variables.length > 0 && (
						<div className='mt-2 flex flex-wrap gap-1'>
							{variables.slice(0, 8).map((v) => (
								<button
									key={`${v.nodeId}:${v.outputId}`}
									onClick={() => onInsertVar(v.token)}
									className='rounded-md border border-[#ff6d5a]/30 bg-[#ff6d5a]/10 px-2 py-0.5 font-mono text-[10px] text-[#c9513f] transition hover:bg-[#ff6d5a]/20 dark:text-[#ff9183]'>
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
				<div className='space-y-1.5'>
					{rows.map((r, i) => (
						<div key={i} className='flex gap-1.5'>
							<input
								className={common}
								placeholder='Name'
								value={r.k}
								onChange={(e) => {
									const next = [...rows];
									next[i] = { ...r, k: e.target.value };
									onChange(next);
								}}
							/>
							<input
								className={common}
								placeholder='Value'
								value={r.v}
								onChange={(e) => {
									const next = [...rows];
									next[i] = { ...r, v: e.target.value };
									onChange(next);
								}}
							/>
							<button
								className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10'
								onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>
								<Icon icon='Cancel01' className='text-sm' />
							</button>
						</div>
					))}
					<button
						className='inline-flex items-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-[#ff6d5a] hover:text-[#ff6d5a] dark:border-zinc-700'
						onClick={() => onChange([...rows, { k: '', v: '' }])}>
						<Icon icon='PlusSign' className='text-sm' />
						Add parameter
					</button>
				</div>
			);
		}
		case 'multiselect': {
			const arr = (value as string[]) ?? [];
			return (
				<div className='flex flex-wrap gap-1.5'>
					{field.options?.map((o) => {
						const on = arr.includes(o.value);
						return (
							<button
								key={o.value}
								onClick={() =>
									onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])
								}
								className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
									on
										? 'border-[#ff6d5a] bg-[#ff6d5a]/10 text-[#c9513f] dark:text-[#ff9183]'
										: 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400'
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

const TABS: Array<{ key: 'settings' | 'output' | 'data' | 'docs'; label: string; icon: TIcons }> = [
	{ key: 'settings', label: 'Parameters', icon: 'Setting07' },
	{ key: 'output', label: 'Output', icon: 'Code' },
	{ key: 'data', label: 'Data', icon: 'Database01' },
	{ key: 'docs', label: 'Docs', icon: 'BookOpen01' },
];

const PortPill = ({ name, type }: { name: string; type: string }) => (
	<span className='inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] dark:border-zinc-800 dark:bg-zinc-900'>
		<span
			className='h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900'
			style={{ backgroundColor: PORT_TYPE_COLOR[type] ?? PORT_TYPE_COLOR.any }}
		/>
		<span className='font-medium text-zinc-700 dark:text-zinc-200'>{name}</span>
		<span className='font-mono text-[10px] text-zinc-400'>{type}</span>
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

	const [tab, setTab] = useState<'settings' | 'output' | 'data' | 'docs'>('settings');
	const node = useMemo(
		() => nodes.find((n) => n.id === selectedNodeId) ?? null,
		[nodes, selectedNodeId],
	);
	const def = node ? NODE_CATALOG_MAP[node.data.defKey] : null;
	const variables = useMemo(
		() => (node ? collectUpstreamVariables(node.id, nodes, edges) : []),
		[node, nodes, edges],
	);

	if (!rightPanelOpen || !node || !def) return null;

	const hue = HUE_TO_CLASSES[def.color] ?? HUE_TO_CLASSES.zinc;
	const status = node.data.status ?? 'idle';
	const statusMeta = STATUS_BADGE[status] ?? STATUS_BADGE.idle;
	const incomingCount = edges.filter((e) => e.target === node.id).length;
	const outgoingCount = edges.filter((e) => e.source === node.id).length;
	const requiredCount = def.fields.filter((f) => f.required).length;

	return (
		<div className='flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] dark:border-zinc-800 dark:bg-zinc-950'>
			{/* Header */}
			<div className='relative border-b border-zinc-200 dark:border-zinc-800'>
				<div
					className={`pointer-events-none absolute inset-x-0 top-0 h-20 opacity-40 ${hue.bg}`}
					aria-hidden='true'
				/>
				<div className='relative px-5 pt-4 pb-3'>
					<div className='flex items-start justify-between gap-3'>
						<div className='flex min-w-0 flex-1 items-center gap-3'>
							<span
								className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xl leading-none shadow-sm dark:border-zinc-700 dark:bg-zinc-900'>
								{def.icon}
							</span>
							<div className='min-w-0 flex-1'>
								<input
									className='w-full truncate bg-transparent text-[15px] font-semibold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50'
									value={node.data.label}
									placeholder={def.label}
									onChange={(e) => renameNode(node.id, e.target.value)}
								/>
								<div className='mt-0.5 flex items-center gap-2 text-[11px]'>
									<span className='font-mono text-zinc-500 dark:text-zinc-400'>
										{def.key}
									</span>
									<span className='text-zinc-300 dark:text-zinc-700'>•</span>
									<span
										className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusMeta.className}`}>
										<span className='h-1.5 w-1.5 rounded-full bg-current' />
										{statusMeta.label}
									</span>
								</div>
							</div>
						</div>
						<button
							type='button'
							onClick={toggleRight}
							title='Close inspector'
							aria-label='Close inspector'
							className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'>
							<Icon icon='Cancel01' className='text-[16px]' />
						</button>
					</div>
					<p className='mt-2 line-clamp-2 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400'>
						{def.description}
					</p>
					<div className='mt-3 grid grid-cols-2 gap-2'>
						<div className='rounded-md border border-zinc-200 bg-zinc-50/60 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/50'>
							<div className='text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500'>
								Node ID
							</div>
							<div className='truncate font-mono text-[11px] text-zinc-700 dark:text-zinc-300'>
								{node.id}
							</div>
						</div>
						<div className='rounded-md border border-zinc-200 bg-zinc-50/60 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/50'>
							<div className='text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500'>
								Connections
							</div>
							<div className='font-mono text-[11px] text-zinc-700 dark:text-zinc-300'>
								{incomingCount} in · {outgoingCount} out
							</div>
						</div>
					</div>
				</div>

				<div className='relative flex items-end gap-5 px-5'>
					{TABS.map((t) => {
						const active = tab === t.key;
						return (
							<button
								key={t.key}
								type='button'
								onClick={() => setTab(t.key)}
								className={[
									'relative inline-flex items-center gap-1.5 pb-2.5 text-[12px] font-medium transition',
									active
										? 'text-zinc-900 dark:text-zinc-50'
										: 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
								].join(' ')}>
								<Icon icon={t.icon} className='text-[14px]' />
								{t.label}
								<span
									className={[
										'absolute -bottom-px left-0 right-0 h-0.5 rounded-full transition',
										active ? 'bg-[#ff6d5a]' : 'bg-transparent',
									].join(' ')}
								/>
							</button>
						);
					})}
				</div>
			</div>

			<div className='flex-1 overflow-y-auto px-5 py-4'>
				<div className='mb-4 flex gap-2.5 rounded-lg border border-[#ff6d5a]/25 bg-gradient-to-br from-[#ff6d5a]/[0.08] to-[#ff6d5a]/[0.02] p-3'>
					<div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#ff6d5a]/15 text-[#c9513f] dark:text-[#ff9183]'>
						<Icon icon='Sparkles' className='text-sm' />
					</div>
					<div className='min-w-0'>
						<div className='text-[11px] font-semibold text-zinc-800 dark:text-zinc-100'>
							AI Recommendation
						</div>
						<div className='mt-0.5 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400'>
							Detected {incomingCount > 0 ? 'connected' : 'standalone'} node context. Keep prompts concise and return typed output for downstream reliability.
						</div>
					</div>
				</div>

				{tab === 'settings' && (
					<div className='space-y-4'>
						<div className='grid grid-cols-3 gap-2'>
							<div className='rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900'>
								<div className='text-[10px] font-medium uppercase tracking-wide text-zinc-500'>
									Fields
								</div>
								<div className='mt-0.5 font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100'>
									{def.fields.length}
								</div>
							</div>
							<div className='rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900'>
								<div className='text-[10px] font-medium uppercase tracking-wide text-zinc-500'>
									Required
								</div>
								<div className='mt-0.5 font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100'>
									{requiredCount}
								</div>
							</div>
							<div className='rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900'>
								<div className='text-[10px] font-medium uppercase tracking-wide text-zinc-500'>
									Variables
								</div>
								<div className='mt-0.5 font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100'>
									{variables.length}
								</div>
							</div>
						</div>
						{def.fields.length === 0 && (
							<div className='rounded-lg border border-dashed border-zinc-300 p-8 text-center text-[12px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'>
								This node has no configurable parameters.
							</div>
						)}
						{def.fields.map((f) => (
							<div key={f.key}>
								<label className='mb-1.5 flex items-center justify-between gap-1 text-[12px] font-medium text-zinc-700 dark:text-zinc-300'>
									<span className='flex items-center gap-1'>
										{f.label}
										{f.required && <span className='text-[#ff6d5a]'>*</span>}
									</span>
									{f.kind === 'credential' && (
										<span className='inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500'>
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
										const current = ((node.data.values?.[f.key] as string | undefined) ?? '').toString();
										updateNodeValue(node.id, f.key, `${current}${token}`);
									}}
									variables={variables}
								/>
								{f.help && (
									<p className='mt-1.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400'>
										{f.help}
									</p>
								)}
							</div>
						))}
					</div>
				)}

				{tab === 'output' && (
					<div className='space-y-3'>
						<div
							className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusMeta.className}`}>
							<span className='h-1.5 w-1.5 rounded-full bg-current' />
							{statusMeta.label}
							{node.data.durationMs != null && status === 'success' && (
								<span className='font-mono opacity-70'>
									· {node.data.durationMs}ms
								</span>
							)}
						</div>
						<pre className='max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
							{status === 'success'
								? `// mock output for ${node.data.label}\n{\n  "ok": true,\n  "duration": ${node.data.durationMs ?? 0}\n}`
								: status === 'error'
									? `// error\n${node.data.error ?? 'Unknown error'}`
									: '// Run the workflow to see output.'}
						</pre>
					</div>
				)}

				{tab === 'data' && (
					<div className='space-y-4'>
						<div>
							<div className='mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500'>
								Runtime Values
							</div>
							<pre className='max-h-[32vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
								{JSON.stringify(node.data.values ?? {}, null, 2)}
							</pre>
						</div>
						<div>
							<div className='mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500'>
								Upstream Variables
							</div>
							{variables.length === 0 ? (
								<div className='rounded-lg border border-dashed border-zinc-300 p-5 text-center text-[11px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'>
									No upstream variables available yet.
								</div>
							) : (
								<div className='grid grid-cols-1 gap-1.5'>
									{variables.map((v) => (
										<button
											key={`${v.nodeId}:${v.outputId}`}
											type='button'
											onClick={() => {
												void navigator.clipboard?.writeText(v.token);
											}}
											className='flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-left transition hover:border-[#ff6d5a]/50 hover:bg-[#ff6d5a]/[0.04] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50'>
											<div className='min-w-0'>
												<div className='truncate font-mono text-[11px] text-zinc-800 dark:text-zinc-200'>
													{v.token}
												</div>
												<div className='truncate text-[10px] text-zinc-500'>
													{v.nodeLabel} · {v.outputName}
												</div>
											</div>
											<Icon icon='Copy01' className='shrink-0 text-xs text-zinc-400' />
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{tab === 'docs' && (
					<div className='space-y-4'>
						<div>
							<div className='mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500'>
								Identity
							</div>
							<dl className='divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white text-[12px] dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900'>
								<div className='flex items-center justify-between gap-2 px-3 py-2'>
									<dt className='text-zinc-500'>Type</dt>
									<dd className='font-mono text-zinc-800 dark:text-zinc-200'>
										{def.key}
									</dd>
								</div>
								<div className='flex items-center justify-between gap-2 px-3 py-2'>
									<dt className='text-zinc-500'>Category</dt>
									<dd className='font-mono capitalize text-zinc-800 dark:text-zinc-200'>
										{def.category}
									</dd>
								</div>
								<div className='flex items-center justify-between gap-2 px-3 py-2'>
									<dt className='text-zinc-500'>Node ID</dt>
									<dd className='truncate font-mono text-[11px] text-zinc-500'>
										{node.id}
									</dd>
								</div>
							</dl>
						</div>

						<div>
							<div className='mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500'>
								Inputs
							</div>
							<div className='flex flex-wrap gap-1.5'>
								{def.inputs.length === 0 ? (
									<span className='text-[12px] text-zinc-400'>None</span>
								) : (
									def.inputs.map((p) => (
										<PortPill key={p.id} name={p.name} type={p.type} />
									))
								)}
							</div>
						</div>

						<div>
							<div className='mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500'>
								Outputs
							</div>
							<div className='flex flex-wrap gap-1.5'>
								{def.outputs.length === 0 ? (
									<span className='text-[12px] text-zinc-400'>None</span>
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
			<div className='flex gap-2 border-t border-zinc-200 bg-zinc-50/60 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40'>
				<button
					type='button'
					onClick={duplicateSelected}
					className='inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'>
					<Icon icon='Copy01' className='text-sm' />
					Duplicate
				</button>
				<button
					type='button'
					onClick={deleteSelected}
					className='inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 dark:border-rose-500/30 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-500/10'>
					<Icon icon='Delete02' className='text-sm' />
					Delete
				</button>
				<button
					type='button'
					className='inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-md bg-[#ff6d5a] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#ef5c49] active:bg-[#e04f3c]'>
					<Icon icon='PlayCircle' className='text-sm' />
					Execute node
				</button>
			</div>
		</div>
	);
};

export default Inspector;
