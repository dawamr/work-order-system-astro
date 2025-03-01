import React, { useEffect, useState } from 'react';
import { CardStat } from './Card';
import { workOrderAPI, reportsAPI } from '../utils/api';
import PopupCard from './PopupCard';

interface WorkOrderSummary {
  status: string;
  count: number;
  quantity: number;
}

const DashboardContent: React.FC = () => {
  const [summaryData, setSummaryData] = useState<WorkOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await reportsAPI.getSummary();
        setSummaryData(response.summary);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching summary data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setShowPopup(true);
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  // Find counts for different statuses
  const getStatusCount = (status: string): number => {
    const item = summaryData.find((item) => item.status === status);
    return item ? item.count : 0;
  };

  // Find quantities for different statuses
  const getStatusQuantity = (status: string): number => {
    const item = summaryData.find((item) => item.status === status);
    return item ? item.quantity : 0;
  };

  if (isLoading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='flex items-center'>
          <svg
            className='h-8 w-8 animate-spin text-blue-500'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          <span className='ml-2 text-lg font-medium text-gray-700'>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <CardStat title='Pending Orders' value={getStatusCount('pending')} className='border-l-4 border-yellow-500' />
        <CardStat title='In Progress' value={getStatusCount('in_progress')} className='border-l-4 border-blue-500' />
        <CardStat title='Completed' value={getStatusCount('completed')} className='border-l-4 border-green-500' />
        <CardStat
          title='Total Products'
          value={getStatusQuantity('pending') + getStatusQuantity('in_progress') + getStatusQuantity('completed')}
          className='border-l-4 border-purple-500'
        />
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-xl font-semibold text-gray-800'>Recent Activity</h2>
        <div className='rounded-lg bg-white p-4 shadow-md'>
          <p className='text-center text-gray-500'>No recent activity found.</p>
        </div>
      </div>

      <PopupCard message={error || ''} type='error' isOpen={showPopup && !!error} onClose={() => setShowPopup(false)} />
    </div>
  );
};

export default DashboardContent;
