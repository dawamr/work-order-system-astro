import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { localStorageOperations } from './localStorage';
import { API_URL } from 'astro:env/client';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log('Request Interceptor dijalankan');
    try {
      const authData = localStorageOperations.getAuth();
      console.log('Auth Data:', authData); // Debugging
      if (authData?.token && config.headers) {
        config.headers.Authorization = `Bearer ${authData.token}`;
        console.log('Auth Header Set:', config.headers.Authorization); // Debugging
      }
      return config;
    } catch (error) {
      console.error('Error getting auth token from Local Storage:', error);
      console.error('Interceptor Error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request Interceptor Error (Promise Reject):', error);
    return Promise.reject(error);
  },
);

// Interceptor to handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      try {
        await localStorageOperations.clearAuth();
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } catch (dbError) {
        console.error('Error clearing auth data from Local Storage:', dbError);
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string, role: 'production_manager' | 'operator') => {
    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  },
};

// Work Orders API
export const workOrderAPI = {
  // Get all work orders (Production Manager)
  getAll: async (page: number = 1, status?: string) => {
    const params: Record<string, any> = { page };
    if (status) params.status = status;
    const response = await api.get('/work-orders', { params });
    return response.data;
  },

  // Get assigned work orders (Operator)
  getAssigned: async (page: number = 1, limit: number = 10, status?: string) => {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;

    const response = await api.get('/work-orders/assigned', { params });
    return response.data;
  },

  // Get work order by ID
  getById: async (id: number) => {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },

  getAuditLogs: async (id: number) => {
    //   {
    //     "error": false,
    //     "logs": [
    //         {
    //             "id": 8,
    //             "user_id": 1,
    //             "user": {
    //                 "id": 1,
    //                 "username": "manager",
    //                 "role": "production_manager",
    //                 "created_at": "2025-03-05T23:22:54.35481+07:00",
    //                 "updated_at": "2025-03-05T23:22:54.35481+07:00"
    //             },
    //             "action": "update",
    //             "entity_id": 205,
    //             "entity_type": "WorkOrder",
    //             "old_values": {
    //                 "quantity": 8
    //             },
    //             "new_values": {
    //                 "quantity": 9
    //             },
    //             "note": "Work order WO-20250306-004 updated",
    //             "created_at": "2025-03-06T11:01:35.954318+07:00"
    //         },
    //         {
    //             "id": 7,
    //             "user_id": 1,
    //             "user": {
    //                 "id": 1,
    //                 "username": "manager",
    //                 "role": "production_manager",
    //                 "created_at": "2025-03-05T23:22:54.35481+07:00",
    //                 "updated_at": "2025-03-05T23:22:54.35481+07:00"
    //             },
    //             "action": "update",
    //             "entity_id": 205,
    //             "entity_type": "WorkOrder",
    //             "old_values": {
    //                 "quantity": 5
    //             },
    //             "new_values": {
    //                 "quantity": 8
    //             },
    //             "note": "Work order WO-20250306-004 updated",
    //             "created_at": "2025-03-06T10:57:26.457733+07:00"
    //         }
    //     ]
    // }
    const response = await api.get(`/work-orders/${id}/logs`);
    return response.data;
  },

  // Create work order (Production Manager)
  create: async (workOrder: {
    product_name: string;
    quantity: number;
    production_deadline: string;
    operator_id: number;
  }) => {
    const response = await api.post('/work-orders', workOrder);
    return response.data;
  },

  // Update work order (Production Manager)
  update: async (
    id: number,
    workOrder: {
      product_name?: string;
      quantity?: number;
      production_deadline?: string;
      status?: string;
      operator_id?: number;
    },
  ) => {
    const response = await api.put(`/work-orders/${id}`, workOrder);
    return response.data;
  },

  // Update work order status (Operator)
  updateStatus: async (id: number, status: string, quantity?: number) => {
    const data: Record<string, any> = { status };
    if (quantity !== undefined) data.quantity = quantity;

    const response = await api.put(`/work-orders/${id}/status`, data);
    return response.data;
  },

  // Record progress
  addProgress: async (id: number, progressData: { progress_description: string; progress_quantity: number }) => {
    const response = await api.post(`/work-orders/${id}/progress`, progressData);
    return response.data;
  },

  // Get progress records
  getProgress: async (id: number) => {
    const response = await api.get(`/work-orders/${id}/progress`);
    return response.data;
  },

  // Get status history
  getStatusHistory: async (id: number) => {
    const response = await api.get(`/work-orders/${id}/history`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/work-orders/${id}`);
    return response.data;
  },

  // Add custom log/note to work order
  addCustomLog: async (id: number, data: { note: string }) => {
    const response = await api.post(`/work-orders/${id}/logs`, data);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  // Get work orders summary by status
  getSummary: async (startDate?: string, endDate?: string) => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get('/reports/summary', { params });
    return response.data;
  },

  // Get operator performance
  getOperatorPerformance: async (startDate?: string, endDate?: string) => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get('/reports/operators', { params });
    return response.data;
  },
};

// Operators API
export const operatorsAPI = {
  // Get all operators
  getAll: async () => {
    const response = await api.get('/operators');
    return response.data;
  },
};

export default {
  auth: authAPI,
  workOrders: workOrderAPI,
  reports: reportsAPI,
  operators: operatorsAPI,
};
