export interface WorkOrder {
  id: number;
  work_order_number: string;
  product_name: string;
  quantity: number;
  production_deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  operator: {
    id: number;
    username: string;
  };
}

export interface StatusConfig {
  [key: string]: {
    title: string;
    color: string;
    borderColor: string;
    headerColor: string;
    textColor: string;
  };
}

export const statusConfig: StatusConfig = {
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

export const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
