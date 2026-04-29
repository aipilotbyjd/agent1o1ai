import { useStore } from 'zustand';
import { useContext, useRef, ReactNode } from 'react';
import {
	createEditorStore,
	type TEditorState,
	type TStoreApi,
	StoreCtx,
} from './EditorStore.context';

export type { TEditorState, TStoreApi };

export const EditorStoreProvider = ({ children }: { children: ReactNode }) => {
	const ref = useRef<TStoreApi | null>(null);
	if (!ref.current) ref.current = createEditorStore();
	return <StoreCtx.Provider value={ref.current}>{children}</StoreCtx.Provider>;
};

export function useEditor<T>(selector: (s: TEditorState) => T): T {
	const api = useContext(StoreCtx);
	if (!api) throw new Error('useEditor must be used inside <EditorStoreProvider>');
	return useStore(api, selector);
}

export const useEditorApi = (): TStoreApi => {
	const api = useContext(StoreCtx);
	if (!api) throw new Error('useEditorApi must be used inside <EditorStoreProvider>');
	return api;
};
