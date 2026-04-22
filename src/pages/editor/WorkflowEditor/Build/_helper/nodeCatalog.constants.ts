import type { TNodeDefinition } from '../../_types/editor.type';

/**
 * The full Gumloop-style node catalog as a local array.
 * Swap this for a React Query hook (`useNodeTypes`) later — the shape is identical.
 */
export const NODE_CATALOG: TNodeDefinition[] = [
	// ─── Inputs ─────────────────────────────────────────────
	{
		key: 'input.ask_ai',
		category: 'input',
		label: 'Ask AI Input',
		description: 'Prompt the user for a value at run time.',
		icon: '💬',
		color: 'sky',
		inputs: [],
		outputs: [{ id: 'value', name: 'value', type: 'string' }],
		fields: [
			{ key: 'label', label: 'Label', kind: 'text', default: 'Your question' },
			{ key: 'placeholder', label: 'Placeholder', kind: 'text' },
			{ key: 'required', label: 'Required', kind: 'toggle', default: true },
		],
	},
	{
		key: 'input.file',
		category: 'input',
		label: 'File Input',
		description: 'Upload a file (CSV, PDF, image).',
		icon: '📎',
		color: 'sky',
		inputs: [],
		outputs: [{ id: 'file', name: 'file', type: 'file' }],
		fields: [
			{
				key: 'accept',
				label: 'Accepted types',
				kind: 'text',
				placeholder: '.pdf,.csv,image/*',
			},
		],
	},
	{
		key: 'input.sheet',
		category: 'input',
		label: 'Google Sheet Input',
		description: 'Read rows from a Google Sheet.',
		icon: '📊',
		color: 'sky',
		inputs: [],
		outputs: [{ id: 'rows', name: 'rows', type: 'list' }],
		fields: [
			{ key: 'credential', label: 'Credential', kind: 'credential' },
			{ key: 'spreadsheetId', label: 'Spreadsheet ID', kind: 'text', required: true },
			{ key: 'range', label: 'Range', kind: 'text', default: 'A1:Z' },
		],
	},

	// ─── AI ─────────────────────────────────────────────────
	{
		key: 'ai.chat',
		category: 'ai',
		label: 'Ask AI',
		description: 'Single LLM call with a prompt.',
		icon: '🧠',
		color: 'violet',
		inputs: [{ id: 'in', name: 'context', type: 'any' }],
		outputs: [{ id: 'out', name: 'response', type: 'string' }],
		fields: [
			{
				key: 'model',
				label: 'Model',
				kind: 'model',
				default: 'gpt-4o',
				options: [
					{ label: 'GPT-4o', value: 'gpt-4o' },
					{ label: 'GPT-4o mini', value: 'gpt-4o-mini' },
					{ label: 'Claude 4 Sonnet', value: 'claude-4-sonnet' },
					{ label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
				],
			},
			{
				key: 'prompt',
				label: 'Prompt',
				kind: 'longtext',
				rows: 6,
				supportsVariables: true,
				placeholder: 'You are a helpful assistant. Use {{Input.value}}…',
				required: true,
			},
			{ key: 'temperature', label: 'Temperature', kind: 'number', default: 0.7 },
		],
	},
	{
		key: 'ai.categorizer',
		category: 'ai',
		label: 'Categorizer',
		description: 'Pick one of N buckets with an LLM.',
		icon: '🏷️',
		color: 'violet',
		inputs: [{ id: 'in', name: 'text', type: 'string' }],
		outputs: [{ id: 'out', name: 'category', type: 'string' }],
		fields: [
			{
				key: 'categories',
				label: 'Categories',
				kind: 'kv',
				help: 'One label per row',
			},
			{ key: 'prompt', label: 'Instructions', kind: 'longtext', supportsVariables: true },
		],
	},
	{
		key: 'ai.extract',
		category: 'extract',
		label: 'Extract Data',
		description: 'LLM + schema → structured JSON.',
		icon: '🔎',
		color: 'fuchsia',
		inputs: [{ id: 'in', name: 'text', type: 'string' }],
		outputs: [{ id: 'out', name: 'data', type: 'json' }],
		fields: [
			{ key: 'schema', label: 'Schema', kind: 'code', rows: 8, supportsVariables: true },
			{ key: 'model', label: 'Model', kind: 'model', default: 'gpt-4o-mini' },
		],
	},
	{
		key: 'ai.summarize',
		category: 'ai',
		label: 'Summarizer',
		description: 'Compress long text to a summary.',
		icon: '📝',
		color: 'violet',
		inputs: [{ id: 'in', name: 'text', type: 'string' }],
		outputs: [{ id: 'out', name: 'summary', type: 'string' }],
		fields: [
			{ key: 'maxWords', label: 'Max words', kind: 'number', default: 120 },
			{ key: 'style', label: 'Style', kind: 'select', default: 'neutral',
				options: [
					{ label: 'Neutral', value: 'neutral' },
					{ label: 'Bullets', value: 'bullets' },
					{ label: 'TL;DR', value: 'tldr' },
				] },
		],
	},

	// ─── Scrape ─────────────────────────────────────────────
	{
		key: 'scrape.url',
		category: 'scrape',
		label: 'Website Scraper',
		description: 'Fetch a URL and return markdown.',
		icon: '🕸️',
		color: 'emerald',
		inputs: [{ id: 'in', name: 'url', type: 'string' }],
		outputs: [{ id: 'out', name: 'content', type: 'string' }],
		fields: [
			{ key: 'url', label: 'URL', kind: 'text', supportsVariables: true, required: true },
			{ key: 'waitSelector', label: 'Wait for selector', kind: 'text' },
		],
	},
	{
		key: 'scrape.crawler',
		category: 'scrape',
		label: 'Website Crawler',
		description: 'BFS crawl from a seed URL.',
		icon: '🐞',
		color: 'emerald',
		inputs: [{ id: 'in', name: 'seed', type: 'string' }],
		outputs: [{ id: 'out', name: 'pages', type: 'list' }],
		fields: [
			{ key: 'maxDepth', label: 'Max depth', kind: 'number', default: 2 },
			{ key: 'maxPages', label: 'Max pages', kind: 'number', default: 25 },
		],
	},

	// ─── Data ───────────────────────────────────────────────
	{
		key: 'data.http',
		category: 'data',
		label: 'HTTP Request',
		description: 'Generic REST call.',
		icon: '🌐',
		color: 'amber',
		inputs: [{ id: 'in', name: 'body', type: 'any' }],
		outputs: [{ id: 'out', name: 'response', type: 'json' }],
		fields: [
			{
				key: 'method',
				label: 'Method',
				kind: 'select',
				default: 'GET',
				options: [
					{ label: 'GET', value: 'GET' },
					{ label: 'POST', value: 'POST' },
					{ label: 'PUT', value: 'PUT' },
					{ label: 'PATCH', value: 'PATCH' },
					{ label: 'DELETE', value: 'DELETE' },
				],
			},
			{ key: 'url', label: 'URL', kind: 'text', supportsVariables: true, required: true },
			{ key: 'headers', label: 'Headers', kind: 'kv' },
			{ key: 'body', label: 'Body', kind: 'code', rows: 6, supportsVariables: true },
		],
	},
	{
		key: 'data.transform',
		category: 'data',
		label: 'JSON Transform',
		description: 'JMESPath / jq style transform.',
		icon: '🧪',
		color: 'amber',
		inputs: [{ id: 'in', name: 'data', type: 'json' }],
		outputs: [{ id: 'out', name: 'result', type: 'json' }],
		fields: [
			{ key: 'expression', label: 'Expression', kind: 'code', rows: 4, supportsVariables: true },
		],
	},
	{
		key: 'data.merge',
		category: 'data',
		label: 'Merge',
		description: 'Combine multiple inputs into one list.',
		icon: '🔗',
		color: 'amber',
		inputs: [
			{ id: 'a', name: 'a', type: 'any' },
			{ id: 'b', name: 'b', type: 'any' },
		],
		outputs: [{ id: 'out', name: 'merged', type: 'list' }],
		fields: [],
	},

	// ─── Logic ──────────────────────────────────────────────
	{
		key: 'logic.if',
		category: 'logic',
		label: 'If / Else',
		description: 'Branch on a boolean expression.',
		icon: '🔀',
		color: 'rose',
		inputs: [{ id: 'in', name: 'value', type: 'any' }],
		outputs: [
			{ id: 'true', name: 'true', type: 'any' },
			{ id: 'false', name: 'false', type: 'any' },
		],
		fields: [
			{ key: 'expression', label: 'Condition', kind: 'text', supportsVariables: true, required: true, placeholder: '{{Input.value}} === "yes"' },
		],
	},
	{
		key: 'logic.switch',
		category: 'logic',
		label: 'Switch',
		description: 'Multi-branch by key.',
		icon: '🎛️',
		color: 'rose',
		inputs: [{ id: 'in', name: 'value', type: 'string' }],
		outputs: [
			{ id: 'a', name: 'A', type: 'any' },
			{ id: 'b', name: 'B', type: 'any' },
			{ id: 'c', name: 'C', type: 'any' },
			{ id: 'default', name: 'default', type: 'any' },
		],
		fields: [{ key: 'cases', label: 'Cases', kind: 'kv' }],
	},

	// ─── Loop ───────────────────────────────────────────────
	{
		key: 'loop.forEach',
		category: 'loop',
		label: 'For Each',
		description: 'Iterate a list through a sub-graph.',
		icon: '🔁',
		color: 'indigo',
		inputs: [{ id: 'in', name: 'list', type: 'list' }],
		outputs: [
			{ id: 'item', name: 'item', type: 'any' },
			{ id: 'out', name: 'results', type: 'list' },
		],
		fields: [
			{ key: 'concurrency', label: 'Concurrency', kind: 'number', default: 4 },
		],
	},

	// ─── Integration ────────────────────────────────────────
	{
		key: 'int.gmail',
		category: 'integration',
		label: 'Gmail Send',
		description: 'Send an email via Gmail.',
		icon: '✉️',
		color: 'red',
		inputs: [{ id: 'in', name: 'trigger', type: 'any' }],
		outputs: [{ id: 'out', name: 'messageId', type: 'string' }],
		fields: [
			{ key: 'credential', label: 'Credential', kind: 'credential' },
			{ key: 'to', label: 'To', kind: 'text', supportsVariables: true, required: true },
			{ key: 'subject', label: 'Subject', kind: 'text', supportsVariables: true },
			{ key: 'body', label: 'Body', kind: 'longtext', rows: 6, supportsVariables: true },
		],
	},
	{
		key: 'int.sheets.write',
		category: 'integration',
		label: 'Sheets Write',
		description: 'Append rows to Google Sheets.',
		icon: '📗',
		color: 'green',
		inputs: [{ id: 'in', name: 'rows', type: 'list' }],
		outputs: [{ id: 'out', name: 'rowCount', type: 'number' }],
		fields: [
			{ key: 'credential', label: 'Credential', kind: 'credential' },
			{ key: 'spreadsheetId', label: 'Spreadsheet ID', kind: 'text', required: true },
			{ key: 'sheet', label: 'Sheet', kind: 'text', default: 'Sheet1' },
		],
	},
	{
		key: 'int.slack',
		category: 'integration',
		label: 'Slack Message',
		description: 'Post a message to a Slack channel.',
		icon: '💬',
		color: 'purple',
		inputs: [{ id: 'in', name: 'trigger', type: 'any' }],
		outputs: [{ id: 'out', name: 'ts', type: 'string' }],
		fields: [
			{ key: 'credential', label: 'Credential', kind: 'credential' },
			{ key: 'channel', label: 'Channel', kind: 'text', required: true },
			{ key: 'text', label: 'Message', kind: 'longtext', rows: 4, supportsVariables: true },
		],
	},
	{
		key: 'int.notion',
		category: 'integration',
		label: 'Notion Page',
		description: 'Create a Notion page.',
		icon: '📓',
		color: 'zinc',
		inputs: [{ id: 'in', name: 'trigger', type: 'any' }],
		outputs: [{ id: 'out', name: 'pageId', type: 'string' }],
		fields: [
			{ key: 'credential', label: 'Credential', kind: 'credential' },
			{ key: 'database', label: 'Database ID', kind: 'text', required: true },
			{ key: 'title', label: 'Title', kind: 'text', supportsVariables: true },
		],
	},

	// ─── Output ─────────────────────────────────────────────
	{
		key: 'output.display',
		category: 'output',
		label: 'Display',
		description: 'Render the output in the run panel.',
		icon: '🖥️',
		color: 'teal',
		inputs: [{ id: 'in', name: 'value', type: 'any' }],
		outputs: [],
		fields: [{ key: 'label', label: 'Label', kind: 'text', default: 'Result' }],
	},
	{
		key: 'output.file',
		category: 'output',
		label: 'File Output',
		description: 'Write the input to a downloadable file.',
		icon: '💾',
		color: 'teal',
		inputs: [{ id: 'in', name: 'value', type: 'any' }],
		outputs: [{ id: 'out', name: 'url', type: 'string' }],
		fields: [
			{ key: 'filename', label: 'Filename', kind: 'text', default: 'output.json' },
			{
				key: 'format',
				label: 'Format',
				kind: 'select',
				default: 'json',
				options: [
					{ label: 'JSON', value: 'json' },
					{ label: 'CSV', value: 'csv' },
					{ label: 'Text', value: 'txt' },
				],
			},
		],
	},

	// ─── Misc ───────────────────────────────────────────────
	{
		key: 'misc.sticky',
		category: 'misc',
		label: 'Sticky Note',
		description: 'A non-executing comment on the canvas.',
		icon: '📝',
		color: 'yellow',
		inputs: [],
		outputs: [],
		fields: [{ key: 'text', label: 'Text', kind: 'longtext', rows: 6 }],
	},
	{
		key: 'misc.subflow',
		category: 'subflow',
		label: 'Subflow',
		description: 'Embed another workflow as a single step.',
		icon: '📦',
		color: 'cyan',
		inputs: [{ id: 'in', name: 'input', type: 'any' }],
		outputs: [{ id: 'out', name: 'output', type: 'any' }],
		fields: [
			{ key: 'workflowId', label: 'Workflow', kind: 'select', options: [] },
		],
	},
];

export const NODE_CATALOG_MAP: Record<string, TNodeDefinition> = NODE_CATALOG.reduce(
	(acc, def) => ({ ...acc, [def.key]: def }),
	{},
);

export const CATEGORY_META: Record<
	TNodeDefinition['category'],
	{ label: string; order: number; hue: string }
> = {
	input: { label: 'Inputs', order: 1, hue: 'sky' },
	ai: { label: 'AI', order: 2, hue: 'violet' },
	extract: { label: 'Extract', order: 3, hue: 'fuchsia' },
	scrape: { label: 'Scrape', order: 4, hue: 'emerald' },
	data: { label: 'Data', order: 5, hue: 'amber' },
	logic: { label: 'Logic', order: 6, hue: 'rose' },
	loop: { label: 'Loops', order: 7, hue: 'indigo' },
	integration: { label: 'Integrations', order: 8, hue: 'red' },
	output: { label: 'Output', order: 9, hue: 'teal' },
	subflow: { label: 'Subflows', order: 10, hue: 'cyan' },
	misc: { label: 'Misc', order: 11, hue: 'yellow' },
};
