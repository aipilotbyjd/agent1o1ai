import { FC, useMemo, useState } from 'react';
import classNames from 'classnames';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Spinner from '@/components/ui/Spinner';
import Icon from '@/components/icon/Icon';
import type { TSharingScope } from '@/types/credential.type';
import type { TWorkspaceMember } from '@/types/workspace.type';
import { SHARING_OPTIONS } from '../_helper/credentials.constants';

interface ISharingSelectorPartialProps {
	sharingScope: TSharingScope;
	setSharingScope: (scope: TSharingScope) => void;
	selectedUserIds: string[];
	toggleUser: (userId: string) => void;
	workspaceMembers: TWorkspaceMember[];
	isLoadingMembers?: boolean;
}

const SharingSelectorPartial: FC<ISharingSelectorPartialProps> = ({
	sharingScope,
	setSharingScope,
	selectedUserIds,
	toggleUser,
	workspaceMembers,
	isLoadingMembers = false,
}) => {
	const [memberSearchQuery, setMemberSearchQuery] = useState('');

	const filteredMembers = useMemo(() => {
		const query = memberSearchQuery.trim().toLowerCase();
		if (!query) return workspaceMembers;
		return workspaceMembers.filter(
			(member) =>
				member.name.toLowerCase().includes(query) ||
				member.email.toLowerCase().includes(query),
		);
	}, [memberSearchQuery, workspaceMembers]);

	return (
		<div className='border-t border-zinc-200 pt-5 dark:border-zinc-800'>
			<label className='mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300'>
				<Icon icon='Share01' className='text-zinc-400' />
				Sharing
			</label>
			<div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
				{SHARING_OPTIONS.map((option) => (
					<button
						key={option.value}
						type='button'
						onClick={() => setSharingScope(option.value)}
						className={classNames(
							'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors',
							sharingScope === option.value
								? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
								: 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400',
						)}>
						<Icon icon={option.icon} />
						{option.label}
					</button>
				))}
			</div>
			{sharingScope === 'specific' && (
				<div className='mt-3'>
					<FieldWrap firstSuffix={<Icon icon='Search02' className='text-zinc-400' />}>
						<Input
							name='credential-member-search'
							variant='solid'
							dimension='sm'
							placeholder='Search members...'
							value={memberSearchQuery}
							onChange={(event) => setMemberSearchQuery(event.target.value)}
						/>
					</FieldWrap>
					{isLoadingMembers ? (
						<div className='flex justify-center py-4'>
							<Spinner color='primary' />
						</div>
					) : filteredMembers.length === 0 ? (
						<div className='mt-2 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-500 dark:border-zinc-800'>
							No workspace members found.
						</div>
					) : (
						<div className='mt-2 max-h-36 space-y-1 overflow-y-auto'>
							{filteredMembers.map((member) => {
								const isSelected = selectedUserIds.includes(member.user_id);
								return (
									<button
										key={member.user_id}
										type='button'
										onClick={() => toggleUser(member.user_id)}
										className={classNames(
											'flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors',
											isSelected
												? 'bg-emerald-50 dark:bg-emerald-950/20'
												: 'hover:bg-zinc-50 dark:hover:bg-zinc-900',
										)}>
										<div>
											<div className='text-sm font-medium text-zinc-800 dark:text-zinc-100'>
												{member.name}
											</div>
											<div className='text-xs text-zinc-500'>
												{member.email}
											</div>
										</div>
										{isSelected && (
											<Icon icon='CheckmarkCircle02' color='emerald' />
										)}
									</button>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SharingSelectorPartial;
