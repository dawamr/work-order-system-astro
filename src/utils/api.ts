import axios from 'axios';
import { localStorageOperations } from './localStorage';
import { API_URL } from 'astro:env/client';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: API_URL || 'https://api.workorder.dawam.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan header Authorization
api.interceptors.request.use(
  async (config) => {
    try {
      const authData = localStorageOperations.getAuth();
      if (authData?.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
      return config;
    } catch (error) {
      console.error('Error di request interceptor:', error);
      return config;
    }
  },
  (error) => Promise.reject(error),
);

// Interceptor untuk menangani error respons (misalnya, 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await localStorageOperations.clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } catch (dbError) {
        console.error('Error saat membersihkan auth data:', dbError);
      }
    }
    return Promise.reject(error);
  },
);

// API untuk autentikasi
export const authAPI = {
  /** Login pengguna dengan username dan password */
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  /** Registrasi pengguna baru dengan role tertentu */
  register: async (username: string, password: string, role: 'production_manager' | 'operator') => {
    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  },
};

// API untuk manajemen work orders
export const workOrderAPI = {
  /** Mengambil semua work order dengan parameter filter (Production Manager) */
  getAll: async (params: Record<string, any>) => {
    const response = await api.get('/work-orders', { params });
    return response.data;
  },

  /** Mengambil work order yang ditugaskan ke operator dengan pagination dan filter status */
  getAssigned: async (page: number = 1, limit: number = 10, status?: string) => {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/work-orders/assigned', { params });
    return response.data;
  },

  /** Mengambil detail work order berdasarkan ID */
  getById: async (id: number) => {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },

  /** Mengambil log audit untuk work order tertentu */
  getAuditLogs: async (id: number) => {
    const response = await api.get(`/work-orders/${id}/logs`);
    return response.data;
  },

  /** Membuat work order baru (Production Manager) */
  create: async (workOrder: {
    product_name: string;
    quantity: number;
    production_deadline: string;
    operator_id: number;
    target_quantity: number;
  }) => {
    const response = await api.post('/work-orders', workOrder);
    return response.data;
  },

  /** Memperbarui detail work order (Production Manager) */
  update: async (
    id: number,
    workOrder: {
      product_name?: string;
      quantity?: number;
      production_deadline?: string;
      status?: string;
      operator_id?: number;
      target_quantity?: number;
    },
  ) => {
    const response = await api.put(`/work-orders/${id}`, workOrder);
    return response.data;
  },

  /** Memperbarui status work order (Operator) */
  updateStatus: async (id: number, status: string, quantity?: number, description?: string) => {
    const data: Record<string, any> = { status };
    if (quantity !== undefined) data.quantity = quantity;
    if (description !== undefined) data.description = description;
    const response = await api.put(`/work-orders/${id}/status`, data);
    return response.data;
  },

  /** Menambahkan catatan progres untuk work order */
  addProgress: async (id: number, progressData: { progress_description: string; progress_quantity: number }) => {
    const response = await api.post(`/work-orders/${id}/progress`, progressData);
    return response.data;
  },

  /** Mengambil catatan progres untuk work order tertentu */
  getProgress: async (id: number) => {
    const response = await api.get(`/work-orders/${id}/progress`);
    return response.data;
  },

  /** Mengambil riwayat status work order */
  getStatusHistory: async (id: number) => {
    const response = await api.get(`/work-orders/${id}/history`);
    return response.data;
  },

  /** Menghapus work order berdasarkan ID (Production Manager) */
  delete: async (id: number) => {
    const response = await api.delete(`/work-orders/${id}`);
    return response.data;
  },

  /** Menambahkan catatan khusus ke log work order */
  addCustomLog: async (id: number, data: { note: string }) => {
    const response = await api.post(`/work-orders/${id}/logs`, data);
    return response.data;
  },
};

// API untuk laporan
export const reportsAPI = {
  /** Mengambil ringkasan work order berdasarkan status dengan rentang tanggal opsional */
  getSummaryDashboard: async (startDate?: string, endDate?: string) => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/reports/dashboard', { params });
    return response.data;
  },

  getSummary: async (startDate?: string, endDate?: string) => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/reports/summary', { params });
    return response.data;
  },

  getOperatorPerformance: async (id: number, startDate?: string, endDate?: string) => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get(`/reports/summary/${id}`, { params });
    return response.data;
  },

  getAllOperatorPerformance: async (startDate?: string, endDate?: string) => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/reports/performance', { params });
    return response.data;
  },
};

// API untuk operator
export const operatorsAPI = {
  /** Mengambil daftar semua operator */
  getAll: async () => {
    const response = await api.get('/operators');
    return response.data;
  },
};

// Ekspor semua API sebagai objek terstruktur
export default {
  auth: authAPI,
  workOrders: workOrderAPI,
  reports: reportsAPI,
  operators: operatorsAPI,
};
