import { FC, ReactNode } from 'react';
import Input from '@/components/form/Input';
import Textarea from '@/components/form/Textarea';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Icon from '@/components/icon/Icon';
import type { IServiceWithStatus } from '@/config/services.config';
import type { ICredentialDetail } from '@/types/credential.type';

interface IConfigurePartialProps {
	selectedService: IServiceWithStatus | null;
	credentialName: string;
	setCredentialName: (value: string) => void;
	description: string;
	setDescription: (value: string) => void;
	formData: Record<string, string | number>;
	onFieldChange: (fieldName: string, value: string | number) => void;
	isEditMode: boolean;
	isFetchingCredential: boolean;
	isLoading: boolean;
	isFormValid: boolean;
	editCredential?: ICredentialDetail | null;
	onOAuthConnect: () => void;
	footer?: ReactNode;
}

const ConfigurePartial: FC<IConfigurePartialProps> = ({
	selectedService,
	credentialName,
	setCredentialName,
	description,
	setDescription,
	formData,
	onFieldChange,
	isEditMode,
	isFetchingCredential,
	isLoading,
	isFormValid,
	editCredential,
	onOAuthConnect,
	footer,
}) => {
	if (isFetchingCredential && isEditMode) {
		return (
			<div className='flex h-full items-center justify-center'>
				<Spinner color='primary' />
			</div>
		);
	}

	if (!selectedService) {
		return (
			<div className='flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500'>
				Select a service to configure credentials.
			</div>
		);
	}

	const isOAuth = selectedService.authType === 'oauth';

	return (
		<div className='space-y-5 overflow-y-auto p-6'>
			<div className='flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800'>
				<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white'>
					<Icon icon={selectedService.icon} className='text-2xl' />
				</div>
				<div className='min-w-0 flex-1'>
					<div className='font-semibold text-zinc-900 dark:text-white'>
						{selectedService.name}
					</div>
					<div className='text-sm text-zinc-500'>
						{selectedService.description || selectedService.category}
					</div>
				</div>
				<Badge variant='outline' color={isOAuth ? 'violet' : 'zinc'}>
					{isOAuth ? 'OAuth 2.0' : selectedService.credentialType.replace('_', ' ')}
				</Badge>
			</div>

			<div>
				<label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
					Credential name
				</label>
				<Input
					name='credential-name'
					placeholder='Production API key'
					value={credentialName}
					onChange={(event) => setCredentialName(event.target.value)}
				/>
			</div>

			<div>
				<label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
					Description
				</label>
				<Textarea
					placeholder='Where this credential is used'
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					rows={2}
				/>
			</div>

			{isOAuth ? (
				<div className='space-y-4'>
					<div className='rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300'>
						{isEditMode
							? 'OAuth credentials can update name and description here. Reconnect by creating a new credential or using refresh from the table action.'
							: `Connect ${selectedService.name} through the secure OAuth 2.0 flow.`}
					</div>
					{!isEditMode && (
						<Button
							variant='solid'
							color='primary'
							icon='Link01'
							className='w-full'
							isLoading={isLoading}
							isDisable={!isFormValid}
							onClick={onOAuthConnect}>
							Connect with {selectedService.name}
						</Button>
					)}
					{editCredential?.token_expires_at && (
						<div className='rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800'>
							<span className='text-zinc-500'>Token expires: </span>
							<span className='font-medium text-zinc-900 dark:text-white'>
								{new Date(editCredential.token_expires_at * 1000).toLocaleString()}
							</span>
						</div>
					)}
				</div>
			) : (
				<div className='space-y-4'>
					{selectedService.fields?.map((field) => (
						<div key={field.name}>
							<label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
								{field.label}
								{field.required && <span className='text-red-500'> *</span>}
							</label>
							{field.type === 'textarea' ? (
								<Textarea
									placeholder={field.placeholder}
									value={String(formData[field.name] ?? '')}
									onChange={(event) =>
										onFieldChange(field.name, event.target.value)
									}
									rows={4}
									className='font-mono text-sm'
								/>
							) : (
								<Input
									name={field.name}
									type={field.type}
									placeholder={field.placeholder}
									value={String(formData[field.name] ?? '')}
									onChange={(event) =>
										onFieldChange(
											field.name,
											field.type === 'number'
												? Number(event.target.value)
												: event.target.value,
										)
									}
								/>
							)}
							{field.helpText && (
								<p className='mt-1 text-xs text-zinc-500'>{field.helpText}</p>
							)}
						</div>
					))}
					{selectedService.helpUrl && !isEditMode && (
						<a
							href={selectedService.helpUrl}
							target='_blank'
							rel='noreferrer'
							className='inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600'>
							<Icon icon='Link01' />
							View {selectedService.name} docs
						</a>
					)}
				</div>
			)}

			{footer}
		</div>
	);
};

export default ConfigurePartial;
