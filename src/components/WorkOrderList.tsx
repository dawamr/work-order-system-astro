import React, { useEffect, useState, useRef } from 'react';
import TableView from './work-order-views/TableView';
import KanbanView from './work-order-views/KanbanView';
import CalendarView from './work-order-views/CalendarView';
import { operatorsAPI, workOrderAPI } from '../utils/api';
import Button from './Button';
import PopupCard from './PopupCard';
import type { WorkOrder } from '../types/workOrders';
import type { UserRole } from '../types/userRole';
import type { Operator } from '../types/user';
import { localStorageOperations } from '../utils/localStorage';
import Loading from './Loading';
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

interface WorkOrderListProps {
  type: UserRole;
}

const WorkOrderList: React.FC<WorkOrderListProps> = ({ type }) => {
  // State variables
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [operatorFilter, setOperatorFilter] = useState<string>(''); // Used for API filtering
  const [operators, setOperators] = useState<Operator[]>([]);
  const [operatorId, setOperatorId] = useState<string>(''); // Used for UI (selected operator display)
  const [operatorSearchTerm, setOperatorSearchTerm] = useState<string>('');
  const [quantityFilter, setQuantityFilter] = useState<number | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOperatorDropdownOpen, setIsOperatorDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status options for the filter dropdown
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

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
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError('Authentication error. Please try again.');
    }
  };

  // Fetch work orders with updated parameters
  const fetchWorkOrders = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (quantityFilter !== null) params.quantity = quantityFilter;
      if (deadlineFilter) params.production_deadline = deadlineFilter;

      let response: WorkOrderListResponse;
      if (type === 'production_manager') {
        // Production Manager: Fetch all work orders
        if (operatorFilter) params.operator_id = operatorFilter;
        response = await workOrderAPI.getAll(params);
      } else {
        // Operator: Fetch assigned work orders
        response = await workOrderAPI.getAssigned(page, 10, statusFilter);
      }

      setWorkOrders(response.work_orders);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch work orders');
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch operators
  const fetchOperators = async () => {
    try {
      const response = await operatorsAPI.getAll();
      setOperators(response.operators || []);
    } catch (error) {
      console.error('Error fetching operators:', error);
      setError('Failed to load operators. Please try again.');
    }
  };

  // Filter operators based on search term
  const filteredOperators = operators.filter((operator) =>
    operator.username.toLowerCase().includes(operatorSearchTerm.toLowerCase()),
  );

  // Get selected operator name
  const selectedOperator = operators.find((op) => op.id.toString() === operatorId);

  // useEffect for fetching operators (runs once on mount)
  useEffect(() => {
    if (type === 'production_manager') {
      fetchOperators();
    }
  }, [type]);

  // useEffect for fetching work orders (triggered by filter changes)
  useEffect(() => {
    fetchWorkOrders(currentPage);
  }, [currentPage, searchQuery, statusFilter, operatorFilter, quantityFilter, deadlineFilter, type]);

  // Event listener for refreshWorkOrders
  useEffect(() => {
    const handleRefresh = () => fetchWorkOrders(currentPage);
    document.addEventListener('refreshWorkOrders', handleRefresh);
    return () => document.removeEventListener('refreshWorkOrders', handleRefresh);
  }, [currentPage, type]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOperatorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowClick = (workOrder: WorkOrder) => {
    window.location.href = `/work-orders/${workOrder.id}`;
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    console.log('Edit work order:', workOrder);
  };

  const handleDeleteWorkOrder = (workOrder: WorkOrder) => {
    if (window.confirm(`Are you sure you want to delete work order ${workOrder.work_order_number}?`)) {
      console.log('Delete work order:', workOrder);
    }
  };

  // Kanban view helpers
  const getWorkOrdersByStatus = () => {
    const statusGroups: { [key: string]: WorkOrder[] } = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };
    workOrders.forEach((order) => {
      statusGroups[order.status]?.push(order) || (statusGroups[order.status] = [order]);
    });
    return statusGroups;
  };

  const getWorkOrdersByOperator = () => {
    const operatorGroups: { [key: string]: WorkOrder[] } = {};
    workOrders.forEach((order) => {
      const operatorId = order.operator.id.toString();
      operatorGroups[operatorId] = operatorGroups[operatorId] || [];
      operatorGroups[operatorId].push(order);
    });
    return operatorGroups;
  };

  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Filter Section */}
        <div className='mb-4'>
          <button
            className='flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-md'
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              />
            </svg>
            Add Filter
          </button>

          {/* Dropdown with Autosizing */}
          <div
            className={`absolute z-10 mt-2 w-1/3 bg-gray-800 text-white rounded-md shadow-lg border border-blue-500 overflow-y-auto filter-dropdown transition-all duration-300 ease-in-out ${
              showFilterDropdown
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            } ${isOperatorDropdownOpen ? 'h-[23rem]' : 'h-[15rem]'}`}
          >
            {/* Search Bar */}
            <div className='p-2 border-b border-gray-700'>
              <div className='flex items-center'>
                <svg className='w-5 h-5 text-gray-400 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <input
                  type='text'
                  placeholder='Search product or work number...'
                  className='w-full bg-gray-700 text-white rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Filter Categories */}
            <div className='p-2'>
              {/* Operator Filter */}
              {/* type !== 'operator' */}
              {type !== 'operator' && (
                <div
                  className={`flex justify-between items-center p-2 rounded-md ${operatorFilter ? 'bg-gray-700' : ''}`}
                >
                  <label className='text-sm font-medium w-1/4'>Operator:</label>
                  <div className='w-full' ref={dropdownRef}>
                    <button
                      type='button'
                      className='block w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm bg-white dark:bg-gray-700 flex justify-between items-center'
                      onClick={() => setIsOperatorDropdownOpen(!isOperatorDropdownOpen)}
                    >
                      <span className={`${selectedOperator ? '' : 'text-gray-400'}`}>
                        {selectedOperator ? selectedOperator.username : 'Select an operator'}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                          isOperatorDropdownOpen ? 'transform rotate-180' : ''
                        }`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
                      </svg>
                    </button>

                    {isOperatorDropdownOpen && (
                      <div className='absolute z-11 mt-1 w-80 bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 py-1 max-h-60 overflow-auto transform transition-all duration-200 ease-in-out'>
                        <div className='px-3 py-2 sticky top-0 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600'>
                          <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                              <svg
                                className='h-4 w-4 text-gray-400'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                ></path>
                              </svg>
                            </div>
                            <input
                              type='text'
                              className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white'
                              placeholder='Search operators...'
                              value={operatorSearchTerm}
                              onChange={(e) => setOperatorSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <div>
                          {filteredOperators.length > 0 ? (
                            filteredOperators.map((operator) => (
                              <div
                                key={operator.id}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                  operatorId === operator.id.toString()
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : ''
                                }`}
                                onClick={() => {
                                  setOperatorFilter(operator.id.toString());
                                  setOperatorId(operator.id.toString());
                                  setIsOperatorDropdownOpen(false);
                                  setOperatorSearchTerm('');
                                  setCurrentPage(1);
                                }}
                              >
                                <div className='flex items-center'>
                                  <div className='h-6 w-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mr-3'>
                                    {operator.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className='text-sm font-medium text-truncate'>{operator.username}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className='px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center'>
                              No operators found
                            </div>
                          )}
                        </div>

                        {operators.length > 10 && filteredOperators.length > 5 && (
                          <div className='px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600'>
                            Showing {filteredOperators.length} of {operators.length} operators
                          </div>
                        )}
                      </div>
                    )}

                    <select
                      id='operator'
                      className='opacity-0 absolute h-0 w-0'
                      value={operatorId}
                      onChange={() => {}}
                      required
                    >
                      <option value=''>Select an operator</option>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.id.toString()}>
                          {operator.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Status Filter */}
              <div className={`flex justify-between items-center p-2 rounded-md ${statusFilter ? 'bg-gray-700' : ''}`}>
                <label className='text-sm font-medium w-1/4'>Status:</label>
                <select
                  className='bg-gray-700 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
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

              {/* Quantity Filter */}

              {/* Deadline Filter */}
              <div
                className={`flex justify-between items-center p-2 rounded-md ${deadlineFilter ? 'bg-gray-700' : ''}`}
              >
                <label className='text-sm font-medium w-1/4'>Deadline:</label>
                <input
                  type='date'
                  className='bg-gray-700 w-full rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={deadlineFilter}
                  onChange={(e) => {
                    setDeadlineFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className='mb-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm'>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setViewMode('table')}
            >
              <svg className='w-5 h-5 inline-block mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
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
              <svg className='w-5 h-5 inline-block mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2'
                />
              </svg>
              Kanban Status
            </button>
            {type !== 'operator' && (
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'kanban-operator'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => setViewMode('kanban-operator')}
              >
                <svg className='w-5 h-5 inline-block mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
                Kanban Operator
              </button>
            )}
            <button
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              <svg className='w-5 h-5 inline-block mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Views */}
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
          onCardClick={handleRowClick as (workOrder: WorkOrder) => void}
        />
      )}
      {viewMode === 'kanban-operator' && type !== 'operator' && (
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
                .filter((page) => page === 1 || page === pagination.pages || Math.abs(currentPage - page) <= 2)
                .map((page, index, array) => {
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
