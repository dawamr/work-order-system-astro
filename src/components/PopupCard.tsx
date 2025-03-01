import React, { useEffect } from 'react';

export type PopupType = 'success' | 'error' | 'warning' | 'info';

interface PopupCardProps {
  message: string;
  type?: PopupType;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const getIconByType = (type: PopupType) => {
  switch (type) {
    case 'success':
      return (
        <svg
          className='w-6 h-6 text-green-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
        </svg>
      );
    case 'error':
      return (
        <svg
          className='w-6 h-6 text-red-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
        </svg>
      );
    case 'warning':
      return (
        <svg
          className='w-6 h-6 text-yellow-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
          ></path>
        </svg>
      );
    case 'info':
      return (
        <svg
          className='w-6 h-6 text-blue-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          ></path>
        </svg>
      );
    default:
      return null;
  }
};

const getBackgroundByType = (type: PopupType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-white border-gray-200';
  }
};

export const PopupCard: React.FC<PopupCardProps> = ({
  message,
  type = 'info',
  isOpen,
  onClose,
  autoClose = true,
  autoCloseTime = 5000,
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseTime, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <div
        className={`p-4 rounded-lg shadow-lg border ${getBackgroundByType(
          type,
        )} max-w-md transition-all transform duration-300 ease-in-out`}
        role='alert'
      >
        <div className='flex items-start'>
          <div className='flex-shrink-0'>{getIconByType(type)}</div>
          <div className='ml-3 flex-1'>
            <p className='text-sm font-medium text-gray-800'>{message}</p>
          </div>
          <button type='button' className='ml-4 text-gray-400 hover:text-gray-500 focus:outline-none' onClick={onClose}>
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupCard;
