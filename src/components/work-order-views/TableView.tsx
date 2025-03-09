import React, { useEffect, useState } from 'react';
import Table from '../Table';
import type { TableColumn } from '../Table';
import { format } from 'date-fns';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { workOrderAPI } from '../../utils/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import localStorageOperations from '../../utils/localStorage';
import type { WorkOrder } from '../../types/workOrders';
import type { UserRole } from '../../types/userRole';

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
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const authData = localStorageOperations.getAuth();
    if (authData?.user?.role) {
      setUserRole(authData.user.role as UserRole);
    }
  }, []);

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
      header: 'Work Order',
      accessor: 'work_order_number',
      cell: (value, row) => (
        <div className='text-gray-900 dark:text-gray-100'>
          <div className='font-medium'>{value}</div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>{row?.product_name}</div>
        </div>
      ),
    },
    {
      header: 'Target Quantity',
      accessor: 'target_quantity',
      cell: (value) => <span className='text-gray-900 dark:text-gray-100'>{value}</span>,
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      cell: (value) => <span className='text-gray-900 dark:text-gray-100'>{value}</span>,
    },
    {
      header: 'Deadline',
      accessor: 'production_deadline',
      cell: (value) => (
        <span className='text-gray-900 dark:text-gray-100'>{format(new Date(value), 'MMM dd, yyyy')}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => {
        const statusClasses = {
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };

        const statusLabels = {
          pending: 'Pending',
          in_progress: 'In Progress',
          completed: 'Completed',
          cancelled: 'Cancelled',
        };

        return (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center justify-center
              ${
                statusClasses[value as keyof typeof statusClasses] ||
                'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
          >
            {statusLabels[value as keyof typeof statusLabels] || value}
          </div>
        );
      },
    },
    {
      header: 'Operator',
      accessor: 'operator',
      cell: (value) => (
        <div className='flex items-center'>
          <div
            className='h-7 w-7 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300
                       rounded-full flex items-center justify-center mr-2 text-xs font-medium'
          >
            {value.username.charAt(0).toUpperCase()}
          </div>
          <span className='text-gray-900 dark:text-gray-100'>{value.username}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-center',
      cell: (_, row) => (
        <div className='flex justify-center space-x-2'>
          <button
            className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                     text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400
                     transition-colors duration-200'
            onClick={(e) => {
              e.stopPropagation();
              const event = new CustomEvent('openEditPanel', {
                detail: { workOrder: row },
              });
              document.dispatchEvent(event);
              if (row && onEditClick) {
                onEditClick(row);
              }
            }}
          >
            <span className='flex items-center'>
              <FaEdit className='w-4 h-4' />
            </span>
          </button>
          {userRole === 'production_manager' && (
            <button
              className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                     text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400
                     transition-colors duration-200'
              onClick={(e) => {
                e.stopPropagation();
                if (row) {
                  handleDeleteClick(row);
                }
              }}
            >
              <span className='flex items-center'>
                <FaTrash className='w-4 h-4' />
              </span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
      <Table columns={columns} data={workOrders} isLoading={isLoading} onRowClick={onRowClick} className='w-full' />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Work Order'
        message={`Are you sure you want to delete work order ${selectedWorkOrder?.work_order_number}?`}
      />
    </div>
  );
};

export default TableView;
