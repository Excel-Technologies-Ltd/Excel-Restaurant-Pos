import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { IoCloseSharp } from 'react-icons/io5';

interface ModalProps {
	isOpen: boolean;
	closeModal: () => void;
	children: React.ReactNode;
	maxWidth?: string; // New prop for custom max-width
}

const Modal = ({
	isOpen,
	closeModal,
	children,
	maxWidth = 'max-w-md',
}: ModalProps) => {
	useEffect(() => {
		if (!isOpen) return;
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={closeModal}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black opacity-50" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center relative">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel
								className={`${maxWidth} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all mx-auto`}
							>
								<button
									className="absolute top-3 right-5 text-xl md:text-2xl"
									onClick={closeModal}
								>
									<IoCloseSharp />
								</button>

								{children}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default Modal;
