import React, { useState, useEffect } from 'react';
import type { ReportSummary } from '../../types/report';
import { formatNumber, calculateAchievementPercentage } from '../../utils/reportUtils';

interface ReportTableProps {
  data: ReportSummary[];
  isLoading: boolean;
  period: string;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, isLoading, period }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Pisahkan data total (elemen terakhir) dari data lainnya
  const displayData = data.length > 1 ? data.slice(0, -1) : [];
  const totalData = data.length > 0 ? data[data.length - 1] : null;

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const formatWorkOrderNumbers = (workOrderNumber: string) => {
    if (!workOrderNumber) return [];
    return workOrderNumber.includes(',') ? workOrderNumber.split(',').map((wo) => wo.trim()) : [workOrderNumber];
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <h2 className='text-xl font-bold text-gray-800 dark:text-white'>
          {/* Laporan Breakdown Workorder Berdasarkan Produk */}
          Report Breakdown Workorder Based on Product
        </h2>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Period: {period}</p>
      </div>

      <div className='p-4'>
        <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>Summary Per Product (All Status)</h3>

        {/* Desktop Table View */}
        <div className='hidden md:block'>
          <div className='overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent'>
            <div className='inline-block min-w-full align-middle'>
              <div className='overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                  <thead className='bg-gray-50 dark:bg-gray-700'>
                    <tr>
                      <th
                        scope='col'
                        className='sticky top-0 w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      ></th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Product Name
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Total WO
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Pending
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        In Progress
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Completed
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Cancelled
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Target Qty
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Achieved Qty
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Achievement %
                      </th>
                      <th
                        scope='col'
                        className='sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        % Total WO
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                    {isLoading ? (
                      <tr className='animate-pulse'>
                        <td colSpan={11} className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
                          Loading data...
                        </td>
                      </tr>
                    ) : displayData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
                          No data available
                        </td>
                      </tr>
                    ) : (
                      displayData.map((item, index) => {
                        const isExpanded = expandedRows[`product-${index}`] || false;
                        const woNumbers = formatWorkOrderNumbers(item.work_order_number);

                        return (
                          <React.Fragment key={index}>
                            <tr className='hover:bg-gray-50 dark:hover:bg-gray-700/50'>
                              <td className='px-3 py-4 whitespace-nowrap'>
                                <button
                                  className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none'
                                  onClick={() => toggleRow(`product-${index}`)}
                                >
                                  <svg
                                    className={`rotate-icon w-5 h-5 ${
                                      isExpanded ? 'expanded transform rotate-90' : ''
                                    }`}
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                    xmlns='http://www.w3.org/2000/svg'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth='2'
                                      d='M9 5l7 7-7 7'
                                    ></path>
                                  </svg>
                                </button>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                                {item.product_name}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {item.total_wo}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {item.pending}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {item.in_progress}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {item.completed}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {item.cancelled}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {formatNumber(item.target_qty)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {formatNumber(item.achieved_qty)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {item.achievement.toFixed(2)}%
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                {item.percentage.toFixed(2)}%
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className='child-row bg-gray-50 dark:bg-gray-800/50'>
                                <td colSpan={11} className='px-0 py-0'>
                                  <div className='pl-10 pr-4 py-3'>
                                    <div className='mb-2'>
                                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                        Work Order Numbers:
                                      </h4>
                                      <div className='flex flex-wrap gap-2'>
                                        {woNumbers.map((wo, idx) => (
                                          <span
                                            key={idx}
                                            className='inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded px-2 py-1 text-xs'
                                          >
                                            {wo}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                  {totalData && (
                    <tfoot className='bg-gray-50 dark:bg-gray-700 font-semibold'>
                      <tr>
                        <td className='px-3 py-3'></td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Total
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {totalData.total_wo}
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {totalData.pending}
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {totalData.in_progress}
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {totalData.completed}
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {totalData.cancelled}
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {formatNumber(totalData.target_qty)}
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {formatNumber(totalData.achieved_qty)}
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {totalData.achievement.toFixed(2)}%
                        </td>
                        <td className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          {totalData.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className='md:hidden mt-4 space-y-4'>
          {isLoading ? (
            <div className='animate-pulse p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg'>
              <div className='h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4'></div>
              <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2'></div>
              <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-2'></div>
              <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3'></div>
            </div>
          ) : displayData.length === 0 ? (
            <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400'>
              No data available
            </div>
          ) : (
            <>
              {displayData.map((item, index) => {
                const woNumbers = formatWorkOrderNumbers(item.work_order_number);
                return (
                  <div
                    key={index}
                    className='p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <h4 className='text-lg font-medium text-gray-900 dark:text-white'>{item.product_name}</h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.achievement >= 80
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                            : item.achievement >= 50
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                        }`}
                      >
                        {item.achievement.toFixed(2)}%
                      </span>
                    </div>

                    <div className='mb-3'>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>Work Order Numbers:</p>
                      <div className='relative'>
                        <div className='max-h-24 overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md'>
                          <div className='flex flex-wrap gap-1'>
                            {woNumbers.map((wo, idx) => (
                              <div
                                key={idx}
                                className='inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded px-1.5 py-0.5 text-xs mb-1'
                              >
                                {wo}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div className='text-gray-500 dark:text-gray-400'>Total WO:</div>
                      <div className='text-right font-medium text-gray-900 dark:text-white'>{item.total_wo}</div>

                      <div className='text-gray-500 dark:text-gray-400'>Target Qty:</div>
                      <div className='text-right font-medium text-gray-900 dark:text-white'>
                        {formatNumber(item.target_qty)}
                      </div>

                      <div className='text-gray-500 dark:text-gray-400'>Achieved Qty:</div>
                      <div className='text-right font-medium text-gray-900 dark:text-white'>
                        {formatNumber(item.achieved_qty)}
                      </div>
                    </div>

                    <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-700'>
                      <div className='grid grid-cols-4 gap-2 text-xs'>
                        <div className='text-center'>
                          <div className='font-medium text-gray-900 dark:text-white'>{item.pending}</div>
                          <div className='text-gray-500 dark:text-gray-400'>Pending</div>
                        </div>
                        <div className='text-center'>
                          <div className='font-medium text-gray-900 dark:text-white'>{item.in_progress}</div>
                          <div className='text-gray-500 dark:text-gray-400'>In Progress</div>
                        </div>
                        <div className='text-center'>
                          <div className='font-medium text-gray-900 dark:text-white'>{item.completed}</div>
                          <div className='text-gray-500 dark:text-gray-400'>Completed</div>
                        </div>
                        <div className='text-center'>
                          <div className='font-medium text-gray-900 dark:text-white'>{item.cancelled}</div>
                          <div className='text-gray-500 dark:text-gray-400'>Cancelled</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total Summary Card for Mobile */}
              {totalData && (
                <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50'>
                  <h4 className='font-medium text-blue-800 dark:text-blue-300 mb-2'>Total Summary</h4>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>Total WO:</div>
                    <div className='font-semibold text-right'>{totalData.total_wo}</div>
                    <div>Target Qty:</div>
                    <div className='font-semibold text-right'>{formatNumber(totalData.target_qty)}</div>
                    <div>Achieved Qty:</div>
                    <div className='font-semibold text-right'>{formatNumber(totalData.achieved_qty)}</div>
                    <div>Achievement:</div>
                    <div className='font-semibold text-right'>{totalData.achievement.toFixed(2)}%</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportTable;
