import { useOutletContext } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import Container from '@/components/layout/Container';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '@/components/layout/Subheader';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import { SortingState } from '@tanstack/react-table';

import {
	useCreateCredential,
	useCredential,
	useCredentials,
	useDeleteCredential,
	useOAuthProviders,
	useRefreshCredentialToken,
	useShareCredential,
	useTestCredential,
	useUnshareCredential,
	useUpdateCredential,
	useUpdateSharingScope,
} from '@/api';
import { useOAuthPopup } from './_hooks/useOAuthPopup.hook';
import { useFetchMembers } from '@/api';
import { useAuth } from '@/context/authContext';
import {
	ICredential,
	ICredentialFilters,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	TCredentialType,
	TCredentialSortBy,
	TSortOrder,
	TSharingScope,
} from '@/types/credential.type';
import { toast } from 'react-toastify';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';

import FiltersPartial from './_partial/Filters.partial';
import TablePartial from './_partial/Table.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';
import CredentialModalPartial from './_partial/CredentialModal.partial';
import CredentialShareModalPartial from './_partial/CredentialShareModal.partial';

export interface OutletContextType {
	headerLeft?: React.ReactNode;
	setHeaderLeft: (value: React.ReactNode) => void;
}

const CredentialsListPage = () => {
	const workspaceId = useCurrentWorkspaceId() || '';
	const { userData } = useAuth();

	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<TCredentialType | ''>('');
	const [sortBy, setSortBy] = useState<TCredentialSortBy>('created_at');
	const [sortOrder, setSortOrder] = useState<TSortOrder>('desc');
	const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
	const [editingCredential, setEditingCredential] = useState<ICredential | null>(null);
	const [sharingCredential, setSharingCredential] = useState<ICredential | null>(null);
	const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

	const hasFilters = searchQuery || typeFilter;

	const filters: ICredentialFilters = useMemo(
		() => ({
			...(searchQuery && { search: searchQuery }),
			...(typeFilter && { type: typeFilter }),
			sort_by: sortBy,
			order: sortOrder,
		}),
		[searchQuery, typeFilter, sortBy, sortOrder],
	);

	const { data: credentials, isLoading, isError, refetch } = useCredentials(workspaceId, filters);
	const { data: credentialDetail, isLoading: isCredentialDetailLoading } = useCredential(
		workspaceId,
		editingCredential?.id ?? '',
	);
	const { data: sharingCredentialDetail, isLoading: isSharingCredentialDetailLoading } =
		useCredential(workspaceId, sharingCredential?.id ?? '');
	const { data: members = [], isLoading: isMembersLoading } = useFetchMembers(workspaceId);
	const { data: oauthProviders = [] } = useOAuthProviders();

	const createCredential = useCreateCredential(workspaceId);
	const updateCredential = useUpdateCredential(workspaceId);
	const deleteCredential = useDeleteCredential(workspaceId);
	const testCredential = useTestCredential(workspaceId);
	const refreshCredentialToken = useRefreshCredentialToken(workspaceId);
	const shareCredentialMutation = useShareCredential(workspaceId);
	const unshareCredentialMutation = useUnshareCredential(workspaceId);
	const updateSharingScope = useUpdateSharingScope(workspaceId);

	const handleCloseCredentialModal = () => {
		setIsCredentialModalOpen(false);
		setEditingCredential(null);
	};

	const oauthPopup = useOAuthPopup({
		workspaceId,
		onSuccess: () => {
			handleCloseCredentialModal();
			refetch();
		},
	});

	const configuredOAuthProviders = useMemo(
		() => oauthProviders.filter((provider) => provider.configured).map((provider) => provider.id),
		[oauthProviders],
	);

	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	useEffect(() => {
		setHeaderLeft(<span className='font-semibold'>Credentials</span>);
		return () => setHeaderLeft(undefined);
	}, [setHeaderLeft]);

	const handleTest = async (credential: ICredential) => {
		await testCredential.mutateAsync(credential.id);
	};

	const handleRefresh = async (credential: ICredential) => {
		await refreshCredentialToken.mutateAsync(credential.id);
	};

	const handleDelete = async (credential: ICredential) => {
		if (confirm(`Are you sure you want to delete "${credential.name}"?`)) {
			await deleteCredential.mutateAsync(credential.id);
		}
	};

	const handleOpenCreate = () => {
		setEditingCredential(null);
		setIsCredentialModalOpen(true);
	};

	const handleEdit = (credential: ICredential) => {
		setEditingCredential(credential);
		setIsCredentialModalOpen(true);
	};

	const handleUpdateCredential = async (values: IUpdateCredentialDto) => {
		if (!editingCredential) return;

		await updateCredential.mutateAsync({
			id: editingCredential.id,
			body: values,
		});
		handleCloseCredentialModal();
	};

	const handleCreateCredential = async (
		values: ICreateCredentialDto,
		selectedUserIds?: string[],
	) => {
		if (values.type === 'oauth2' && values.data.provider) {
			try {
				await oauthPopup.launch(values, selectedUserIds);
			} catch {
				toast.error('Failed to start OAuth flow');
			}
			return;
		}

		const credential = await createCredential.mutateAsync(values);
		if (values.sharing_scope === 'specific' && selectedUserIds?.length) {
			await shareCredentialMutation.mutateAsync({
				id: credential.id,
				body: { user_ids: selectedUserIds },
			});
		}
		handleCloseCredentialModal();
	};

	const handleShareSubmit = async ({
		sharing_scope,
		user_ids,
		revoke_user_ids,
	}: {
		sharing_scope: TSharingScope;
		user_ids: string[];
		revoke_user_ids: string[];
	}) => {
		if (!sharingCredential) return;

		await updateSharingScope.mutateAsync({
			id: sharingCredential.id,
			body: { sharing_scope },
		});

		if (sharing_scope === 'specific') {
			if (user_ids.length > 0) {
				await shareCredentialMutation.mutateAsync({
					id: sharingCredential.id,
					body: { user_ids },
				});
			}
			await Promise.all(
				revoke_user_ids.map((userId) =>
					unshareCredentialMutation.mutateAsync({
						id: sharingCredential.id,
						userId,
					}),
				),
			);
		}

		setSharingCredential(null);
	};

	const clearAllFilters = () => {
		setSearchQuery('');
		setTypeFilter('');
	};

	const filteredData = useMemo(() => credentials || [], [credentials]);

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search credentials...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<FiltersPartial
						typeFilter={typeFilter}
						setTypeFilter={setTypeFilter}
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortOrder={sortOrder}
						setSortOrder={setSortOrder}
					/>
					{hasFilters && (
						<Button
							aria-label='Clear filters'
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							onClick={clearAllFilters}>
							Clear
						</Button>
					)}
					<SubheaderSeparator />
					<Button
						aria-label='New Credential'
						variant='solid'
						icon='PlusSignCircle'
						onClick={handleOpenCreate}>
						New Credential
					</Button>
				</SubheaderRight>
			</Subheader>
			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col'>
					{isLoading ? (
						<LoadingStatePartial />
					) : isError ? (
						<ErrorStatePartial onRetry={() => refetch()} />
					) : filteredData.length === 0 ? (
						<EmptyStatePartial
							hasFilters={!!hasFilters}
							onClearFilters={clearAllFilters}
							onAddNew={handleOpenCreate}
						/>
					) : (
						<TablePartial
							data={filteredData}
							sorting={sorting}
							onSortingChange={setSorting}
							onEdit={handleEdit}
							onTest={handleTest}
							onRefresh={handleRefresh}
							onDelete={handleDelete}
							onShare={(credential) => setSharingCredential(credential)}
						/>
					)}
				</div>
			</Container>
			<CredentialModalPartial
				isOpen={isCredentialModalOpen}
				onClose={handleCloseCredentialModal}
				onSave={handleCreateCredential}
				onUpdate={handleUpdateCredential}
				editCredential={credentialDetail}
				isFetchingCredential={!!editingCredential && isCredentialDetailLoading}
				isLoading={
					createCredential.isPending ||
					updateCredential.isPending ||
					oauthPopup.isPending ||
					shareCredentialMutation.isPending
				}
				configuredOAuthProviders={configuredOAuthProviders}
				workspaceMembers={members}
				isLoadingMembers={isMembersLoading}
			/>
			<CredentialShareModalPartial
				isOpen={!!sharingCredential}
				onClose={() => setSharingCredential(null)}
				credential={sharingCredentialDetail || sharingCredential}
				members={members}
				currentUserId={userData?.id}
				isLoading={
					isSharingCredentialDetailLoading ||
					shareCredentialMutation.isPending ||
					unshareCredentialMutation.isPending ||
					updateSharingScope.isPending
				}
				onSubmit={handleShareSubmit}
			/>
		</>
	);
};

export default CredentialsListPage;
