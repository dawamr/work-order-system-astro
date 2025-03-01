import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { authDBOperations } from './indexedDB';

// API base URL
const API_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const authData = await authDBOperations.getAuth();
      if (authData?.token && config.headers) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting auth token from IndexedDB:', error);
      return config;
    }
  },
  (error) => Promise.reject(error),
);

// Interceptor to handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      try {
        await authDBOperations.clearAuth();
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } catch (dbError) {
        console.error('Error clearing auth data from IndexedDB:', dbError);
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
  getAll: async (page: number = 1, limit: number = 10, status?: string) => {
    const params: Record<string, any> = { page, limit };
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

export default {
  auth: authAPI,
  workOrders: workOrderAPI,
  reports: reportsAPI,
};
