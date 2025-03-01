import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, helperText, className = '', ...props }, ref) => {
    const inputClasses = `px-3 py-2 bg-white dark:bg-gray-700 border shadow-sm border-slate-300 dark:border-gray-600
      placeholder-slate-400 dark:placeholder-gray-400 text-gray-900 dark:text-white
      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${fullWidth ? 'w-full' : ''}
      ${className}`;

    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={props.id} className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{error}</p>}
        {helperText && !error && <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
