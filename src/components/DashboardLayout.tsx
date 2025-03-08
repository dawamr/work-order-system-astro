import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { localStorageOperations } from '../utils/localStorage';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  userRole: 'production_manager' | 'operator' | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
  userRole: initialUserRole,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(initialUserRole);

  // Prevent hydration mismatch by only rendering client-specific elements after mount
  // and fetch userRole if not provided in props
  useEffect(() => {
    setIsClient(true);

    const fetchUserRole = async () => {
      // If we have a valid user role from props, use it
      if (initialUserRole) {
        setUserRole(initialUserRole);
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

    fetchUserRole();

    // Listen for userRole data attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-user-role' &&
          mutation.target === document.body
        ) {
          const newRole = document.body.getAttribute('data-user-role');
          if (newRole === 'production_manager' || newRole === 'operator') {
            setUserRole(newRole as 'production_manager' | 'operator');
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, [initialUserRole]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
      {isClient && <Sidebar userRole={userRole} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}

      <div className={`flex flex-col transition-all duration-300 ease-in-out ${isClient ? 'md:pl-64' : ''}`}>
        <Header toggleSidebar={toggleSidebar} title={title} />

        <main className='flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>{children}</main>

        <footer className='py-4 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700'>
          <div className='max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400'>
            &copy; {new Date().getFullYear()} Work Order Management System
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
