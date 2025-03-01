import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

const DB_NAME = 'work-order-system';
const DB_VERSION = 1;

interface AuthData {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

// Define stores and their key paths
const STORES = {
  auth: 'auth', // For auth tokens and user info
  workOrders: 'workOrders', // For caching work orders
  config: 'config', // For app configuration
};

// Initialize the database
export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Auth store
      if (!db.objectStoreNames.contains(STORES.auth)) {
        db.createObjectStore(STORES.auth);
      }

      // Work orders store
      if (!db.objectStoreNames.contains(STORES.workOrders)) {
        const workOrdersStore = db.createObjectStore(STORES.workOrders, { keyPath: 'id' });
        workOrdersStore.createIndex('status', 'status');
        workOrdersStore.createIndex('operator_id', 'operator_id');
      }

      // Config store
      if (!db.objectStoreNames.contains(STORES.config)) {
        db.createObjectStore(STORES.config);
      }
    },
  });
};

// Auth operations
export const authDBOperations = {
  // Save auth data
  saveAuth: async (data: AuthData): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction(STORES.auth, 'readwrite');
    await tx.store.put(data, 'authData');
  },

  // Get auth data
  getAuth: async (): Promise<AuthData | undefined> => {
    const db = await initDB();
    return db.get(STORES.auth, 'authData');
  },

  // Clear auth data
  clearAuth: async (): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction(STORES.auth, 'readwrite');
    await tx.store.delete('authData');
  },
};

// Work orders cache operations
export const workOrdersDBOperations = {
  // Save work orders list
  saveWorkOrders: async (workOrders: any[], cacheKey: string): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction(STORES.config, 'readwrite');
    await tx.store.put(
      {
        data: workOrders,
        timestamp: Date.now(),
      },
      cacheKey,
    );
  },

  // Get cached work orders
  getWorkOrders: async (cacheKey: string, maxAge: number = 5 * 60 * 1000): Promise<any[] | null> => {
    const db = await initDB();
    const cached = await db.get(STORES.config, cacheKey);

    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > maxAge) {
      return null; // Cache expired
    }

    return cached.data;
  },

  // Clear cached work orders
  clearWorkOrdersCache: async (): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction(STORES.config, 'readwrite');
    const keys = await tx.store.getAllKeys();

    const workOrderCacheKeys = keys.filter((key) => typeof key === 'string' && key.startsWith('workOrders_'));

    await Promise.all(workOrderCacheKeys.map((key) => tx.store.delete(key)));
  },
};

// Config operations
export const configDBOperations = {
  // Save config setting
  saveSetting: async (key: string, value: any): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction(STORES.config, 'readwrite');
    await tx.store.put(value, key);
  },

  // Get config setting
  getSetting: async (key: string): Promise<any> => {
    const db = await initDB();
    return db.get(STORES.config, key);
  },

  // Delete config setting
  deleteSetting: async (key: string): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction(STORES.config, 'readwrite');
    await tx.store.delete(key);
  },
};

export default {
  auth: authDBOperations,
  workOrders: workOrdersDBOperations,
  config: configDBOperations,
};
