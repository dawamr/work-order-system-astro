import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { format, formatDistanceToNow } from 'date-fns';
import { workOrderAPI } from '../utils/api';
import type { WorkOrder } from '../types/workOrders';
import Button from './Button';
import { FaEdit, FaPlus, FaTrash, FaInfoCircle, FaComment } from 'react-icons/fa';
import AddNoteForm from './work-order-views/AddNoteForm';

interface WorkOrderDetailProps {
  id: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  user: {
    id: number;
    username: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  action: 'update' | 'create' | 'delete' | 'custom';
  entity_id: number;
  entity_type: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  note: string;
  created_at: string;
}

const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ id }) => {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const workOrderResponse = await workOrderAPI.getById(Number(id));
      setWorkOrder(workOrderResponse.work_order);
      const logsResponse = await workOrderAPI.getAuditLogs(Number(id));
      setAuditLogs(logsResponse.logs || []);
    } catch (err: any) {
      setError('Failed to load work order details and logs.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Fungsi untuk memformat note dengan styling khusus
  const formatNote = (note: string) => {
    const words = note.split(' ');
    return words.map((word, index) => {
      if (word.includes('@') || word.includes('#')) {
        return (
          <span key={index} className='text-blue-600 dark:text-blue-400 font-medium'>
            {word}{' '}
          </span>
        );
      }
      return <span key={index}>{word} </span>;
    });
  };

  const renderLogContent = (log: AuditLog) => {
    if (log.action === 'custom') {
      return (
        <div className='space-y-1'>
          <p className='text-sm text-gray-600 dark:text-gray-300'>{formatNote(log.note)}</p>
        </div>
      );
    }

    return (
      <div className='space-y-1'>
        {(log.old_values && Object.keys(log.old_values).length > 0) ||
        (log.new_values && Object.keys(log.new_values).length > 0) ? (
          <div className='mt-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-md p-2'>
            <ul className='space-y-1 list-disc list-inside'>
              {formatChanges(log.old_values || {}, log.new_values || {}).map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  };

  const formatChanges = (oldValues: Record<string, any>, newValues: Record<string, any>) => {
    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    allKeys.forEach((key) => {
      const oldValue = oldValues[key];
      const newValue = newValues[key];
      if (oldValue !== newValue) {
        changes.push(`${key}: ${oldValue} → ${newValue}`);
      }
    });
    return changes;
  };

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'update':
        return (
          <div className='h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
            <FaEdit className='text-blue-600 dark:text-blue-400' size={16} />
          </div>
        );
      case 'create':
        return (
          <div className='h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
            <FaPlus className='text-green-600 dark:text-green-400' size={16} />
          </div>
        );
      case 'delete':
        return (
          <div className='h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
            <FaTrash className='text-red-600 dark:text-red-400' size={16} />
          </div>
        );
      case 'custom':
        return (
          <div className='h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
            <FaComment className='text-purple-600 dark:text-purple-400' size={16} />
          </div>
        );
      default:
        return (
          <div className='h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center'>
            <FaInfoCircle className='text-gray-600 dark:text-gray-400' size={16} />
          </div>
        );
    }
  };

  const handleNoteSuccess = () => {
    setShowAddNote(false);
    fetchData();
  };

  if (isLoading) {
    return (
      <Card>
        <p>Loading work order details...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className='text-red-500'>{error}</p>
      </Card>
    );
  }

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Work Order Info - 2 columns */}
      <div className='lg:col-span-2 space-y-6'>
        <Card className='hover:shadow-lg transition-shadow duration-200'>
          <div className='px-6 py-4'>
            <div className='font-bold text-xl mb-2 text-gray-900 dark:text-white'>Work Order Information</div>
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              <div className='py-2 flex items-center'>
                <span className='text-gray-700 dark:text-gray-300 mr-2'>WO Number:</span>
                <p className='text-gray-900 dark:text-gray-100 font-medium'>{workOrder?.work_order_number}</p>
              </div>
              <div className='py-2 flex items-center'>
                <span className='text-gray-700 dark:text-gray-300 mr-2'>Product:</span>
                <p className='text-gray-900 dark:text-gray-100 font-medium'>{workOrder?.product_name}</p>
              </div>
              <div className='py-2 flex items-center'>
                <span className='text-gray-700 dark:text-gray-300 mr-2'>Quantity:</span>
                <p className='text-gray-900 dark:text-gray-100 font-medium'>{workOrder?.quantity}</p>
              </div>
              <div className='py-2 flex items-center'>
                <span className='text-gray-700 dark:text-gray-300 mr-2'>Deadline:</span>
                <p className='text-gray-900 dark:text-gray-100 font-medium'>
                  {workOrder?.production_deadline &&
                    format(new Date(workOrder.production_deadline), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div className='py-2 flex items-center'>
                <span className='text-gray-700 dark:text-gray-300 mr-2'>Status:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    statusColor[workOrder?.status as keyof typeof statusColor]
                  }`}
                >
                  {workOrder?.status}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className='hover:shadow-lg transition-shadow duration-200'>
          <div className='px-6 py-4'>
            <div className='font-bold text-xl mb-2 text-gray-900 dark:text-white'>Operator Information</div>
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              <div className='py-2 flex items-center'>
                <span className='text-gray-700 dark:text-gray-300 mr-2'>Username:</span>
                <p className='text-gray-900 dark:text-gray-100 font-medium'>{workOrder?.operator.username}</p>
              </div>
              <div className='py-2 flex items-center'>
                <span className='text-gray-700 dark:text-gray-300 mr-2'>Operator ID:</span>
                <p className='text-gray-900 dark:text-gray-100 font-medium'>{workOrder?.operator.id}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Log Section - 1 column */}
      <div className='lg:col-span-1'>
        <Card className='hover:shadow-lg transition-shadow duration-200'>
          <div className='px-6 py-4'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Activity Log</h2>
              <Button variant='secondary' size='sm' onClick={() => setShowAddNote(true)} className='flex items-center'>
                <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                Add Note
              </Button>
            </div>

            <AddNoteForm
              workOrderId={Number(id)}
              onSuccess={handleNoteSuccess}
              onCancel={() => setShowAddNote(false)}
              isVisible={showAddNote}
            />

            {/* Log Timeline */}
            <div className='space-y-4'>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className='flex space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
                >
                  {getLogIcon(log.action)}
                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-1'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {log.user.username}
                        <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>({log.user.role})</span>
                      </p>
                    </div>
                    {renderLogContent(log)}
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkOrderDetail;
