import { ReactNode } from 'react';
import { EditorStoreProvider } from '../Build/_context/EditorStoreProvider.context';

const WorkflowEditorLayout = ({ children }: { children: ReactNode }) => (
	<EditorStoreProvider>
		<div className='flex h-screen w-screen flex-col overflow-hidden bg-editorial-bg text-editorial-ink font-sans'>
			{children}
		</div>
	</EditorStoreProvider>
);

export default WorkflowEditorLayout;
