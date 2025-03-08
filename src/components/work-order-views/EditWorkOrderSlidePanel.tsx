import React, { useState, useEffect, useRef } from 'react';
import { workOrderAPI, operatorsAPI } from '../../utils/api';
import Button from '../Button';
import { Datepicker } from 'flowbite-react';
import { format, parseISO } from 'date-fns';
import type { WorkOrder } from '../../types/workOrders'; // Import WorkOrder type

interface Operator {
  id: number;
  username: string;
}

interface EditWorkOrderSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workOrder: WorkOrder; // Use WorkOrder type
}

const EditWorkOrderSlidePanel: React.FC<EditWorkOrderSlidePanelProps> = ({ isOpen, onClose, onSuccess, workOrder }) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [operatorId, setOperatorId] = useState('');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operatorSearchTerm, setOperatorSearchTerm] = useState('');
  const [isOperatorDropdownOpen, setIsOperatorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>(workOrder?.status || 'pending'); // Add status state

  // Update form data when workOrder prop changes
  useEffect(() => {
    if (workOrder) {
      setProductName(workOrder.product_name || '');
      setQuantity(workOrder.quantity?.toString() || '');

      if (workOrder.production_deadline) {
        const date = parseISO(workOrder.production_deadline);
        setSelectedDate(date);
        setDeadline(format(date, 'yyyy-MM-dd'));
      }

      setOperatorId(workOrder.operator?.id?.toString() || '');
      setStatus(workOrder.status || 'pending'); // Set initial status
    }
  }, [workOrder]);

  useEffect(() => {
    if (isOpen) {
      fetchOperators();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOperatorDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update deadline string when date is selected via picker
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setDeadline(formattedDate);
    }
  }, [selectedDate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!productName.trim()) {
        throw new Error('Product name is required');
      }

      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        throw new Error('Quantity must be a positive number');
      }

      if (!deadline) {
        throw new Error('Production deadline is required');
      }

      const operatorIdNum = parseInt(operatorId);
      if (isNaN(operatorIdNum)) {
        throw new Error('Please select an operator');
      }

      // Submit update
      await workOrderAPI.update(workOrder.id, {
        product_name: productName.trim(),
        quantity: quantityNum,
        production_deadline: new Date(deadline).toISOString(),
        operator_id: operatorIdNum,
        status: status, // Include status in update
      });

      // Panggil onSuccess untuk trigger refresh
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating work order:', err);
      setError(err.message || 'Failed to update work order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 overflow-hidden z-50'>
      <div className='fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300' onClick={onClose}></div>

      <div className='absolute inset-y-0 right-0 max-w-full flex'>
        <div
          ref={panelRef}
          className='w-screen max-w-md transform transition-transform duration-300 ease-in-out'
          style={{
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
          <div className='h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl overflow-y-auto'>
            <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white flex items-center'>
                <svg
                  className='mr-2 h-6 w-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M11 5H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5M11 5h5m-9 3l4-4m-4 4l4 4'
                  ></path>
                </svg>
                Edit Work Order
              </h2>
              <button type='button' className='text-gray-400 hover:text-gray-500 focus:outline-none' onClick={onClose}>
                <svg
                  className='h-6 w-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                </svg>
              </button>
            </div>

            <div className='p-6 flex-1'>
              {error && (
                <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className='space-y-6'>
                  <div>
                    <label
                      htmlFor='product-name'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Product Name
                    </label>
                    <input
                      type='text'
                      id='product-name'
                      className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                      placeholder='Enter product name'
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='quantity'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Quantity
                    </label>
                    <input
                      type='number'
                      id='quantity'
                      className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                      placeholder='Enter quantity'
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min='1'
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='deadline'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Production Deadline
                    </label>
                    <div className='relative'>
                      <input
                        type='date'
                        id='deadline'
                        className='opacity-0 absolute h-0 w-0'
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                      />

                      <Datepicker
                        className='w-full'
                        value={selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : ''}
                        onSelectedDateChanged={setSelectedDate}
                        defaultDate={new Date()}
                        showTodayButton={true}
                        labelTodayButton='Today'
                        theme={{}}
                      />
                    </div>
                  </div>

                  {/* Status Select */}
                  <div>
                    <label htmlFor='status' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Status
                    </label>
                    <select
                      id='status'
                      className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                    >
                      <option value='pending'>Pending</option>
                      <option value='in_progress'>In Progress</option>
                      <option value='completed'>Completed</option>
                      <option value='cancelled'>Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor='operator'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Assign to Operator
                    </label>
                    <div className='relative' ref={dropdownRef}>
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
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
                        </svg>
                      </button>

                      {isOperatorDropdownOpen && (
                        // Dropdown operators - sama seperti CreateWorkOrderSlidePanel
                        <div className='absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 py-1 max-h-60 overflow-auto transform transition-all duration-200 ease-in-out'>
                          <div className='px-3 py-2 sticky top-0 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600'>
                            <div className='relative'>
                              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <svg
                                  className='h-4 w-4 text-gray-400'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                  xmlns='http://www.w3.org/2000/svg'
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
                                    setOperatorId(operator.id.toString());
                                    setIsOperatorDropdownOpen(false);
                                    setOperatorSearchTerm('');
                                  }}
                                >
                                  <div className='flex items-center'>
                                    <div className='h-8 w-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mr-3'>
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
                </div>

                <div className='border-t border-gray-200 dark:border-gray-700 mt-8 py-5'>
                  <div className='flex justify-end space-x-3'>
                    <Button onClick={onClose} variant='secondary' type='button' disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button type='submit' isLoading={isLoading}>
                      Update Work Order
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWorkOrderSlidePanel;
