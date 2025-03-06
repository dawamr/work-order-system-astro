import React, { useEffect, useState } from 'react';
import { localStorageOperations } from '../utils/localStorage';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  userRole: 'production_manager' | 'operator' | null;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole: propUserRole, isOpen, toggleSidebar }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<'production_manager' | 'operator' | null>(propUserRole);

  // Handle initial mount and prop changes
  useEffect(() => {
    setIsMounted(true);

    // Check for userRole in props or data attribute as fallback
    const checkUserRole = async () => {
      // If prop is provided and valid, use it
      if (propUserRole) {
        setUserRole(propUserRole);
        return;
      }

      // Try to get from data attribute
      const dataRole = document.body.getAttribute('data-user-role');
      if (dataRole === 'production_manager' || dataRole === 'operator') {
        setUserRole(dataRole as 'production_manager' | 'operator');
        return;
      }

      // Last resort: try to get from localStorage directly
      try {
        const authData = localStorageOperations.getAuth();
        if (authData?.user?.role) {
          const role = authData.user.role;
          if (role === 'production_manager' || role === 'operator') {
            setUserRole(role);
          }
        }
      } catch (error) {
        console.error('Error getting user role:', error);
      }
    };

    checkUserRole();

    // Add event listener for logout button
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Add event listener to close sidebar on window resize (if in mobile view)
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        toggleSidebar();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      // Clean up event listeners
      if (logoutBtn) {
        logoutBtn.removeEventListener('click', handleLogout);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, toggleSidebar, propUserRole]);

  // Close the sidebar when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleSidebar]);

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

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 transition-all duration-300 ease-in-out md:hidden
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
        aria-hidden='true'
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
          bg-white dark:bg-gray-800 text-gray-700 dark:text-white shadow-lg
          w-[280px] md:w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className='flex flex-col h-full'>
          {/* Sidebar header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-bold'>Work Order System</h2>
            <div className='flex items-center space-x-2'>
              <ThemeToggle />
              <button
                onClick={toggleSidebar}
                className='p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 md:hidden'
                aria-label='Close sidebar'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar navigation */}
          <nav className='flex-grow py-5 px-4 overflow-y-auto custom-scrollbar'>
            <div className='space-y-1'>
              {/* Always show Dashboard for any authenticated user */}
              <SidebarLink href='/dashboard' icon='dashboard'>
                Dashboard
              </SidebarLink>

              {userRole === 'production_manager' && (
                <>
                  <SidebarLink href='/work-orders' icon='work-orders'>
                    Work Orders
                  </SidebarLink>
                  <SidebarLink href='/reports' icon='reports'>
                    Reports
                  </SidebarLink>
                </>
              )}

              {userRole === 'operator' && (
                <SidebarLink href='/assigned-orders' icon='work-orders'>
                  My Work Orders
                </SidebarLink>
              )}

              {/* Display message if no role is detected yet */}
              {!userRole && (
                <div className='px-4 py-2 text-sm text-gray-500 dark:text-gray-400'>Loading menu items...</div>
              )}
            </div>

            {/* User info section */}
            <div className='mt-10 pt-4 border-t border-gray-200 dark:border-gray-700'>
              <div className='flex items-center px-3 py-2 mb-3 rounded-md'>
                <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3'>
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
                <div className='overflow-hidden'>
                  <p className='text-sm font-medium text-truncate'>User</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400 text-truncate'>{userRole || 'Loading...'}</p>
                </div>
              </div>
            </div>
          </nav>

          {/* Logout button */}
          <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
            <button
              id='sidebar-logout-btn'
              className='flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <svg
                className='w-5 h-5 mr-3'
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
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: 'dashboard' | 'work-orders' | 'reports';
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, children }) => {
  const isActive = typeof window !== 'undefined' && window.location.pathname === href;

  const getIcon = () => {
    switch (icon) {
      case 'dashboard':
        return (
          <svg
            className='w-5 h-5 mr-3'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
            />
          </svg>
        );
      case 'work-orders':
        return (
          <svg
            className='w-5 h-5 mr-3'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
            />
          </svg>
        );
      case 'reports':
        return (
          <svg
            className='w-5 h-5 mr-3'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <a
      href={href}
      className={`flex items-center px-4 py-2.5 rounded-md transition-colors text-sm font-medium
        ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      {getIcon()}
      {children}
    </a>
  );
};

export default Sidebar;
