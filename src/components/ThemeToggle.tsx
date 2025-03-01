import React, { useEffect, useState } from 'react';
import { configDBOperations } from '../utils/indexedDB';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from IndexedDB or system preference
  useEffect(() => {
    const initTheme = async () => {
      try {
        // Check if theme is stored in IndexedDB
        const savedTheme = await configDBOperations.getSetting('theme');

        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        } else {
          setIsDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error getting theme from IndexedDB:', error);
        // Fallback to system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        }
      }
    };

    initTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      if (isDarkMode) {
        // Switch to light mode
        document.documentElement.classList.remove('dark');
        await configDBOperations.saveSetting('theme', 'light');
        setIsDarkMode(false);
      } else {
        // Switch to dark mode
        document.documentElement.classList.add('dark');
        await configDBOperations.saveSetting('theme', 'dark');
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error('Error saving theme to IndexedDB:', error);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className='p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none'
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        // Sun icon for light mode
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
            d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>
      ) : (
        // Moon icon for dark mode
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
            d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
