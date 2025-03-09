import React, { useEffect, useState } from 'react';
import { CardStat } from './Card';
import { workOrderAPI, reportsAPI } from '../utils/api';
import PopupCard from './PopupCard';
import Loading from './Loading';
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
        const response = await reportsAPI.getSummaryDashboard();
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
    return <Loading />;
  }

  return (
    <div>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <CardStat title='Pending' value={getStatusCount('pending')} className='border-l-4 border-yellow-500' />
        <CardStat title='In Progress' value={getStatusCount('in_progress')} className='border-l-4 border-blue-500' />
        <CardStat title='Completed' value={getStatusCount('completed')} className='border-l-4 border-green-500' />
        <CardStat title='Total Work Orders' value={getStatusCount('total')} className='border-l-4 border-purple-500' />
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-xl font-semibold text-gray-800 dark:text-white'>Recent Activity</h2>
        <div className='rounded-lg bg-white p-4 shadow-md'>
          <p className='text-center text-gray-500'>No recent activity found.</p>
        </div>
      </div>

      <PopupCard message={error || ''} type='error' isOpen={showPopup && !!error} onClose={() => setShowPopup(false)} />
    </div>
  );
};

export default DashboardContent;
