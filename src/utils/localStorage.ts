const AUTH_KEY = 'auth_data';
const THEME_KEY = 'theme';

export const localStorageOperations = {
  saveAuth: (authData: any) => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth data to localStorage:', error);
    }
  },
  getAuth: () => {
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Error getting auth data from localStorage:', error);
      return null;
    }
  },
  clearAuth: () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error clearing auth data from localStorage:', error);
    }
  },
  saveSetting: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving setting ${key} to localStorage:`, error);
    }
  },
  getSetting: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting setting ${key} from localStorage:`, error);
      return null;
    }
  },
};

export default localStorageOperations;
