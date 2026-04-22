import { FC } from 'react';
import classNames from 'classnames';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import type { IServiceWithStatus } from '@/config/services.config';

interface IServiceCardPartialProps {
	service: IServiceWithStatus;
	isSelected: boolean;
	onSelect: (service: IServiceWithStatus) => void;
}

const ServiceCardPartial: FC<IServiceCardPartialProps> = ({ service, isSelected, onSelect }) => {
	const isDisabled = !service.isAvailable;

	return (
		<button
			key={service.id}
			type='button'
			disabled={isDisabled}
			onClick={() => onSelect(service)}
			className={classNames(
				'relative flex min-h-24 items-start gap-3 rounded-lg border p-3 text-left transition-colors',
				isSelected
					? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
					: isDisabled
						? 'cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-60 dark:border-zinc-800 dark:bg-zinc-900'
						: 'border-zinc-200 hover:border-blue-400 dark:border-zinc-800 dark:hover:border-blue-500',
			)}>
			<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'>
				<Icon icon={service.icon} className='text-xl' />
			</div>
			<div className='min-w-0 flex-1'>
				<div className='truncate font-semibold text-zinc-900 dark:text-white'>
					{service.name}
				</div>
				<div className='mt-1 line-clamp-2 text-xs text-zinc-500'>
					{service.description || service.category}
				</div>
			</div>
			{service.authType === 'oauth' && (
				<Badge
					variant={service.isAvailable ? 'soft' : 'outline'}
					color={service.isAvailable ? 'violet' : 'zinc'}
					className='absolute top-2 right-2 text-[10px]'>
					{service.isAvailable ? 'OAuth' : 'Setup needed'}
				</Badge>
			)}
		</button>
	);
};

export default ServiceCardPartial;
