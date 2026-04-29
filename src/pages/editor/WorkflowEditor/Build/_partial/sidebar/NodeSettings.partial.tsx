import { useMemo, useState } from 'react';
import Icon from '@/components/icon/Icon';
import { useEditor } from '../../_context/EditorStoreProvider.context';
import { NODE_CATALOG_MAP } from '../../_helper/nodeCatalog.constants';
import { HUE_TO_CLASSES, PORT_TYPE_COLOR, STATUS_BADGE } from '../../_helper/builder.constants';
import { collectUpstreamVariables } from '../../_helper/variables.helper';
import type { TNodeField } from '../../../_types/editor.type';
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
		'w-full rounded-none border-2 border-editorial-ink bg-white px-3 py-2 text-sm text-editorial-ink outline-none transition placeholder:text-editorial-ink/40 focus:bg-editorial-bg focus:ring-2 focus:ring-editorial-ink/20';

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
					className={`inline-flex h-6 w-11 items-center rounded-none border-2 border-editorial-ink transition ${
						on ? 'bg-editorial-ink' : 'bg-editorial-bg'
					}`}>
					<span
						className={`h-4 w-4 transform rounded-none border border-editorial-ink bg-white shadow transition ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
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
						className={`${common} font-mono text-[12px] leading-relaxed tracking-tighter`}
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
									className='rounded-none border border-editorial-ink bg-white px-1.5 py-0.5 font-mono text-[10px] tracking-tighter text-editorial-ink hover:bg-editorial-bg'>
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
								className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-white text-editorial-ink/60 transition hover:bg-rose-100 hover:text-rose-600'
								onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>
								<Icon icon='Cancel01' className='text-sm' />
							</button>
						</div>
					))}
					<button
						className='inline-flex items-center gap-1.5 rounded-none border-2 border-dashed border-editorial-ink/40 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60 transition hover:border-editorial-ink hover:bg-editorial-bg hover:text-editorial-ink'
						onClick={() => onChange([...rows, { k: '', v: '' }])}>
						<Icon icon='PlusSign' className='text-sm' />
						Add row
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
								className={`rounded-none border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition ${
									on
										? 'border-editorial-ink bg-editorial-ink text-white'
										: 'border-editorial-ink/30 bg-white text-editorial-ink/70 hover:border-editorial-ink hover:bg-editorial-bg'
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
	<span className='inline-flex items-center gap-1.5 rounded-none border-2 border-editorial-ink bg-white px-2 py-1 text-[10px] shadow-editorial-soft'>
		<span
			className='h-2 w-2 rounded-none border border-editorial-ink'
			style={{ backgroundColor: PORT_TYPE_COLOR[type] ?? PORT_TYPE_COLOR.any }}
		/>
		<span className='font-serif font-black italic text-editorial-ink'>{name}</span>
		<span className='text-editorial-ink/30'>·</span>
		<span className='font-mono text-[9px] tracking-tighter text-editorial-ink/60'>{type}</span>
	</span>
);

const NodeSettings = () => {
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
		<div className='relative flex h-full min-h-0 w-full flex-col overflow-hidden border-2 border-editorial-ink bg-white shadow-[12px_12px_0px_rgba(26,26,26,0.18)]'>
			{/* Accent strip (node hue) */}
			<div className={`h-1.5 w-full border-b-2 border-editorial-ink ${hue.bg.replace('/10', '/70')}`} aria-hidden='true' />

			{/* Header */}
			<div className='relative border-b-2 border-editorial-ink'>
				<div className={`pointer-events-none absolute inset-0 opacity-50 ${hue.bg}`} aria-hidden='true' />
				<div className='relative px-4 pt-4 pb-3'>
					<div className='flex items-start justify-between gap-3'>
						<div className='flex min-w-0 flex-1 items-center gap-3'>
							<span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-white text-xl leading-none shadow-[3px_3px_0px_rgba(26,26,26,0.22)]'>
								{def.icon}
							</span>
							<div className='min-w-0 flex-1'>
								<input
									className='w-full truncate bg-transparent font-serif text-[17px] font-black italic tracking-tight text-editorial-ink outline-none placeholder:text-editorial-ink/40'
									value={node.data.label}
									placeholder={def.label}
									onChange={(e) => renameNode(node.id, e.target.value)}
								/>
								<div className='mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]'>
									<span className='font-mono tracking-tighter text-editorial-ink/60'>
										{def.key}
									</span>
									<span className='text-editorial-ink/30'>•</span>
									<span
										className={`inline-flex items-center gap-1 rounded-none border border-editorial-ink/30 bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${statusMeta.className}`}>
										<span className='h-1.5 w-1.5 rounded-none bg-current' />
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
							className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-white text-editorial-ink transition hover:bg-editorial-ink hover:text-white'>
							<Icon icon='Cancel01' className='text-sm' />
						</button>
					</div>
					<p className='mt-2 line-clamp-2 font-mono text-[10px] leading-relaxed tracking-tighter text-editorial-ink/70'>
						{def.description}
					</p>
					<div className='mt-3 grid grid-cols-2 gap-1.5'>
						<div className='border-2 border-editorial-ink bg-white px-2 py-1.5 shadow-editorial-soft'>
							<div className='text-[9px] font-black uppercase tracking-widest text-editorial-ink/50'>
								Node ID
							</div>
							<div className='truncate font-mono text-[10px] tracking-tighter text-editorial-ink'>
								{node.id}
							</div>
						</div>
						<div className='border-2 border-editorial-ink bg-white px-2 py-1.5 shadow-editorial-soft'>
							<div className='text-[9px] font-black uppercase tracking-widest text-editorial-ink/50'>
								Connections
							</div>
							<div className='font-mono text-[10px] tracking-tighter text-editorial-ink'>
								IN {incomingCount} · OUT {outgoingCount}
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className='relative flex gap-px border-t-2 border-editorial-ink bg-editorial-ink px-px'>
					{TABS.map((t) => {
						const active = tab === t.key;
						return (
							<button
								key={t.key}
								type='button'
								onClick={() => setTab(t.key)}
								className={[
									'relative inline-flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-black uppercase tracking-widest transition',
									active
										? 'bg-white text-editorial-ink'
										: 'bg-editorial-ink text-white/70 hover:text-white',
								].join(' ')}>
								<Icon icon={t.icon} className='text-[13px]' />
								{t.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Body */}
			<div className='flex-1 overflow-y-auto px-4 py-4'>
				<div className='mb-4 flex gap-2.5 border-2 border-editorial-ink bg-editorial-bg p-3 shadow-editorial-soft'>
					<div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-white text-editorial-ink'>
						<Icon icon='Sparkles' className='text-sm' />
					</div>
					<div className='min-w-0'>
						<div className='text-[10px] font-black uppercase tracking-widest text-editorial-ink'>
							AI Recommendation
						</div>
						<div className='mt-0.5 font-mono text-[10px] leading-relaxed tracking-tighter text-editorial-ink/70'>
							Detected {incomingCount > 0 ? 'connected' : 'standalone'} node context. Keep prompts concise and return typed output for downstream reliability.
						</div>
					</div>
				</div>

				{tab === 'settings' && (
					<div className='space-y-4'>
						<div className='grid grid-cols-3 gap-1.5'>
							{([
								['Fields', def.fields.length],
								['Required', requiredCount],
								['Variables', variables.length],
							] as const).map(([label, n]) => (
								<div
									key={label}
									className='border-2 border-editorial-ink bg-white px-2 py-2 text-center shadow-editorial-soft'>
									<div className='text-[9px] font-black uppercase tracking-widest text-editorial-ink/50'>
										{label}
									</div>
									<div className='mt-0.5 font-serif text-lg font-black italic text-editorial-ink'>
										{n}
									</div>
								</div>
							))}
						</div>
						{def.fields.length === 0 && (
							<div className='border-2 border-dashed border-editorial-ink/30 p-6 text-center font-mono text-[10px] tracking-tighter text-editorial-ink/50'>
								This node has no configurable parameters.
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
										<span className='inline-flex items-center gap-1 border border-editorial-ink/40 bg-white px-1.5 py-0.5 text-[9px] font-medium text-editorial-ink/60'>
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
									<p className='mt-1.5 font-mono text-[10px] leading-relaxed tracking-tighter text-editorial-ink/60'>
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
							className={`inline-flex items-center gap-1.5 rounded-none border-2 border-editorial-ink px-2 py-1 text-[10px] font-black uppercase tracking-widest ${statusMeta.className}`}>
							<span className='h-1.5 w-1.5 rounded-none bg-current' />
							{statusMeta.label}
							{node.data.durationMs != null && status === 'success' && (
								<span className='font-mono tracking-tighter opacity-70'>
									· {node.data.durationMs}ms
								</span>
							)}
						</div>
						<pre className='max-h-[60vh] overflow-auto whitespace-pre-wrap break-words border-2 border-editorial-ink bg-editorial-bg p-3 font-mono text-[10px] leading-relaxed tracking-tighter text-editorial-ink/80 shadow-editorial-soft'>
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
							<div className='mb-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60'>
								Runtime Values
							</div>
							<pre className='max-h-[32vh] overflow-auto whitespace-pre-wrap break-words border-2 border-editorial-ink bg-editorial-bg p-3 font-mono text-[10px] leading-relaxed tracking-tighter text-editorial-ink/80 shadow-editorial-soft'>
								{JSON.stringify(node.data.values ?? {}, null, 2)}
							</pre>
						</div>
						<div>
							<div className='mb-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60'>
								Upstream Variables
							</div>
							{variables.length === 0 ? (
								<div className='border-2 border-dashed border-editorial-ink/30 p-4 text-center font-mono text-[10px] tracking-tighter text-editorial-ink/50'>
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
											className='flex items-center justify-between gap-2 border-2 border-editorial-ink bg-white px-2 py-1.5 text-left shadow-editorial-soft transition hover:bg-editorial-bg'>
											<div className='min-w-0'>
												<div className='truncate font-mono text-[10px] tracking-tighter text-editorial-ink'>
													{v.token}
												</div>
												<div className='truncate font-mono text-[9px] tracking-tighter text-editorial-ink/50'>
													{v.nodeLabel} · {v.outputName}
												</div>
											</div>
											<Icon icon='Copy01' className='shrink-0 text-xs text-editorial-ink/60' />
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
							<div className='mb-1.5 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60'>
								Identity
							</div>
							<dl className='border-2 border-editorial-ink bg-editorial-bg text-[10px] shadow-editorial-soft'>
								<div className='flex items-center justify-between gap-2 border-b border-editorial-ink/30 px-3 py-2'>
									<dt className='font-mono tracking-tighter text-editorial-ink/60'>Type</dt>
									<dd className='font-mono tracking-tighter text-editorial-ink'>{def.key}</dd>
								</div>
								<div className='flex items-center justify-between gap-2 border-b border-editorial-ink/30 px-3 py-2'>
									<dt className='font-mono tracking-tighter text-editorial-ink/60'>Category</dt>
									<dd className='font-mono capitalize tracking-tighter text-editorial-ink'>{def.category}</dd>
								</div>
								<div className='flex items-center justify-between gap-2 px-3 py-2'>
									<dt className='font-mono tracking-tighter text-editorial-ink/60'>Node ID</dt>
									<dd className='truncate font-mono tracking-tighter text-editorial-ink/50'>{node.id}</dd>
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
			<div className='flex gap-2 border-t-2 border-editorial-ink bg-editorial-bg px-3 py-3'>
				<button
					type='button'
					onClick={duplicateSelected}
					className='inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-editorial-ink bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-editorial-ink shadow-[3px_3px_0px_rgba(26,26,26,0.22)] transition hover:bg-editorial-bg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'>
					<Icon icon='Copy01' className='text-sm' />
					Duplicate
				</button>
				<button
					type='button'
					onClick={deleteSelected}
					className='inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-rose-500 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-[3px_3px_0px_rgba(244,63,94,0.28)] transition hover:bg-rose-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'>
					<Icon icon='Delete02' className='text-sm' />
					Delete
				</button>
				<button
					type='button'
					className='inline-flex flex-[1.4] items-center justify-center gap-1.5 border-2 border-editorial-ink bg-editorial-ink px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_rgba(26,26,26,0.45)] transition hover:bg-opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'>
					<Icon icon='PlayCircle' className='text-sm' />
					Execute Node
				</button>
			</div>
		</div>
	);
};

export default NodeSettings;
