import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/icon/Icon';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	accentColor?: string; // e.g., 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500'
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	accentColor = 'bg-editorial-ink',
}) => {
	return (
		<AnimatePresence>
			{isOpen && (
				<div className='fixed inset-0 z-[100] flex items-center justify-center p-6'>
					{/* 1. The "Ghost" Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className='absolute inset-0 bg-editorial-ink/40 backdrop-blur-sm'
					/>

					{/* 2. The Brutalist Container */}
					<motion.div
						initial={{ scale: 0.95, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0, y: 20 }}
						transition={{ type: 'spring', damping: 25, stiffness: 350 }}
						className='relative w-full max-w-2xl border-2 border-editorial-ink bg-white shadow-[12px_12px_0px_rgba(26,26,26,0.15)] rounded-none overflow-hidden'>
						{/* Header Strip */}
						<div className={`border-b-2 border-editorial-ink p-6 flex items-center justify-between ${accentColor} text-white`}>
							<h2 className='font-serif font-black italic text-2xl uppercase tracking-tight'>
								{title}
							</h2>
							<button
								onClick={onClose}
								className='rounded-none border border-white p-2 transition-all hover:bg-white hover:text-editorial-ink'
								aria-label='Close modal'>
								<Icon icon='Cancel01' className='text-sm' />
							</button>
						</div>

						{/* Content Area */}
						<div className='max-h-[70vh] overflow-y-auto bg-white p-8'>
							{children}
						</div>

						{/* Footer / Actions */}
						<div className='border-t border-editorial-ink bg-editorial-bg p-6 flex justify-end gap-4'>
							<button
								onClick={onClose}
								className='px-6 py-2 text-[10px] font-black uppercase tracking-widest text-editorial-ink/60 hover:text-editorial-ink transition-colors'>
								Cancel
							</button>
							<button className='rounded-none bg-editorial-ink px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_rgba(26,26,26,0.35)] transition-all hover:bg-opacity-90 active:translate-x-1 active:translate-y-1 active:shadow-none'>
								Save Changes
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};

export default Modal;
