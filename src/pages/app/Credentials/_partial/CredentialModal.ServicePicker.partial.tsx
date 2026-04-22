import { FC, useMemo, useState } from 'react';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Icon from '@/components/icon/Icon';
import {
	IServiceWithStatus,
	TServiceCategory,
	searchServices,
} from '@/config/services.config';
import { CATEGORY_ICONS, CATEGORY_ORDER } from '../_helper/credentials.constants';
import ServiceCardPartial from './CredentialModal.ServiceCard.partial';

interface IServicePickerPartialProps {
	servicesWithStatus: IServiceWithStatus[];
	selectedService: IServiceWithStatus | null;
	onSelect: (service: IServiceWithStatus) => void;
}

const ServicePickerPartial: FC<IServicePickerPartialProps> = ({
	servicesWithStatus,
	selectedService,
	onSelect,
}) => {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredServices = useMemo(() => {
		if (!searchQuery) return servicesWithStatus;
		return searchServices(searchQuery).map(
			(service) =>
				servicesWithStatus.find((candidate) => candidate.id === service.id) || {
					...service,
					isAvailable: true,
				},
		);
	}, [searchQuery, servicesWithStatus]);

	const servicesByCategory = useMemo(() => {
		const grouped: Partial<Record<TServiceCategory, IServiceWithStatus[]>> = {};
		filteredServices.forEach((service) => {
			grouped[service.category] = [...(grouped[service.category] || []), service];
		});
		return grouped;
	}, [filteredServices]);

	return (
		<div className='flex h-full flex-col'>
			<div className='border-b border-zinc-200 p-4 dark:border-zinc-800'>
				<FieldWrap firstSuffix={<Icon icon='Search02' className='text-zinc-400' />}>
					<Input
						name='credential-service-search'
						variant='solid'
						dimension='sm'
						placeholder='Search services...'
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
					/>
				</FieldWrap>
			</div>
			<div className='min-h-0 flex-1 overflow-y-auto p-4'>
				{searchQuery ? (
					<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
						{filteredServices.map((service) => (
							<ServiceCardPartial
								key={service.id}
								service={service}
								isSelected={selectedService?.id === service.id}
								onSelect={onSelect}
							/>
						))}
					</div>
				) : (
					<div className='space-y-6'>
						{CATEGORY_ORDER.filter(
							(category) => servicesByCategory[category]?.length,
						).map((category) => (
							<div key={category}>
								<div className='mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
									<Icon
										icon={CATEGORY_ICONS[category]}
										className='text-zinc-400'
									/>
									{category}
									<span className='text-xs font-normal text-zinc-400'>
										{servicesByCategory[category]?.length}
									</span>
								</div>
								<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
									{servicesByCategory[category]?.map((service) => (
										<ServiceCardPartial
											key={service.id}
											service={service}
											isSelected={selectedService?.id === service.id}
											onSelect={onSelect}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				)}
				{filteredServices.length === 0 && (
					<div className='py-14 text-center text-sm text-zinc-500'>
						No services found.
					</div>
				)}
			</div>
		</div>
	);
};

export default ServicePickerPartial;
