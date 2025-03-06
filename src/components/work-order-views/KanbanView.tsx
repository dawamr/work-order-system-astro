import React from 'react';
import { format } from 'date-fns';

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

interface KanbanViewProps {
  groups: { [key: string]: WorkOrder[] };
  groupBy: 'status' | 'operator';
  isLoading: boolean;
  onCardClick: (workOrder: WorkOrder) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ groups, groupBy, isLoading, onCardClick }) => {
  // Status display configurations
  const statusConfig = {
    pending: {
      title: 'Pending',
      color: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-900/50',
      headerColor: 'bg-yellow-100 dark:bg-yellow-900/40',
      textColor: 'text-yellow-800 dark:text-yellow-300',
    },
    in_progress: {
      title: 'In Progress',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
      headerColor: 'bg-blue-100 dark:bg-blue-900/40',
      textColor: 'text-blue-800 dark:text-blue-300',
    },
    completed: {
      title: 'Completed',
      color: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-900/50',
      headerColor: 'bg-green-100 dark:bg-green-900/40',
      textColor: 'text-green-800 dark:text-green-300',
    },
    cancelled: {
      title: 'Cancelled',
      color: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-900/50',
      headerColor: 'bg-red-100 dark:bg-red-900/40',
      textColor: 'text-red-800 dark:text-red-300',
    },
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  const renderWorkOrderCard = (workOrder: WorkOrder) => {
    return (
      <div
        key={workOrder.id}
        className='bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 mb-3 hover:shadow-md transition-shadow cursor-pointer'
        onClick={() => onCardClick(workOrder)}
      >
        <div className='p-3'>
          <div className='flex justify-between items-start mb-2'>
            <span className='text-sm font-semibold text-truncate max-w-[190px]'>{workOrder.product_name}</span>
            <span className='text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>
              {format(new Date(workOrder.production_deadline), 'MMM d')}
            </span>
          </div>

          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-gray-600 dark:text-gray-300'>{workOrder.work_order_number}</span>
            <span className='text-xs font-medium'>Qty: {workOrder.quantity}</span>
          </div>

          {groupBy === 'status' && (
            <div className='flex items-center mt-2'>
              <div className='h-6 w-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mr-2 text-xs'>
                {workOrder.operator.username.charAt(0).toUpperCase()}
              </div>
              <span className='text-xs truncate max-w-[160px]'>{workOrder.operator.username}</span>
            </div>
          )}

          {groupBy === 'operator' && (
            <div className='mt-2'>
              <span
                className={`px-2 py-1 rounded-full text-xs inline-block
                  ${statusConfig[workOrder.status as keyof typeof statusConfig]?.color || 'bg-gray-100'}
                  ${statusConfig[workOrder.status as keyof typeof statusConfig]?.textColor || 'text-gray-800'}`}
              >
                {statusConfig[workOrder.status as keyof typeof statusConfig]?.title || workOrder.status}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Special handling for operator groups
  const operatorNames: { [key: string]: string } = {};
  if (groupBy === 'operator') {
    // Extract operator names
    Object.keys(groups).forEach((groupKey) => {
      if (groups[groupKey].length > 0) {
        operatorNames[groupKey] = groups[groupKey][0].operator.username;
      }
    });
  }

  return (
    <div className='flex flex-col lg:flex-row gap-4 overflow-x-auto pb-2'>
      {Object.keys(groups).map((groupKey) => {
        // Skip empty groups for operator view
        if (groupBy === 'operator' && (!groups[groupKey] || groups[groupKey].length === 0)) {
          return null;
        }

        let title = '';
        let headerClasses = '';

        if (groupBy === 'status') {
          const status = statusConfig[groupKey];
          title = status?.title || groupKey;
          headerClasses = `${status?.headerColor || 'bg-gray-100'} ${status?.textColor || 'text-gray-800'}`;
        } else {
          title = operatorNames[groupKey] || 'Unknown';
          headerClasses = 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
        }

        return (
          <div key={groupKey} className='flex-shrink-0 w-full lg:w-72'>
            <div className={`rounded-t-md p-3 ${headerClasses} font-medium`}>
              <div className='flex justify-between items-center'>
                <span>{title}</span>
                <span className='text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full'>
                  {groups[groupKey]?.length || 0}
                </span>
              </div>
            </div>
            <div className='p-3 bg-gray-50 dark:bg-gray-800/40 rounded-b-md min-h-[150px] max-h-[70vh] overflow-y-auto'>
              {groups[groupKey] && groups[groupKey].length > 0 ? (
                groups[groupKey].map((workOrder) => renderWorkOrderCard(workOrder))
              ) : (
                <div className='text-center py-10 text-gray-500 dark:text-gray-400 text-sm'>No work orders</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
