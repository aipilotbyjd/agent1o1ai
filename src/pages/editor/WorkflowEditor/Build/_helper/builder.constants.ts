export const CANVAS_GRID_SIZE = 16;
export const AUTOSAVE_DEBOUNCE_MS = 1500;
export const HISTORY_LIMIT = 100;

export const PORT_TYPE_COLOR: Record<string, string> = {
	string: '#38bdf8',
	number: '#f59e0b',
	boolean: '#f43f5e',
	list: '#6366f1',
	file: '#14b8a6',
	json: '#a855f7',
	any: '#a1a1aa',
};

export const HUE_TO_CLASSES: Record<string, { bg: string; border: string; text: string; ring: string }> = {
	sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/40',     text: 'text-sky-600 dark:text-sky-300',         ring: 'ring-sky-500/40' },
	violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/40',  text: 'text-violet-600 dark:text-violet-300',   ring: 'ring-violet-500/40' },
	fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/40', text: 'text-fuchsia-600 dark:text-fuchsia-300', ring: 'ring-fuchsia-500/40' },
	emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-600 dark:text-emerald-300', ring: 'ring-emerald-500/40' },
	amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-600 dark:text-amber-300',     ring: 'ring-amber-500/40' },
	rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/40',    text: 'text-rose-600 dark:text-rose-300',       ring: 'ring-rose-500/40' },
	indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/40',  text: 'text-indigo-600 dark:text-indigo-300',   ring: 'ring-indigo-500/40' },
	red:     { bg: 'bg-red-500/10',     border: 'border-red-500/40',     text: 'text-red-600 dark:text-red-300',         ring: 'ring-red-500/40' },
	green:   { bg: 'bg-green-500/10',   border: 'border-green-500/40',   text: 'text-green-600 dark:text-green-300',     ring: 'ring-green-500/40' },
	teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/40',    text: 'text-teal-600 dark:text-teal-300',       ring: 'ring-teal-500/40' },
	purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/40',  text: 'text-purple-600 dark:text-purple-300',   ring: 'ring-purple-500/40' },
	cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/40',    text: 'text-cyan-600 dark:text-cyan-300',       ring: 'ring-cyan-500/40' },
	yellow:  { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/40',  text: 'text-yellow-700 dark:text-yellow-300',   ring: 'ring-yellow-500/40' },
	zinc:    { bg: 'bg-zinc-500/10',    border: 'border-zinc-500/40',    text: 'text-zinc-700 dark:text-zinc-300',       ring: 'ring-zinc-500/40' },
};

export const STATUS_BADGE: Record<string, { label: string; className: string }> = {
	idle:    { label: 'Idle',    className: 'bg-zinc-500/10 text-zinc-500' },
	queued:  { label: 'Queued',  className: 'bg-sky-500/10 text-sky-500' },
	running: { label: 'Running', className: 'bg-blue-500/10 text-blue-500 animate-pulse' },
	success: { label: 'Success', className: 'bg-emerald-500/10 text-emerald-500' },
	error:   { label: 'Error',   className: 'bg-red-500/10 text-red-500' },
	skipped: { label: 'Skipped', className: 'bg-zinc-500/10 text-zinc-400' },
};
