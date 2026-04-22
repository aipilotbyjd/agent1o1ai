import { useEffect } from 'react';
import Canvas from './_partial/Canvas.partial';
import NodeLibrary from './_partial/NodeLibrary.partial';
import Inspector from './_partial/Inspector.partial';
import Topbar from './_partial/Topbar.partial';
import Console from './_partial/Console.partial';
import AiAssistant from './_partial/AiAssistant.partial';
import { useEditorHotkeys } from './_hooks/useEditorHotkeys.hook';
import { useAutosave } from './_hooks/useAutosave.hook';
import { useEditor, useEditorApi } from './_context/EditorStore.context';
import { NODE_CATALOG_MAP } from './_helper/nodeCatalog.constants';

/**
 * Hydrates a demo workflow if the store is empty.
 * Replace with server hydration (`useWorkflow(id)`) when the API is ready.
 */
const useDemoSeed = () => {
	const api = useEditorApi();
	const nodesLen = useEditor((s) => s.nodes.length);

	useEffect(() => {
		if (nodesLen > 0) return;
		const { addNodeFromCatalog, onConnect, setMeta } = api.getState();
		setMeta({ name: 'Research & Summarise' });

		const a = addNodeFromCatalog('input.ask_ai', { x: 60, y: 160 });
		const b = addNodeFromCatalog('scrape.url', { x: 360, y: 160 });
		const c = addNodeFromCatalog('ai.chat', { x: 680, y: 120 });
		const d = addNodeFromCatalog('ai.summarize', { x: 1000, y: 120 });
		const e = addNodeFromCatalog('output.display', { x: 1300, y: 160 });

		const portOut = (key: string) => NODE_CATALOG_MAP[key].outputs[0]?.id;
		const portIn = (key: string) => NODE_CATALOG_MAP[key].inputs[0]?.id;

		if (a && b)
			onConnect({ source: a, target: b, sourceHandle: portOut('input.ask_ai'), targetHandle: portIn('scrape.url') });
		if (b && c)
			onConnect({ source: b, target: c, sourceHandle: portOut('scrape.url'), targetHandle: portIn('ai.chat') });
		if (c && d)
			onConnect({ source: c, target: d, sourceHandle: portOut('ai.chat'), targetHandle: portIn('ai.summarize') });
		if (d && e)
			onConnect({ source: d, target: e, sourceHandle: portOut('ai.summarize'), targetHandle: portIn('output.display') });

		api.getState().setMeta({ savingState: 'saved' });
	}, [api, nodesLen]);
};

const BuildPage = () => {
	useEditorHotkeys();
	useAutosave();
	useDemoSeed();

	return (
		<div className='flex h-full min-h-0 flex-1 flex-col'>
			<Topbar />
			<div className='flex min-h-0 flex-1'>
				<NodeLibrary />
				<div className='flex min-w-0 flex-1 flex-col'>
					<div className='min-h-0 flex-1'>
						<Canvas />
					</div>
					<Console />
				</div>
				<Inspector />
			</div>
			<AiAssistant />
		</div>
	);
};

export default BuildPage;
