import Canvas from './_partial/canvas/Canvas.partial';
import NodePanel from './_partial/sidebar/NodePanel.partial';
import NodeSettings from './_partial/sidebar/NodeSettings.partial';
import Toolbar from './_partial/toolbar/Toolbar.partial';
import RunOutput from './_partial/output/RunOutput.partial';
import AiChat from './_partial/sidebar/AiChat.partial';
import SearchDialog from './_partial/dialogs/SearchDialog.partial';
import ActionBar from './_partial/output/ActionBar.partial';
import { useEditorHotkeys } from './_hooks/useEditorHotkeys.hook';
import { useAutosave } from './_hooks/useAutosave.hook';
import { useEditor } from './_context/EditorStoreProvider.context';

export { useDemoSeed } from './_hooks/useDemoSeed.hook';

const BuildPage = () => {
	useEditorHotkeys();
	useAutosave();
	const rightPanelOpen = useEditor((s) => s.rightPanelOpen);
	const selectedNodeId = useEditor((s) => s.selectedNodeId);
	const toggleRightPanel = useEditor((s) => s.toggleRightPanel);
	// Note: useDemoSeed() intentionally not called so the empty-state template grid
	// is the first thing the user sees. Uncomment to auto-hydrate a demo graph.
	// useDemoSeed();

	return (
		<div className='flex h-full min-h-0 flex-1 flex-col'>
			<Toolbar />
			<div className='flex min-h-0 flex-1'>
				<NodePanel />
				<div className='relative flex min-w-0 flex-1 flex-col'>
					<div className='relative min-h-0 flex-1'>
						<Canvas />
						<ActionBar />
					</div>
					<RunOutput />
					{rightPanelOpen && selectedNodeId && (
						<div
							className='absolute inset-0 z-50 flex items-center justify-center bg-editorial-ink/45 px-4 py-3 backdrop-blur-sm'
							onClick={toggleRightPanel}>
							<div
								className='h-full max-h-[96vh] w-full max-w-[760px] overflow-hidden'
								onClick={(e) => e.stopPropagation()}>
								<NodeSettings />
							</div>
						</div>
					)}
				</div>
			</div>
			<AiChat />
			<SearchDialog />
		</div>
	);
};

export default BuildPage;
