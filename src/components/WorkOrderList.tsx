import React, { useEffect, useState } from 'react';
import Table from './Table';
import type { TableColumn } from './Table';
import { workOrderAPI } from '../utils/api';
import { Card } from './Card';
import PopupCard from './PopupCard';
import Button from './Button';
import { statusLabels } from '../types/workOrders';
import type { WorkOrder } from '../types/workOrders';

// Komponen untuk mode tampilan berbeda
import TableView from './work-order-views/TableView';
import KanbanView from './work-order-views/KanbanView';
import CalendarView from './work-order-views/CalendarView';

interface WorkOrderListProps {
  type: 'manager' | 'operator';
}

// Enum untuk mode tampilan
type ViewMode = 'table' | 'kanban-status' | 'kanban-operator' | 'calendar';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface WorkOrderListResponse {
  error: boolean;
  work_orders: WorkOrder[];
  pagination: Pagination;
}

const WorkOrderList: React.FC<WorkOrderListProps> = ({ type }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const fetchWorkOrders = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: WorkOrderListResponse = await workOrderAPI.getAll(page, statusFilter);
      setWorkOrders(response.work_orders);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch work orders');
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders(currentPage);
  }, [currentPage, statusFilter]);

  // Add event listener for refreshWorkOrders
  useEffect(() => {
    const handleRefresh = () => {
      fetchWorkOrders(currentPage);
    };

    document.addEventListener('refreshWorkOrders', handleRefresh);

    return () => {
      document.removeEventListener('refreshWorkOrders', handleRefresh);
    };
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowClick = (workOrder: WorkOrder) => {
    // Navigate to work order detail page
    window.location.href = `/work-orders/${workOrder.id}`; // Pastikan ini sesuai dengan path Anda
  };

  // Helper functions for Kanban View
  const getWorkOrdersByStatus = () => {
    const statusGroups: { [key: string]: WorkOrder[] } = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };

    workOrders.forEach((order) => {
      if (statusGroups[order.status]) {
        statusGroups[order.status].push(order);
      } else {
        // Handle any unexpected status
        statusGroups[order.status] = [order];
      }
    });

    return statusGroups;
  };

  const getWorkOrdersByOperator = () => {
    const operatorGroups: { [key: string]: WorkOrder[] } = {};

    workOrders.forEach((order) => {
      const operatorId = order.operator.id.toString();
      if (!operatorGroups[operatorId]) {
        operatorGroups[operatorId] = [];
      }
      operatorGroups[operatorId].push(order);
    });

    return operatorGroups;
  };

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    console.log('Edit work order:', workOrder);
    // Event akan ditangani oleh script di work-orders.astro
  };

  const handleDeleteWorkOrder = (workOrder: WorkOrder) => {
    if (window.confirm(`Are you sure you want to delete work order ${workOrder.work_order_number}?`)) {
      // Implementasi delete
      console.log('Delete work order:', workOrder);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Status filter */}
        <div className='w-full sm:w-auto'>
          <select
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View mode selector */}
        <div className='flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm'>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => setViewMode('table')}
          >
            <svg
              className='w-5 h-5 inline-block mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
              ></path>
            </svg>
            Table
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'kanban-status'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => setViewMode('kanban-status')}
          >
            <svg
              className='w-5 h-5 inline-block mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2'
              ></path>
            </svg>
            Kanban Status
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'kanban-operator'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => setViewMode('kanban-operator')}
          >
            <svg
              className='w-5 h-5 inline-block mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
              ></path>
            </svg>
            Kanban Operator
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => setViewMode('calendar')}
          >
            <svg
              className='w-5 h-5 inline-block mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              ></path>
            </svg>
            Calendar
          </button>
        </div>
      </div>

      {/* Tampilkan view yang sesuai berdasarkan mode yang dipilih */}
      {viewMode === 'table' && (
        <TableView
          workOrders={workOrders}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          onEditClick={handleEditWorkOrder}
          onDeleteClick={handleDeleteWorkOrder}
        />
      )}

      {viewMode === 'kanban-status' && (
        <KanbanView
          groups={getWorkOrdersByStatus()}
          groupBy='status'
          isLoading={isLoading}
          onCardClick={handleRowClick}
        />
      )}

      {viewMode === 'kanban-operator' && (
        <KanbanView
          groups={getWorkOrdersByOperator()}
          groupBy='operator'
          isLoading={isLoading}
          onCardClick={handleRowClick}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView workOrders={workOrders} isLoading={isLoading} onEventClick={handleRowClick} />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className='mt-4 flex justify-center'>
          <div className='flex space-x-2'>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant='secondary'
              size='sm'
            >
              Previous
            </Button>

            <div className='flex items-center space-x-1'>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return page === 1 || page === pagination.pages || Math.abs(currentPage - page) <= 2;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className='px-2 text-gray-500'>...</span>
                        <Button
                          variant={currentPage === page ? 'primary' : 'secondary'}
                          size='sm'
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'secondary'}
                      size='sm'
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
            </div>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              variant='secondary'
              size='sm'
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <PopupCard message={error || ''} type='error' isOpen={showPopup && !!error} onClose={() => setShowPopup(false)} />
    </div>
  );
};

export default WorkOrderList;
