/**
 * Editor-local types. Kept separate from `src/types/workflow.type.ts` (API shape)
 * so we can evolve the canvas representation independently of the backend.
 */

export type TPortType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'list'
	| 'file'
	| 'json'
	| 'any';

export type TNodeCategory =
	| 'input'
	| 'ai'
	| 'extract'
	| 'scrape'
	| 'data'
	| 'logic'
	| 'loop'
	| 'integration'
	| 'output'
	| 'subflow'
	| 'misc';

export type TNodePort = {
	id: string;
	name: string;
	type: TPortType;
	required?: boolean;
};

export type TFieldKind =
	| 'text'
	| 'longtext'
	| 'code'
	| 'number'
	| 'toggle'
	| 'select'
	| 'multiselect'
	| 'kv'
	| 'credential'
	| 'model';

export type TNodeField = {
	key: string;
	label: string;
	kind: TFieldKind;
	options?: { label: string; value: string }[];
	default?: unknown;
	required?: boolean;
	help?: string;
	placeholder?: string;
	supportsVariables?: boolean;
	rows?: number;
};

export type TNodeDefinition = {
	key: string;
	category: TNodeCategory;
	label: string;
	description: string;
	icon: string; // emoji or lucide-ish key
	color: string; // tailwind hue e.g. 'violet'
	inputs: TNodePort[];
	outputs: TNodePort[];
	fields: TNodeField[];
};

export type TNodeRunStatus = 'idle' | 'queued' | 'running' | 'success' | 'error' | 'skipped';

export type TCanvasNodeData = {
	defKey: string; // references TNodeDefinition.key
	label: string;
	values: Record<string, unknown>;
	status?: TNodeRunStatus;
	durationMs?: number;
	error?: string;
	notes?: string;
	locked?: boolean;
};

export type TRunLog = {
	id: string;
	nodeId: string;
	level: 'info' | 'warn' | 'error';
	message: string;
	at: number;
};

export type TRunState = {
	id: string | null;
	status: 'idle' | 'running' | 'success' | 'error' | 'stopped';
	startedAt: number | null;
	finishedAt: number | null;
	logs: TRunLog[];
};

export type TWorkflowMeta = {
	id: string;
	name: string;
	folder: string;
	updatedAt: number;
	savingState: 'saved' | 'saving' | 'dirty' | 'error';
};
