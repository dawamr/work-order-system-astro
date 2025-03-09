import React, { useState, useEffect, useRef } from 'react';
import { workOrderAPI, operatorsAPI } from '../../utils/api';
import Button from '../Button';
import { Datepicker } from 'flowbite-react';
import { format, parseISO } from 'date-fns';
import localStorageOperations from '../../utils/localStorage';
import type { UserRole } from '../../types/userRole';
import type { Operator, ProductionManager } from '../../types/user';

import type { WorkOrder } from '../../types/workOrders';
import { hintProgressDesc } from '../../types/workOrders';
interface EditWorkOrderSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workOrder: WorkOrder;
}

const EditWorkOrderSlidePanel: React.FC<EditWorkOrderSlidePanelProps> = ({ isOpen, onClose, onSuccess, workOrder }) => {
  const [userRole, setUserRole] = useState<UserRole>(workOrder?.operator?.role || 'operator');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
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
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add status config after the imports
  type StatusConfig = {
    [key: string]: {
      title: string;
      allowedTransitions: string[];
    };
  };

  const statusConfig: StatusConfig = {
    pending: {
      title: 'Pending',
      allowedTransitions: ['in_progress', 'cancelled'],
    },
    in_progress: {
      title: 'In Progress',
      allowedTransitions: ['completed', 'cancelled'],
    },
    completed: {
      title: 'Completed',
      allowedTransitions: [],
    },
    cancelled: {
      title: 'Cancelled',
      allowedTransitions: [],
    },
  };

  // Dapatkan role pengguna saat komponen dimount
  useEffect(() => {
    const authData = localStorageOperations.getAuth();
    if (authData?.user?.role) {
      setUserRole(authData.user.role as 'production_manager' | 'operator');
    }
  }, []);

  // Update form data when workOrder prop changes
  useEffect(() => {
    if (workOrder) {
      setProductName(workOrder.product_name || '');
      setQuantity(workOrder.quantity?.toString() || '');
      setTargetQuantity(workOrder.target_quantity?.toString() || '');

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
      if (userRole === 'production_manager') {
        fetchOperators();
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, userRole]);

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
      if (!productName.trim() && userRole === 'production_manager') {
        throw new Error('Product name is required');
      }

      const quantityNum = parseInt(quantity);
      const targetQuantityNum = parseInt(targetQuantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        throw new Error('Quantity must be a positive number');
      }
      if (isNaN(targetQuantityNum) || (targetQuantityNum <= 0 && userRole === 'production_manager')) {
        throw new Error('Target quantity must be a positive number');
      }

      if (!deadline && userRole === 'production_manager') {
        throw new Error('Production deadline is required');
      }

      // Hanya validasi operator_id jika userRole adalah manager
      let operatorIdNum;
      if (userRole === 'production_manager') {
        operatorIdNum = parseInt(operatorId);
        if (isNaN(operatorIdNum)) {
          throw new Error('Please select an operator');
        }
      } else {
        // Jika operator, gunakan operator_id dari workOrder yang ada
        operatorIdNum = workOrder.operator?.id;
      }

      // Siapkan data untuk update
      let updateData: Record<string, any> = {};
      if (userRole === 'production_manager') {
        updateData = {
          quantity: quantityNum,
          status: status,
          operator_id: operatorIdNum,
          product_name: productName.trim(),
          production_deadline: new Date(deadline).toISOString(),
          target_quantity: targetQuantityNum,
        };
      }

      // Hanya tambahkan operator_id jika userRole adalah manager
      if (userRole === 'production_manager' && operatorIdNum) {
        updateData.operator_id = operatorIdNum;
      }

      // Submit update
      if (userRole === 'production_manager') {
        await workOrderAPI.update(workOrder.id, updateData);
      }
      if (userRole === 'operator') {
        await workOrderAPI.updateStatus(workOrder.id, status, quantityNum, description);
      }

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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    // Get cursor position
    const cursorPos = e.target.selectionStart;

    // Get the word being typed
    const textBeforeCursor = value.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    // Check if the current word matches any hint descriptions
    if (currentWord && currentWord.length > 0) {
      const matchingSuggestions: string[] = [];
      Object.entries(hintProgressDesc).forEach(([status, hints]) => {
        hints.forEach((hint: string) => {
          if (hint.toLowerCase().startsWith(currentWord.toLowerCase())) {
            matchingSuggestions.push(hint);
          }
        });
      });
      setSuggestions(matchingSuggestions);
      setSelectedSuggestionIndex(0);
      setCursorPosition({ start: cursorPos - currentWord.length, end: cursorPos });
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    }
  };

  const applySuggestion = (suggestion: string) => {
    const beforeText = description.substring(0, cursorPosition.start);
    const afterText = description.substring(cursorPosition.end);
    const newText = `${beforeText}${suggestion}${afterText}`;
    setDescription(newText);
    setSuggestions([]);

    // Focus and set cursor position after the inserted suggestion
    if (textareaRef.current) {
      const newCursorPos = cursorPosition.start + suggestion.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
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
                  {userRole === 'production_manager' && (
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
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M19 9l-7 7-7-7'
                            ></path>
                          </svg>
                        </button>

                        {isOperatorDropdownOpen && (
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
                  )}

                  <div>
                    <label
                      htmlFor='product-name'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Product Name
                    </label>
                    {userRole === 'production_manager' && (
                      <input
                        type='text'
                        id='product-name'
                        className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                        placeholder='Enter product name'
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                    )}
                    {userRole === 'operator' && (
                      <input
                        type='text'
                        id='product-name'
                        className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                        value={productName}
                        disabled
                      />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='target-quantity'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Target Quantity
                    </label>
                    {userRole === 'production_manager' && (
                      <input
                        type='number'
                        id='target-quantity'
                        className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                        value={targetQuantity}
                        onChange={(e) => setTargetQuantity(e.target.value)}
                      />
                    )}
                    {userRole === 'operator' && (
                      <input
                        type='number'
                        id='target-quantity'
                        className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                        value={targetQuantity}
                        disabled
                      />
                    )}
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

                      {userRole === 'production_manager' && (
                        <Datepicker
                          className='w-full'
                          value={selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : ''}
                          onSelectedDateChanged={setSelectedDate}
                          defaultDate={new Date()}
                          showTodayButton={true}
                          labelTodayButton='Today'
                          theme={{}}
                        />
                      )}
                      {userRole === 'operator' && (
                        <input
                          type='date'
                          id='deadline'
                          className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                          value={deadline}
                          disabled
                        />
                      )}
                    </div>
                  </div>
                  <hr />
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

                  {/* Status Select */}
                  <div>
                    <label htmlFor='status' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Status
                    </label>
                    {userRole === 'production_manager' && (
                      <select
                        id='status'
                        className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        {Object.entries(statusConfig).map(([value, config]) => (
                          <option key={value} value={value}>
                            {config.title}
                          </option>
                        ))}
                      </select>
                    )}
                    {userRole === 'operator' && (
                      <select
                        id='status'
                        className='block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm'
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <option value={workOrder.status} className='bg-blue-500/50 text-white'>
                          {statusConfig[workOrder.status].title}
                        </option>
                        {statusConfig[workOrder.status].allowedTransitions.map((value) => (
                          <option key={value} value={value}>
                            {statusConfig[value].title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Hint Description */}
                  <div>
                    <label htmlFor='status' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Description
                    </label>
                    <div className='relative'>
                      <textarea
                        ref={textareaRef}
                        id='message'
                        rows={4}
                        value={description}
                        onChange={handleDescriptionChange}
                        onKeyDown={handleKeyDown}
                        className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='Write your thoughts here...'
                      />

                      {suggestions.length > 0 && (
                        <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto'>
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`px-4 py-2 cursor-pointer text-sm ${
                                index === selectedSuggestionIndex
                                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              onClick={() => applySuggestion(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
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
