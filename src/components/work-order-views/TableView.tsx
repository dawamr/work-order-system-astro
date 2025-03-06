import React, { useState } from 'react';
import Table from '../Table';
import type { TableColumn } from '../Table';
import { Card } from '../Card';
import { format } from 'date-fns';
import Button from '../Button';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { workOrderAPI } from '../../utils/api';

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

interface TableViewProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  onRowClick: (workOrder: WorkOrder) => void;
  onEditClick?: (workOrder: WorkOrder) => void;
  onDeleteClick?: (workOrder: WorkOrder) => void;
}

interface CustomTableColumn<T> extends TableColumn<T> {
  cell?: (value: any, row?: T) => React.ReactNode;
}

const TableView: React.FC<TableViewProps> = ({ workOrders, isLoading, onRowClick, onEditClick, onDeleteClick }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedWorkOrder) return;

    setIsDeleting(true);
    try {
      await workOrderAPI.delete(selectedWorkOrder.id);

      // Dispatch refresh event
      const refreshEvent = new CustomEvent('refreshWorkOrders');
      document.dispatchEvent(refreshEvent);

      setShowDeleteModal(false);
      setSelectedWorkOrder(null);
    } catch (error) {
      console.error('Error deleting work order:', error);
      // You might want to show an error message here
    } finally {
      setIsDeleting(false);
    }
  };

  // Column definitions for the table
  const columns: CustomTableColumn<WorkOrder>[] = [
    {
      header: 'WO Number',
      accessor: 'work_order_number',
      cell: (value) => <span className='font-medium'>{value}</span>,
    },
    {
      header: 'Product Name',
      accessor: 'product_name',
      cell: (value) => <span className='text-truncate max-w-[200px] block'>{value}</span>,
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      cell: (value) => value.toLocaleString(),
    },
    {
      header: 'Deadline',
      accessor: 'production_deadline',
      cell: (value) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => {
        const statusClasses = {
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };

        const statusLabels = {
          pending: 'Pending',
          in_progress: 'In Progress',
          completed: 'Completed',
          cancelled: 'Cancelled',
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusClasses[value as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusLabels[value as keyof typeof statusLabels] || value}
          </span>
        );
      },
    },
    {
      header: 'Operator',
      accessor: 'operator',
      cell: (value) => (
        <div className='flex items-center'>
          <div className='h-7 w-7 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mr-2 text-xs font-medium'>
            {value.username.charAt(0).toUpperCase()}
          </div>
          <span>{value.username}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-center',
      cell: (_, row) => (
        <div className='flex justify-center space-x-2'>
          {onEditClick && (
            <Button
              variant='secondary'
              size='sm'
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent('openEditPanel', {
                  detail: { workOrder: row },
                });
                document.dispatchEvent(event);
                onEditClick(row);
              }}
            >
              <span className='flex items-center'>
                <svg
                  className='w-4 h-4 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                Edit
              </span>
            </Button>
          )}
          {onDeleteClick && (
            <Button
              variant='danger'
              size='sm'
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
            >
              <span className='flex items-center'>
                <svg
                  className='w-4 h-4 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Delete
              </span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Table
          data={workOrders}
          columns={columns as TableColumn<WorkOrder>[]}
          isLoading={isLoading}
          emptyMessage='No work orders found.'
          onRowClick={onRowClick}
        />
      </Card>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedWorkOrder(null);
        }}
        onConfirm={handleConfirmDelete}
        title='Delete Work Order'
        message={`Are you sure you want to delete work order ${selectedWorkOrder?.work_order_number}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default TableView;
