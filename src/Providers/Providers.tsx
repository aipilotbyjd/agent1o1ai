import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeContextProvider } from '@/context/themeContext';
import { AuthProvider } from '@/context/authContext';
import { WorkspaceProvider } from '@/context/workspaceContext';
import { createQueryClient } from '@/api';

const queryClient = createQueryClient();

const Providers = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeContextProvider>
				<WorkspaceProvider>
					{/* <Outlet /> must be used in the innermost provider. */}
					<AuthProvider />
				</WorkspaceProvider>
			</ThemeContextProvider>
		</QueryClientProvider>
	);
};

export default Providers;
