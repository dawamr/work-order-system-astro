import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (value: any, row?: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  className = '',
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
}: TableProps<T>) {
  const renderCell = (item: T, column: TableColumn<T>) => {
    const value = typeof column.accessor === 'string' ? item[column.accessor as keyof T] : null;

    // Use custom cell renderer if provided
    if (column.cell) {
      return column.cell(value, item);
    }

    // Use accessor as function if it's a function
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }

    // Otherwise just return the value
    return value;
  };

  return (
    <div className='overflow-x-auto'>
      <table className={`min-w-full divide-y divide-gray-200 ${className} ${isLoading ? 'opacity-50' : ''}`}>
        <thead className='bg-gray-50'>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope='col'
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.className || ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:text-white'>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className='px-6 py-4 text-center'>
                <div className='flex justify-center items-center'>
                  <svg
                    className='animate-spin h-5 w-5 text-blue-500'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  <span className='ml-2'>Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className='px-6 py-4 text-center text-sm text-gray-500'>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}>
                    <div className='text-truncate'>{renderCell(item, column)}</div>
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
