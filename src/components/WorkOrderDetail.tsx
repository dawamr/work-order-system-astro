import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { workOrderAPI } from '../utils/api';
import { statusConfig, type ProgressLog, type WorkOrder } from '../types/workOrders';
import Button from './Button';
import { FaEdit, FaPlus, FaTrash, FaInfoCircle, FaComment } from 'react-icons/fa';
import AddNoteForm from './work-order-views/AddNoteForm';
import type { AuditLog } from '../types/auditLog';

interface WorkOrderDetailProps {
  id: string;
}

const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ id }) => {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [workProgressLogs, setWorkProgressLogs] = useState<ProgressLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const workOrderResponse = await workOrderAPI.getById(Number(id));
      setWorkOrder(workOrderResponse.work_order);
      const logsResponse = await workOrderAPI.getAuditLogs(Number(id));
      setAuditLogs(logsResponse.logs || []);
      const progressLogsResponse = await workOrderAPI.getProgress(Number(id));
      setWorkProgressLogs(progressLogsResponse.progress || []);
    } catch (err: any) {
      setError('Failed to load work order details and logs.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (getDuration: number) => {
    console.log(getDuration);
    const days = Math.floor(getDuration / 1440);
    const hours = Math.floor((getDuration % 1440) / 60);
    const minutes = getDuration % 60;
    let durationString = '';
    if (days > 0) {
      durationString += `${days}d `;
    }
    if (hours > 0) {
      durationString += `${hours}h `;
    }
    if (minutes >= 0) {
      durationString += `${minutes}m`;
    }
    console.log(durationString);
    return durationString;
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
          <span key={index} className='text-primary-600 dark:text-primary-400 font-medium'>
            {word}{' '}
          </span>
        );
      }
      return (
        <span key={index} className='text-gray-700 dark:text-gray-300'>
          {word}{' '}
        </span>
      );
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
      <Card className='dark:bg-gray-800 dark:text-white'>
        <p>Loading work order details...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='dark:bg-gray-800 dark:text-white'>
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
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        {/* Work Order Info - 2 columns */}
        <div className='lg:col-span-3 space-y-6'>
          <Card className='hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:text-white'>
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

          <Card className='hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:text-white'>
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

        <div className='lg:col-span-2'>
          {/* Work Progress */}
          <Card className='hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:text-white max-h-[510px]'>
            <div className='px-6 py-4'>
              <div className='flex items-center justify-between mb-4'>
                <div className='font-bold text-xl mb-2 text-gray-900 dark:text-white'>Work Progress</div>
                <Button variant='secondary' size='sm' className='flex items-center'>
                  <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  Add Progress
                </Button>
              </div>
              {/* Detail Work Progress */}
              <div className='flex items-center justify-between mb-4 '>
                <ol className='relative border-s border-gray-200 dark:border-gray-700 w-full overflow-y-auto max-h-[500px]'>
                  {workProgressLogs.length > 0 ? (
                    workProgressLogs.map((log, index) => {
                      // Determine if this is the last item
                      const isLastItem = index === workProgressLogs.length - 1;
                      // Get status color based on work order status if it's the last item
                      const statusColor = isLastItem && workOrder ? statusConfig[workOrder.status]?.color : '';

                      return (
                        <li key={log.id} className={`${!isLastItem ? 'mb-10' : ''} ms-4`}>
                          <div
                            className={`absolute w-3 h-3 ${
                              statusColor || 'bg-gray-200 dark:bg-gray-700'
                            } rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900`}
                          ></div>
                          <time className='mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500'>
                            {index === 0 ? '📌' : ''} {format(new Date(log.created_at), 'MMMM dd, yyyy HH:mm')}
                          </time>
                          <h5 className='text-lg font-semibold text-gray-900 dark:text-white'>
                            Quantity: {log.progress_quantity}
                          </h5>
                          <p
                            className={`${
                              !isLastItem ? 'mb-4' : ''
                            } mt-2 text-base font-normal text-gray-500 dark:text-gray-400`}
                          >
                            ✍️ {log.progress_desc} <br />
                            {index < workProgressLogs.length - 1 && (
                              <>
                                ⏱️ :{' '}
                                {calculateDuration(
                                  differenceInMinutes(
                                    new Date(log.created_at),
                                    new Date(workProgressLogs[index + 1].created_at),
                                  ),
                                )}
                              </>
                            )}
                          </p>
                        </li>
                      );
                    })
                  ) : (
                    <li className='ms-4'>
                      <div className='absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700'></div>
                      <p className='text-base font-normal text-gray-500 dark:text-gray-400'>
                        No progress logs available for this work order.
                      </p>
                    </li>
                  )}
                </ol>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Card className='hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:text-white'>
        <div className='px-6 py-4'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Activity & Log</h2>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => setShowAddNote(true)}
              className={`flex items-center ${showAddNote ? 'hidden' : ''}`}
            >
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

          {/* Log Timeline - Updated UI */}
          <ol className='relative border-s border-gray-200 dark:border-gray-700 mt-6'>
            {auditLogs.map((log) => (
              <li key={log.id} className='mb-6 ms-6'>
                <span className='absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 bg-blue-100 dark:bg-blue-900'>
                  {log.action === 'update' && <FaEdit className='text-blue-600 dark:text-blue-400' size={14} />}
                  {log.action === 'create' && <FaPlus className='text-green-600 dark:text-green-400' size={14} />}
                  {log.action === 'delete' && <FaTrash className='text-red-600 dark:text-red-400' size={14} />}
                  {log.action === 'custom' && <FaComment className='text-purple-600 dark:text-purple-400' size={14} />}
                  {!['update', 'create', 'delete', 'custom'].includes(log.action) && (
                    <FaInfoCircle className='text-gray-600 dark:text-gray-400' size={14} />
                  )}
                </span>

                <div className='p-4 bg-white border border-gray-200 rounded-lg shadow-xs dark:bg-gray-700 dark:border-gray-600'>
                  <div className='items-center justify-between mb-2 sm:flex'>
                    <time className='mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0'>
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </time>
                    <div className='text-sm font-medium text-gray-900 dark:text-white flex items-center'>
                      {log.user.username}
                      <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>({log.user.role})</span>
                    </div>
                  </div>

                  {log.action === 'custom' ? (
                    <div className='p-3 text-sm font-normal text-gray-500 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300'>
                      {formatNote(log.note)}
                    </div>
                  ) : (log.old_values && Object.keys(log.old_values).length > 0) ||
                    (log.new_values && Object.keys(log.new_values).length > 0) ? (
                    <div className='p-3 text-sm font-normal text-gray-500 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300'>
                      <ul className='space-y-1 list-disc list-inside'>
                        {formatChanges(log.old_values || {}, log.new_values || {}).map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default WorkOrderDetail;
