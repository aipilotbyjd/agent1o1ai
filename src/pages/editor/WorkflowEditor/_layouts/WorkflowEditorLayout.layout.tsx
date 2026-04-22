import { ReactNode } from 'react';
import { EditorStoreProvider } from '../Build/_context/EditorStore.context';

const WorkflowEditorLayout = ({ children }: { children: ReactNode }) => (
	<EditorStoreProvider>
		<div className='flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'>
			{children}
		</div>
	</EditorStoreProvider>
);

export default WorkflowEditorLayout;
