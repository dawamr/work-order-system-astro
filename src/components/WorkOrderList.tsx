import React, { useEffect, useState } from 'react';
import Table from './Table';
import type { TableColumn } from './Table';
import { workOrderAPI } from '../utils/api';
import { Card } from './Card';
import PopupCard from './PopupCard';
import Button from './Button';

interface WorkOrder {
  id: number;
  work_order_number: string;
  product_name: string;
  quantity: number;
  production_deadline: string;
  status: string;
  operator: {
    id: number;
    username: string;
  };
}

interface WorkOrderListProps {
  type: 'manager' | 'operator';
}

const WorkOrderList: React.FC<WorkOrderListProps> = ({ type }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWorkOrders();
  }, [type, statusFilter, currentPage]);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    try {
      const response =
        type === 'manager'
          ? await workOrderAPI.getAll(currentPage, 10, statusFilter || undefined)
          : await workOrderAPI.getAssigned(currentPage, 10, statusFilter || undefined);

      setWorkOrders(response.work_orders);
      setTotalPages(response.pagination.pages);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching work orders:', err);
      setError('Failed to load work orders. Please try again later.');
      setShowPopup(true);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-gray-100 text-gray-800',
    };

    const statusKey = status.toLowerCase().replace(/\s+/g, '_') as keyof typeof statusClasses;
    const className = statusClasses[statusKey] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const handleRowClick = (workOrder: WorkOrder) => {
    window.location.href = `/work-orders/${workOrder.id}`;
  };

  const columns: TableColumn<WorkOrder>[] = [
    {
      header: 'WO Number',
      accessor: 'work_order_number',
    },
    {
      header: 'Product',
      accessor: 'product_name',
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
    },
    {
      header: 'Deadline',
      accessor: (workOrder) => formatDate(workOrder.production_deadline),
    },
    {
      header: 'Status',
      accessor: (workOrder) => getStatusBadge(workOrder.status),
    },
    {
      header: 'Operator',
      accessor: (workOrder) => workOrder.operator?.username || 'Not assigned',
    },
  ];

  return (
    <div>
      <div className='mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <label className='mr-2 text-sm font-medium text-gray-700'>Filter by Status:</label>
          <select
            className='rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value=''>All</option>
            <option value='pending'>Pending</option>
            <option value='in_progress'>In Progress</option>
            <option value='completed'>Completed</option>
          </select>
        </div>

        <div className='flex gap-2'>
          <Button onClick={() => fetchWorkOrders()} variant='secondary' size='sm'>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <Table
          data={workOrders}
          columns={columns}
          isLoading={isLoading}
          emptyMessage='No work orders found.'
          onRowClick={handleRowClick}
        />
      </Card>

      {totalPages > 1 && (
        <div className='mt-4 flex justify-center'>
          <div className='flex space-x-2'>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant='secondary'
              size='sm'
            >
              Previous
            </Button>
            <span className='px-4 py-2 text-sm'>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
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
