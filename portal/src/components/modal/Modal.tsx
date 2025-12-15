import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, width = "w-full md:max-w-[1000px]", title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-2" style={{zIndex: 998}}>
      <div className={`bg-white rounded-lg shadow-lg w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center rounded-t-lg">
          {title && <h2 className="font-semibold text-lg">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-auto"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
