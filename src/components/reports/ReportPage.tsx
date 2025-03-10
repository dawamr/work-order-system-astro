import React, { useState, useEffect } from 'react';
import ReportFilter from './ReportFilter';
import ReportTable from './ReportTable';
import type { ReportSummary } from '../../types/report';
import { reportsAPI } from '../../utils/api';
import { localStorageOperations } from '../../utils/localStorage';
import Loading from '../Loading';
import { format } from 'date-fns';
interface ReportPageProps {
  onExportPdf?: () => void;
  onExportExcel?: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ onExportPdf, onExportExcel }) => {
  const [data, setData] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>('Semua Waktu');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check authentication
      const authData = localStorageOperations.getAuth();
      if (!authData?.token || authData.user.role !== 'production_manager') {
        // Redirect to login in client-side
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

      setIsAuthenticated(true);
      // Load initial data
      await loadReportData();
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError('Authentication error. Please try again.');
    }
  };

  const loadReportData = async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data from API
      const response = await reportsAPI.getSummary(startDate, endDate);
      const reportData = response.summary as ReportSummary[];

      setData(reportData);

      // Format period text
      let periodText = `${format(new Date(), 'yyyy')}`;
      if (startDate && endDate) {
        periodText = `${startDate} - ${endDate}`;
      }
      setPeriod(periodText);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Error loading data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = (startDate: string, endDate: string) => {
    loadReportData(startDate, endDate);
  };

  const handleExportPdf = () => {
    if (onExportPdf) {
      onExportPdf();
    } else {
      alert('Export feature is not available yet');
    }
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    } else {
      alert('Export feature is not available yet');
    }
  };

  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header with Export Buttons */}
      <div className='mb-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Work Order Reports</h1>
        <div className='flex space-x-2'>
          <button
            onClick={handleExportPdf}
            className='inline-flex items-center rounded bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out'
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
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              ></path>
            </svg>
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className='inline-flex items-center rounded bg-green-600 dark:bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out'
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
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              ></path>
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <ReportFilter onApplyFilter={handleApplyFilter} />

      {/* Error Message */}
      {error && (
        <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50'>
          <p className='text-center text-sm text-red-600 dark:text-red-400'>{error}</p>
        </div>
      )}

      {/* Table Component */}
      <ReportTable data={data} isLoading={isLoading} period={period} />

      {/* Data Visualization */}
      <div className='mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='p-4'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>Visualisasi Data</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
              <h4 className='text-md font-medium mb-2 text-gray-700 dark:text-gray-300'>
                Distribusi Work Order per Status
              </h4>
              <div id='statusChart' className='h-64'></div>
            </div>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
              <h4 className='text-md font-medium mb-2 text-gray-700 dark:text-gray-300'>Achievement Rate per Produk</h4>
              <div id='achievementChart' className='h-64'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
