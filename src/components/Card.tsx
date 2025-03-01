import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', footer }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className='px-6 py-4 border-b bg-gray-50'>
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
        </div>
      )}
      <div className='px-6 py-4'>{children}</div>
      {footer && <div className='px-6 py-3 bg-gray-50 border-t'>{footer}</div>}
    </div>
  );
};

interface CardStatProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const CardStat: React.FC<CardStatProps> = ({ title, value, icon, trend, trendValue, className = '' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-sm font-medium text-gray-500 truncate'>{title}</p>
          <p className='mt-1 text-3xl font-semibold text-gray-900'>{value}</p>
        </div>
        {icon && <div className='text-gray-400'>{icon}</div>}
      </div>

      {trend && trendValue && (
        <div className='mt-4'>
          <p className={`text-sm ${getTrendColor()} flex items-center`}>
            {trend === 'up' && (
              <svg
                className='w-4 h-4 mr-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
              </svg>
            )}
            {trend === 'down' && (
              <svg
                className='w-4 h-4 mr-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 14l-7 7m0 0l-7-7m7 7V3' />
              </svg>
            )}
            {trendValue}
          </p>
        </div>
      )}
    </div>
  );
};

export default { Card, CardStat };
