import React, { useState, useEffect } from 'react';
import ReportFilter from './ReportFilter';
import type { OperatorPerformance } from '../../types/report';
import { reportsAPI } from '../../utils/api';
import { localStorageOperations } from '../../utils/localStorage';
import Loading from '../Loading';
import { format } from 'date-fns';
import { formatNumber } from '../../utils/reportUtils';

interface PerformancePageProps {
  onExportPdf?: () => void;
  onExportExcel?: () => void;
}

const PerformancePage: React.FC<PerformancePageProps> = ({ onExportPdf, onExportExcel }) => {
  const [operatorData, setOperatorData] = useState<OperatorPerformance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>('Semua Waktu');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [expandedOperators, setExpandedOperators] = useState<Record<number, boolean>>({});

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
      await loadPerformanceData();
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError('Authentication error. Please try again.');
    }
  };

  const loadPerformanceData = async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data from API
      const response = await reportsAPI.getAllOperatorPerformance(startDate, endDate);
      const operators = response.performances as OperatorPerformance[];

      setOperatorData(operators);

      // Format period text
      let periodText = `${format(new Date(), 'yyyy')}`;
      if (startDate && endDate) {
        periodText = `${startDate} - ${endDate}`;
      }
      setPeriod(periodText);
    } catch (error) {
      console.error('Error loading performance data:', error);
      setError('Error loading data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = (startDate: string, endDate: string) => {
    loadPerformanceData(startDate, endDate);
  };

  const handleExportPdf = () => {
    if (onExportPdf) {
      onExportPdf();
    } else {
      alert('Export feature under development');
    }
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    } else {
      alert('Export feature under development');
    }
  };

  const toggleOperator = (operatorId: number) => {
    setExpandedOperators((prev) => ({
      ...prev,
      [operatorId]: !prev[operatorId],
    }));
  };

  // Calculate achievement percentage
  const calculateAchievement = (completed: number, total: number) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header with Export Buttons */}
      <div className='mb-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Operator Performance Report</h1>
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

      {/* Operator Performance Cards */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-white'>Operator Performance Details</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Period: {period}</p>
        </div>

        <div className='p-4'>
          {isLoading ? (
            <div className='animate-pulse space-y-4'>
              {[...Array(3)].map((_, index) => (
                <div key={index} className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                  <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4'></div>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2'></div>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
                </div>
              ))}
            </div>
          ) : operatorData.length === 0 ? (
            <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50'>
              <p className='text-center text-sm text-yellow-600 dark:text-yellow-400'>No operator data available.</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {operatorData.map((operator) => {
                const isExpanded = expandedOperators[operator.operator_id] || false;
                const achievementPercentage = calculateAchievement(operator.completed, operator.assigned);

                return (
                  <div
                    key={operator.operator_id}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'
                  >
                    {/* Operator Header */}
                    <div
                      className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        isExpanded ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                      onClick={() => toggleOperator(operator.operator_id)}
                    >
                      <div className='flex items-center space-x-3'>
                        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          <svg
                            className='w-5 h-5 text-gray-500 dark:text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path>
                          </svg>
                        </div>
                        <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>{operator.username}</h3>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='text-sm'>
                          <span className='text-gray-500 dark:text-gray-400'>Assigned:</span>{' '}
                          <span className='font-medium text-gray-900 dark:text-white'>{operator.assigned}</span>
                        </div>
                        <div className='text-sm'>
                          <span className='text-gray-500 dark:text-gray-400'>Completed:</span>{' '}
                          <span className='font-medium text-gray-900 dark:text-white'>{operator.completed}</span>
                        </div>
                        <div className='text-sm'>
                          <span className='text-gray-500 dark:text-gray-400'>Achievement:</span>{' '}
                          <span
                            className={`font-medium ${
                              achievementPercentage >= 80
                                ? 'text-green-600 dark:text-green-400'
                                : achievementPercentage >= 50
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {achievementPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className='p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700'>
                        <div className='overflow-x-auto'>
                          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                            <thead className='bg-gray-100 dark:bg-gray-800'>
                              <tr>
                                <th
                                  scope='col'
                                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                                >
                                  Status
                                </th>
                                <th
                                  scope='col'
                                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                                >
                                  Count
                                </th>
                                <th
                                  scope='col'
                                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                                >
                                  Percentage
                                </th>
                              </tr>
                            </thead>
                            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                              <tr className='hover:bg-gray-50 dark:hover:bg-gray-700/50'>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                                  Assigned
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                  {operator.assigned}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                  100%
                                </td>
                              </tr>
                              <tr className='hover:bg-gray-50 dark:hover:bg-gray-700/50'>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400'>
                                  In Progress
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                  {operator.in_progress}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                  {operator.assigned > 0
                                    ? ((operator.in_progress / operator.assigned) * 100).toFixed(2)
                                    : '0.00'}
                                  %
                                </td>
                              </tr>
                              <tr className='hover:bg-gray-50 dark:hover:bg-gray-700/50'>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400'>
                                  Completed
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                  {operator.completed}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                  {achievementPercentage.toFixed(2)}%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className='mt-4'>
                          <h4 className='text-md font-medium mb-2 text-gray-700 dark:text-gray-300'>
                            Total Quantity Produced: {formatNumber(operator.total_quantity)}
                          </h4>
                          <div className='h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                            <div
                              className={`h-full rounded-full ${
                                achievementPercentage >= 80
                                  ? 'bg-green-500'
                                  : achievementPercentage >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overall Performance Summary */}
      {!isLoading && operatorData.length > 0 && (
        <div className='mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-bold text-gray-800 dark:text-white'>Overall Performance Summary</h2>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {operatorData.map((operator) => {
                const achievementPercentage = calculateAchievement(operator.completed, operator.assigned);

                return (
                  <div
                    key={operator.operator_id}
                    className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'
                  >
                    <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>{operator.username}</h3>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>Assigned:</span>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>{operator.assigned}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>In Progress:</span>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>
                          {operator.in_progress}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>Completed:</span>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>{operator.completed}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>Achievement:</span>
                        <span
                          className={`text-sm font-medium ${
                            achievementPercentage >= 80
                              ? 'text-green-600 dark:text-green-400'
                              : achievementPercentage >= 50
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {achievementPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className='mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full ${
                          achievementPercentage >= 80
                            ? 'bg-green-500'
                            : achievementPercentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
