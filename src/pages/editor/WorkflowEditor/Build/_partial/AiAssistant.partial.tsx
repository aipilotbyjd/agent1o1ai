import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/icon/Icon';
import { useEditor, useEditorApi } from '../_context/EditorStore.context';
import { NODE_CATALOG_MAP } from '../_helper/nodeCatalog.constants';

type TChatRole = 'user' | 'assistant';

type TGeneratedPlan = {
	title: string;
	nodes: string[]; // catalog keys, in order
};

type TChatMessage = {
	id: string;
	role: TChatRole;
	text: string;
	plan?: TGeneratedPlan;
};

// ── Templates (shown as suggestion chips) ────────────────────────────
const TEMPLATES: { label: string; prompt: string; icon: string }[] = [
	{
		label: 'Scrape & summarize',
		prompt: 'Scrape a website and summarize the content.',
		icon: '🕸️',
	},
	{
		label: 'Categorize emails',
		prompt: 'Read incoming text and categorize it into buckets, then send a Slack message.',
		icon: '🏷️',
	},
	{
		label: 'Extract from URL',
		prompt: 'Scrape a URL and extract structured data, then write it to a Google Sheet.',
		icon: '🔎',
	},
	{
		label: 'Ask AI chain',
		prompt: 'Ask a question, use AI to answer, and display the result.',
		icon: '🧠',
	},
];

// ── Heuristic prompt → catalog-key plan ──────────────────────────────
const KEYWORD_MAP: { match: RegExp; key: string }[] = [
	{ match: /(scrape|crawl|website|url|webpage)/i, key: 'scrape.url' },
	{ match: /(summari[sz]e|summary|tl;?dr)/i, key: 'ai.summarize' },
	{ match: /(categor[iy]|classif|bucket)/i, key: 'ai.categorizer' },
	{ match: /(extract|structured|schema|json)/i, key: 'ai.extract' },
	{ match: /(email|gmail|mail)/i, key: 'int.gmail' },
	{ match: /(slack)/i, key: 'int.slack' },
	{ match: /(notion)/i, key: 'int.notion' },
	{ match: /(spreadsheet|google sheet|sheets)/i, key: 'int.sheets.write' },
	{ match: /(\bloop\b|each|iterate|every)/i, key: 'loop.forEach' },
	{ match: /(\bif\b|condition|branch|when)/i, key: 'logic.if' },
	{ match: /(http|rest|api request|fetch)/i, key: 'data.http' },
	{ match: /(transform|jq|jmespath|reshape)/i, key: 'data.transform' },
	{ match: /(merge|combine|join)/i, key: 'data.merge' },
	{ match: /(upload|file)/i, key: 'input.file' },
];

const ALWAYS_START = 'input.ask_ai';
const ALWAYS_END = 'output.display';

const buildPlan = (prompt: string): TGeneratedPlan => {
	const hits = new Set<string>();
	KEYWORD_MAP.forEach((m) => {
		if (m.match.test(prompt)) hits.add(m.key);
	});

	// Fallback: always offer a useful chain
	if (hits.size === 0) hits.add('ai.chat');

	// Preferred execution order by category priority
	const ORDER: Record<string, number> = {
		'input.file': 10,
		'scrape.url': 20,
		'scrape.crawler': 21,
		'data.http': 30,
		'data.merge': 31,
		'data.transform': 32,
		'ai.chat': 40,
		'ai.extract': 41,
		'ai.categorizer': 42,
		'ai.summarize': 43,
		'logic.if': 50,
		'loop.forEach': 51,
		'int.gmail': 60,
		'int.slack': 61,
		'int.notion': 62,
		'int.sheets.write': 63,
	};

	const middle = Array.from(hits).sort(
		(a, b) => (ORDER[a] ?? 99) - (ORDER[b] ?? 99),
	);

	return {
		title: prompt.length > 60 ? `${prompt.slice(0, 57)}…` : prompt,
		nodes: [ALWAYS_START, ...middle, ALWAYS_END],
	};
};

// ── Component ────────────────────────────────────────────────────────
const AiAssistant = () => {
	const open = useEditor((s) => s.aiPanelOpen);
	const toggle = useEditor((s) => s.toggleAiPanel);
	const setMeta = useEditor((s) => s.setMeta);
	const api = useEditorApi();

	const [input, setInput] = useState('');
	const [isThinking, setIsThinking] = useState(false);
	const [messages, setMessages] = useState<TChatMessage[]>([
		{
			id: 'welcome',
			role: 'assistant',
			text: "Hi! Describe the workflow you want to build and I'll scaffold it on the canvas. Try one of the templates below or type your own.",
		},
	]);
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (!listRef.current) return;
		listRef.current.scrollTop = listRef.current.scrollHeight;
	}, [messages, isThinking]);

	useEffect(() => {
		if (open) setTimeout(() => inputRef.current?.focus(), 50);
	}, [open]);

	const hasMessages = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);

	const applyPlan = (plan: TGeneratedPlan) => {
		const state = api.getState();
		// Place after the existing nodes, stacked in a row
		const rightmost = state.nodes.reduce(
			(acc, n) => Math.max(acc, n.position.x + 220),
			80,
		);
		const topmost = state.nodes.length
			? state.nodes.reduce((acc, n) => Math.min(acc, n.position.y), Infinity) + 260
			: 160;

		const addedIds: string[] = [];
		plan.nodes.forEach((key, idx) => {
			const id = state.addNodeFromCatalog(key, {
				x: rightmost + idx * 300,
				y: topmost,
			});
			if (id) addedIds.push(id);
		});

		// Connect sequentially via first output → first input
		for (let i = 0; i < addedIds.length - 1; i++) {
			const aKey = plan.nodes[i];
			const bKey = plan.nodes[i + 1];
			const src = NODE_CATALOG_MAP[aKey]?.outputs[0]?.id;
			const tgt = NODE_CATALOG_MAP[bKey]?.inputs[0]?.id;
			if (!src || !tgt) continue;
			api.getState().onConnect({
				source: addedIds[i],
				target: addedIds[i + 1],
				sourceHandle: src,
				targetHandle: tgt,
			});
		}
		setMeta({ savingState: 'dirty' });
	};

	const submitPrompt = (prompt: string) => {
		if (!prompt.trim()) return;
		const userMsg: TChatMessage = {
			id: `u_${Date.now()}`,
			role: 'user',
			text: prompt.trim(),
		};
		setMessages((m) => [...m, userMsg]);
		setInput('');
		setIsThinking(true);

		// Simulate latency for a real-world feel
		setTimeout(() => {
			const plan = buildPlan(prompt);
			const assistant: TChatMessage = {
				id: `a_${Date.now()}`,
				role: 'assistant',
				text: `Here's a ${plan.nodes.length}-step workflow. Click "Add to canvas" to insert it.`,
				plan,
			};
			setMessages((m) => [...m, assistant]);
			setIsThinking(false);
		}, 450);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submitPrompt(input);
		}
	};

	const clearChat = () => {
		setMessages([
			{
				id: 'welcome',
				role: 'assistant',
				text: 'Ready for a new build. What do you want to automate?',
			},
		]);
	};

	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className='fixed inset-0 z-40 bg-editorial-ink/10 backdrop-blur-[2px]'
				onClick={toggle}
				aria-hidden='true'
			/>

			{/* Slide-over panel */}
			<aside
				role='dialog'
				aria-label='AI workflow builder'
				className='fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l-2 border-editorial-ink bg-white shadow-editorial'>
				{/* Header */}
				<header className='relative overflow-hidden border-b-2 border-editorial-ink bg-editorial-bg'>
					<div className='relative flex items-center justify-between px-4 py-3'>
						<div className='flex items-center gap-2.5'>
							<div className='relative'>
								<div className='relative flex h-9 w-9 items-center justify-center rounded-none border-2 border-editorial-ink bg-editorial-ink shadow-editorial-button'>
									<Icon icon='Sparkles' className='text-base text-white' />
								</div>
							</div>
							<div>
								<div className='flex items-center gap-1.5 font-serif font-black italic text-[13px] text-editorial-ink'>
									AI Builder
									<span className='rounded-none border border-editorial-ink bg-white px-1.5 py-0.5 font-mono text-[9px] tracking-tighter text-editorial-ink/70'>
										Beta
									</span>
								</div>
								<div className='font-mono text-[10px] tracking-tighter text-editorial-ink/60'>
									Describe it. I&apos;ll build it.
								</div>
							</div>
						</div>
						<div className='flex items-center gap-1'>
							{hasMessages && (
								<button
									type='button'
									onClick={clearChat}
									title='Clear conversation'
									aria-label='Clear conversation'
									className='inline-flex h-8 w-8 items-center justify-center rounded-none border-2 border-transparent text-editorial-ink/60 hover:border-editorial-ink hover:text-editorial-ink'>
									<Icon icon='Delete02' className='text-sm' />
								</button>
							)}
							<button
								type='button'
								onClick={toggle}
								title='Close'
								aria-label='Close'
								className='inline-flex h-8 w-8 items-center justify-center rounded-none border-2 border-transparent text-editorial-ink/60 hover:border-editorial-ink hover:text-editorial-ink'>
								<Icon icon='Cancel01' className='text-sm' />
							</button>
						</div>
					</div>
				</header>

				{/* Messages */}
				<div
					ref={listRef}
					className='flex-1 overflow-y-auto px-4 py-4'>
					<div className='space-y-3'>
						{messages.map((m) => (
							<MessageBubble
								key={m.id}
								message={m}
								onApply={(plan) => applyPlan(plan)}
							/>
						))}
						{isThinking && <ThinkingBubble />}
					</div>
				</div>

				{/* Templates (shown when chat is fresh) */}
				{!hasMessages && !isThinking && (
					<div className='border-t-2 border-editorial-ink px-4 py-3 bg-editorial-bg'>
						<div className='mb-2 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60'>
							Templates
						</div>
						<div className='grid grid-cols-2 gap-2'>
							{TEMPLATES.map((t) => (
								<button
									key={t.label}
									type='button'
									onClick={() => submitPrompt(t.prompt)}
									className='group flex items-start gap-2 rounded-none border-2 border-editorial-ink bg-white p-2.5 text-left transition hover:shadow-editorial-soft'>
									<span className='text-base'>{t.icon}</span>
									<div className='min-w-0 flex-1'>
										<div className='truncate font-serif font-black italic text-xs text-editorial-ink'>
											{t.label}
										</div>
										<div className='line-clamp-2 font-mono text-[9px] tracking-tighter text-editorial-ink/60'>
											{t.prompt}
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				{/* Composer */}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						submitPrompt(input);
					}}
					className='border-t-2 border-editorial-ink bg-white p-3'>
					<div className='relative rounded-none border-2 border-editorial-ink bg-editorial-bg focus-within:ring-2 focus-within:ring-editorial-ink/20'>
						<textarea
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={onKeyDown}
							rows={2}
							placeholder='Describe the workflow… (⏎ to send, ⇧⏎ for newline)'
							className='w-full resize-none bg-transparent px-3 py-2.5 pr-12 text-sm text-editorial-ink outline-none placeholder:text-editorial-ink/40'
						/>
						<button
							type='submit'
							disabled={!input.trim() || isThinking}
							title='Send'
							aria-label='Send'
							className='absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-none border-2 border-editorial-ink bg-editorial-ink text-white shadow-editorial-button disabled:opacity-40 disabled:shadow-none'>
							<Icon icon='ArrowUp01' className='text-sm' />
						</button>
					</div>
					<div className='mt-1.5 flex items-center gap-1 font-mono text-[9px] tracking-tighter text-editorial-ink/50'>
						<Icon icon='Sparkles' className='text-xs' />
						<span>Nodes are added to the right of your existing graph.</span>
					</div>
				</form>
			</aside>
		</>
	);
};

// ── Message bubble ───────────────────────────────────────────────────
const MessageBubble = ({
	message,
	onApply,
}: {
	message: TChatMessage;
	onApply: (plan: TGeneratedPlan) => void;
}) => {
	const isUser = message.role === 'user';
	if (isUser) {
		return (
			<div className='flex justify-end'>
				<div className='max-w-[85%] rounded-none rounded-tr-sm bg-editorial-ink px-3.5 py-2 text-sm text-white shadow-editorial-soft'>
					{message.text}
				</div>
			</div>
		);
	}

	return (
		<div className='flex items-start gap-2'>
			<div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-editorial-ink shadow-editorial-soft'>
				<Icon icon='Sparkles' className='text-xs text-white' />
			</div>
			<div className='max-w-[85%] space-y-2'>
				<div className='rounded-none rounded-tl-sm border-2 border-editorial-ink bg-white px-3.5 py-2 text-sm text-editorial-ink shadow-editorial-soft'>
					{message.text}
				</div>
				{message.plan && <PlanCard plan={message.plan} onApply={() => onApply(message.plan!)} />}
			</div>
		</div>
	);
};

// ── Plan preview card ────────────────────────────────────────────────
const PlanCard = ({ plan, onApply }: { plan: TGeneratedPlan; onApply: () => void }) => {
	const [applied, setApplied] = useState(false);

	const apply = () => {
		onApply();
		setApplied(true);
	};

	return (
		<div className='overflow-hidden rounded-none border-2 border-editorial-ink bg-white shadow-editorial-soft'>
			<div className='flex items-center justify-between gap-2 border-b-2 border-editorial-ink bg-editorial-bg px-3 py-2'>
				<div className='flex items-center gap-1.5 font-mono text-[10px] tracking-tighter text-editorial-ink/70'>
					<Icon icon='WorkflowSquare03' className='text-sm text-editorial-ink' />
					Proposed workflow
				</div>
				<div className='font-mono text-[10px] tabular-nums tracking-tighter text-editorial-ink/60'>
					{plan.nodes.length} steps
				</div>
			</div>

			<ol className='px-3 py-2.5'>
				{plan.nodes.map((key, i) => {
					const def = NODE_CATALOG_MAP[key];
					if (!def) return null;
					return (
						<li
							key={`${key}-${i}`}
							className='flex items-center gap-2.5 py-1'>
							<span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-none border border-editorial-ink bg-editorial-bg font-mono text-[9px] font-medium text-editorial-ink/70 tabular-nums'>
								{i + 1}
							</span>
							<span className='text-sm leading-none'>{def.icon}</span>
							<span className='min-w-0 flex-1 truncate font-serif font-black italic text-xs text-editorial-ink'>
								{def.label}
							</span>
							{i < plan.nodes.length - 1 && (
								<Icon icon='ArrowRight01' className='text-xs text-editorial-ink/30' />
							)}
						</li>
					);
				})}
			</ol>

			<div className='border-t-2 border-editorial-ink bg-editorial-bg px-3 py-2'>
				<button
					type='button'
					onClick={apply}
					disabled={applied}
					className='inline-flex w-full items-center justify-center gap-1.5 rounded-none border-2 border-editorial-ink bg-editorial-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-editorial-button transition hover:bg-editorial-ink/90 disabled:cursor-default disabled:border-emerald-500 disabled:bg-emerald-500 disabled:shadow-emerald-500/30'>
					{applied ? (
						<>
							<Icon icon='Tick02' className='text-sm' />
							Added to canvas
						</>
					) : (
						<>
							<Icon icon='ArrowUpRight01' className='text-sm' />
							Add to canvas
						</>
					)}
				</button>
			</div>
		</div>
	);
};

// ── Typing indicator ─────────────────────────────────────────────────
const ThinkingBubble = () => (
	<div className='flex items-start gap-2'>
		<div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-none border-2 border-editorial-ink bg-editorial-ink shadow-editorial-soft'>
			<Icon icon='Sparkles' className='text-xs text-white' />
		</div>
		<div className='rounded-none rounded-tl-sm border-2 border-editorial-ink bg-white px-3.5 py-3 shadow-editorial-soft'>
			<div className='flex items-center gap-1'>
				<span className='h-1.5 w-1.5 animate-bounce rounded-none bg-editorial-ink [animation-delay:0s]' />
				<span className='h-1.5 w-1.5 animate-bounce rounded-none bg-editorial-ink [animation-delay:0.15s]' />
				<span className='h-1.5 w-1.5 animate-bounce rounded-none bg-editorial-ink [animation-delay:0.3s]' />
			</div>
		</div>
	</div>
);

export default AiAssistant;
