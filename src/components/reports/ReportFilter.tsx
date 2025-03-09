import React, { useEffect, useState } from 'react';
import { format, startOfYear } from 'date-fns';
interface ReportFilterProps {
  onApplyFilter: (startDate: string, endDate: string) => void;
}

const ReportFilter: React.FC<ReportFilterProps> = ({ onApplyFilter }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    // setStartDate is start of year and  set timezone gmt +7
    setStartDate(format(startOfYear(new Date()), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const handleApplyFilter = () => {
    onApplyFilter(startDate, endDate);
  };

  return (
    <div className='mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
      <h2 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>Filter Report</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label htmlFor='startDate' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Dateline From
          </label>
          <input
            type='date'
            id='startDate'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white'
          />
        </div>
        <div>
          <label htmlFor='endDate' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Dateline To
          </label>
          <input
            type='date'
            id='endDate'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white'
          />
        </div>
        <div className='flex items-end'>
          <button
            onClick={handleApplyFilter}
            className='inline-flex items-center rounded bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out'
          >
            <svg
              className='mr-2 h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              ></path>
            </svg>
            Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilter;
