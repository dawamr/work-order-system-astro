import React from 'react';
import Button from './Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black bg-opacity-50 transition-opacity' onClick={onClose}></div>

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
          <div className='px-4 pb-4 pt-5 sm:p-6'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10'>
                <svg
                  className='h-6 w-6 text-red-600 dark:text-red-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
                  />
                </svg>
              </div>
              <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                <h3 className='text-lg font-semibold leading-6 text-gray-900 dark:text-white'>{title}</h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
            <Button variant='danger' onClick={onConfirm} isLoading={isLoading} className='w-full sm:w-auto sm:ml-3'>
              Delete
            </Button>
            <Button
              variant='secondary'
              onClick={onClose}
              disabled={isLoading}
              className='mt-3 w-full sm:w-auto sm:mt-0'
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
