import { FC, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { IServiceWithStatus, SERVICES } from '@/config/services.config';
import type {
	ICredentialDetail,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	TSharingScope,
} from '@/types/credential.type';
import type { TWorkspaceMember } from '@/types/workspace.type';
import {
	buildCredentialData,
	findServiceForCredential,
	getCredentialDataSource,
} from '../_helper/credentials.helper';
import ServicePickerPartial from './CredentialModal.ServicePicker.partial';
import ConfigurePartial from './CredentialModal.Configure.partial';
import SharingSelectorPartial from './SharingSelector.partial';

type TAddStep = 'select' | 'configure';

interface ICredentialModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (values: ICreateCredentialDto, selectedUserIds?: string[]) => Promise<void> | void;
	onUpdate?: (values: IUpdateCredentialDto) => Promise<void> | void;
	isLoading?: boolean;
	configuredOAuthProviders?: string[];
	workspaceMembers?: TWorkspaceMember[];
	isLoadingMembers?: boolean;
	editCredential?: ICredentialDetail | null;
	isFetchingCredential?: boolean;
}

const CredentialModalPartial: FC<ICredentialModalPartialProps> = ({
	isOpen,
	onClose,
	onSave,
	onUpdate,
	isLoading = false,
	configuredOAuthProviders = [],
	workspaceMembers = [],
	isLoadingMembers = false,
	editCredential = null,
	isFetchingCredential = false,
}) => {
	const isEditMode = !!editCredential;
	const [addStep, setAddStep] = useState<TAddStep>('select');
	const [selectedService, setSelectedService] = useState<IServiceWithStatus | null>(null);
	const [credentialName, setCredentialName] = useState('');
	const [description, setDescription] = useState('');
	const [formData, setFormData] = useState<Record<string, string | number>>({});
	const [sharingScope, setSharingScope] = useState<TSharingScope>('workspace');
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const servicesWithStatus: IServiceWithStatus[] = useMemo(
		() =>
			SERVICES.map((service) => {
				const isOAuthService = service.authType === 'oauth';
				const isOAuthConfigured = service.oauthProvider
					? configuredOAuthProviders.includes(service.oauthProvider)
					: undefined;
				return {
					...service,
					isOAuthConfigured,
					isAvailable: !isOAuthService || !!isOAuthConfigured,
				};
			}),
		[configuredOAuthProviders],
	);

	const resetState = () => {
		setAddStep('select');
		setSelectedService(null);
		setCredentialName('');
		setDescription('');
		setFormData({});
		setSharingScope('workspace');
		setSelectedUserIds([]);
	};

	useEffect(() => {
		if (!isOpen) return;
		if (!editCredential) {
			resetState();
			return;
		}

		const service = findServiceForCredential(editCredential);
		setSelectedService(service);
		setAddStep('configure');
		setCredentialName(editCredential.name);
		setDescription(editCredential.description || '');
		setSharingScope(editCredential.sharing_scope);

		const dataSource = getCredentialDataSource(editCredential);
		const nextFormData: Record<string, string | number> = {};
		Object.entries(dataSource).forEach(([key, value]) => {
			if (typeof value === 'string' || typeof value === 'number')
				nextFormData[key] = value;
		});
		setFormData(nextFormData);
	}, [editCredential, isOpen]);

	const handleClose = () => {
		resetState();
		onClose();
	};

	const handleServiceSelect = (service: IServiceWithStatus) => {
		if (!service.isAvailable) return;

		const nextData: Record<string, string | number> = {};
		service.fields?.forEach((field) => {
			if (field.defaultValue !== undefined) nextData[field.name] = field.defaultValue;
		});

		setSelectedService(service);
		setCredentialName(service.defaultName || `My ${service.name}`);
		setDescription('');
		setFormData(nextData);
		setAddStep('configure');
	};

	const handleBack = () => {
		if (isEditMode) {
			handleClose();
			return;
		}
		setAddStep('select');
		setSelectedService(null);
	};

	const handleFieldChange = (fieldName: string, value: string | number) => {
		setFormData((current) => ({ ...current, [fieldName]: value }));
	};

	const toggleUserSelection = (userId: string) => {
		setSelectedUserIds((current) =>
			current.includes(userId)
				? current.filter((id) => id !== userId)
				: [...current, userId],
		);
	};

	const handleSubmit = async () => {
		if (!selectedService) return;

		if (isEditMode && onUpdate) {
			await onUpdate({
				name: credentialName.trim(),
				description: description.trim() || undefined,
				...(selectedService.authType !== 'oauth'
					? { data: buildCredentialData(selectedService, formData) }
					: {}),
			});
			return;
		}

		await onSave(
			{
				name: credentialName.trim(),
				type: selectedService.credentialType,
				description: description.trim() || undefined,
				data: buildCredentialData(selectedService, formData),
				sharing_scope: sharingScope,
			},
			sharingScope === 'specific' ? selectedUserIds : undefined,
		);
	};

	const handleOAuthConnect = async () => {
		if (!selectedService?.oauthProvider) return;
		await onSave(
			{
				name: credentialName.trim(),
				type: 'oauth2',
				description: description.trim() || undefined,
				data: { provider: selectedService.oauthProvider },
				sharing_scope: sharingScope,
			},
			sharingScope === 'specific' ? selectedUserIds : undefined,
		);
	};

	const isFormValid = useMemo(() => {
		if (!selectedService || !credentialName.trim()) return false;
		if (selectedService.authType === 'oauth') return true;
		return (
			selectedService.fields?.every((field) => {
				if (!field.required) return true;
				const value = formData[field.name];
				return value !== undefined && value !== '';
			}) ?? true
		);
	}, [credentialName, formData, selectedService]);

	const showFooter =
		addStep === 'configure' &&
		!!selectedService &&
		(selectedService.authType !== 'oauth' || isEditMode);

	const sharingSelector = !isEditMode ? (
		<SharingSelectorPartial
			sharingScope={sharingScope}
			setSharingScope={setSharingScope}
			selectedUserIds={selectedUserIds}
			toggleUser={toggleUserSelection}
			workspaceMembers={workspaceMembers}
			isLoadingMembers={isLoadingMembers}
		/>
	) : null;

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size={900} isScrollable isCentered>
			<ModalHeader className='border-b border-zinc-200 dark:border-zinc-800'>
				<div className='flex w-full items-center justify-between pr-4'>
					<div className='flex items-center gap-3'>
						{addStep === 'configure' && (
							<Button
								icon='ArrowLeft01'
								variant='outline'
								dimension='sm'
								onClick={handleBack}
							/>
						)}
						<div>
							<span>
								{isEditMode
									? 'Edit Credential'
									: addStep === 'select'
										? 'Select Service'
										: 'Configure Credential'}
							</span>
							<p className='text-sm font-normal text-zinc-500'>
								{isEditMode
									? 'Update credential details'
									: 'Choose OAuth, API key, basic auth, bearer, or custom credentials'}
							</p>
						</div>
					</div>
					<div className='hidden items-center gap-2 md:flex'>
						<Badge variant='outline' color='zinc'>
							{SERVICES.length} services
						</Badge>
						<Badge variant='outline' color='violet'>
							{configuredOAuthProviders.length} OAuth ready
						</Badge>
					</div>
				</div>
			</ModalHeader>
			<ModalBody className='p-0'>
				<div className='h-[620px] overflow-hidden'>
					<AnimatePresence mode='wait'>
						{addStep === 'select' ? (
							<motion.div
								key='select'
								initial={{ opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 12 }}
								className='h-full'>
								<ServicePickerPartial
									servicesWithStatus={servicesWithStatus}
									selectedService={selectedService}
									onSelect={handleServiceSelect}
								/>
							</motion.div>
						) : (
							<motion.div
								key='configure'
								initial={{ opacity: 0, x: 12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -12 }}
								className='h-full'>
								<ConfigurePartial
									selectedService={selectedService}
									credentialName={credentialName}
									setCredentialName={setCredentialName}
									description={description}
									setDescription={setDescription}
									formData={formData}
									onFieldChange={handleFieldChange}
									isEditMode={isEditMode}
									isFetchingCredential={isFetchingCredential}
									isLoading={isLoading}
									isFormValid={isFormValid}
									editCredential={editCredential}
									onOAuthConnect={handleOAuthConnect}
									footer={sharingSelector}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</ModalBody>
			<ModalFooter className={classNames({ hidden: !showFooter })}>
				<Button variant='outline' onClick={handleClose} isDisable={isLoading}>
					Cancel
				</Button>
				<Button
					variant='solid'
					icon='Tick02'
					onClick={handleSubmit}
					isLoading={isLoading}
					isDisable={!isFormValid || isFetchingCredential}>
					{isEditMode ? 'Save Changes' : 'Save Credential'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default CredentialModalPartial;
