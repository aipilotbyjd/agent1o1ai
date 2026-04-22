import { useHotkeys } from 'react-hotkeys-hook';
import { useEditor } from '../_context/EditorStore.context';

export const useEditorHotkeys = () => {
	const undo = useEditor((s) => s.undo);
	const redo = useEditor((s) => s.redo);
	const dup = useEditor((s) => s.duplicateSelected);
	const del = useEditor((s) => s.deleteSelected);
	const layout = useEditor((s) => s.runAutoLayout);
	const run = useEditor((s) => s.runWorkflow);
	const toggleAi = useEditor((s) => s.toggleAiPanel);
	const togglePalette = useEditor((s) => s.toggleCommandPalette);
	const requestFitView = useEditor((s) => s.requestFitView);

	useHotkeys('mod+z', (e) => { e.preventDefault(); undo(); }, { enableOnFormTags: false });
	useHotkeys('mod+shift+z,mod+y', (e) => { e.preventDefault(); redo(); }, { enableOnFormTags: false });
	useHotkeys('mod+d', (e) => { e.preventDefault(); dup(); });
	useHotkeys('delete,backspace', (e) => {
		const t = e.target as HTMLElement;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		e.preventDefault();
		del();
	});
	useHotkeys('l', () => layout(), { enableOnFormTags: false });
	useHotkeys('mod+enter', (e) => { e.preventDefault(); run(); });
	useHotkeys('mod+k', (e) => { e.preventDefault(); toggleAi(); }, { enableOnFormTags: true });
	useHotkeys('mod+p,mod+slash', (e) => { e.preventDefault(); togglePalette(); }, { enableOnFormTags: true });
	useHotkeys('f', () => requestFitView(), { enableOnFormTags: false });
};
