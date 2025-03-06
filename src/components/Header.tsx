import React from 'react';
import ThemeToggle from './ThemeToggle';
import { localStorageOperations } from '../utils/localStorage';

interface HeaderProps {
  toggleSidebar: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title = 'Dashboard' }) => {
  const handleLogout = async () => {
    try {
      await localStorageOperations.clearAuth();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing auth data:', error);
      // Fallback to redirect even if clearing fails
      window.location.href = '/login';
    }
  };

  return (
    <header className='sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm'>
      <div className='px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
        <div className='flex items-center'>
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className='mr-4 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden'
            aria-label='Open sidebar'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>

          {/* Page title */}
          <h1 className='text-xl font-semibold text-gray-800 dark:text-white truncate'>{title}</h1>
        </div>

        <div className='flex items-center space-x-3'>
          {/* Theme toggle */}
          <ThemeToggle />

          {/* User profile dropdown */}
          <div className='relative'>
            <button
              type='button'
              className='flex text-sm bg-gray-200 dark:bg-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600'
              id='user-menu-button'
              aria-expanded='false'
            >
              <span className='sr-only'>Open user menu</span>
              <div className='w-8 h-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 overflow-hidden'>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className='p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            aria-label='Logout'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
