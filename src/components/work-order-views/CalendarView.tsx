import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
} from 'date-fns';

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

interface CalendarViewProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  onEventClick: (workOrder: WorkOrder) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ workOrders, isLoading, onEventClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Generate calendar days for the current month
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    setCalendarDays(days);
  }, [currentMonth]);

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get work orders for a specific day
  const getWorkOrdersForDay = (day: Date) => {
    return workOrders.filter((order) => {
      const orderDate = parseISO(order.production_deadline);
      return isSameDay(orderDate, day);
    });
  };

  // Status configurations for displaying work orders
  const statusConfig = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };

  if (isLoading) {
    return (
      <Card>
        <div className='flex justify-center items-center py-20'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className='flex space-x-2'>
          <button onClick={prevMonth} className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7'></path>
            </svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className='px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            Today
          </button>
          <button onClick={nextMonth} className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path>
            </svg>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className='text-center font-medium text-sm text-gray-700 dark:text-gray-300 py-2'>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day) => {
          const dayWorkOrders = getWorkOrdersForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] border border-gray-200 dark:border-gray-700 rounded p-1 ${
                !isCurrentMonth
                  ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'
                  : 'bg-white dark:bg-gray-800'
              } ${isTodayDate ? 'ring-2 ring-blue-500 dark:ring-blue-600' : ''}`}
            >
              <div className='text-right mb-1'>
                <span
                  className={`text-sm font-semibold inline-block rounded-full w-6 h-6 text-center leading-6 ${
                    isTodayDate ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className='space-y-1 overflow-y-auto max-h-[80px]'>
                {dayWorkOrders.map((workOrder) => (
                  <div
                    key={workOrder.id}
                    onClick={() => onEventClick(workOrder)}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-90 ${
                      statusConfig[workOrder.status as keyof typeof statusConfig] || 'bg-gray-100'
                    }`}
                  >
                    <div className='text-truncate text-gray-900 dark:text-gray-100'>{workOrder.product_name}</div>
                  </div>
                ))}

                {dayWorkOrders.length > 3 && (
                  <div className='text-xs text-center text-gray-500 dark:text-gray-400'>
                    +{dayWorkOrders.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CalendarView;
