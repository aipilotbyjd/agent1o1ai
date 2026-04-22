import { useEffect, useRef } from 'react';
import { useEditor, useEditorApi } from '../_context/EditorStore.context';
import { AUTOSAVE_DEBOUNCE_MS } from '../_helper/builder.constants';

/**
 * Debounced autosave to localStorage.
 * Replace the `persist` function with a React Query mutation when API is ready.
 */
export const useAutosave = () => {
	const saving = useEditor((s) => s.meta.savingState);
	const api = useEditorApi();
	const timer = useRef<number | null>(null);

	useEffect(() => {
		if (saving !== 'dirty') return;
		if (timer.current) window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => {
			const { meta, exportJson, setMeta } = api.getState();
			setMeta({ savingState: 'saving' });
			try {
				localStorage.setItem(`wf:${meta.id}`, exportJson());
				setMeta({ savingState: 'saved', updatedAt: Date.now() });
			} catch {
				setMeta({ savingState: 'error' });
			}
		}, AUTOSAVE_DEBOUNCE_MS);
		return () => {
			if (timer.current) window.clearTimeout(timer.current);
		};
	}, [saving, api]);
};
