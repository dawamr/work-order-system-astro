import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import PopupCard from './PopupCard';
import { authAPI } from '../utils/api';
import ThemeToggle from './ThemeToggle';
import { localStorageOperations } from '../utils/localStorage';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Username and password are required');
      setShowPopup(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(username, password);

      // Store auth data in localStorage
      await localStorageOperations.saveAuth({
        token: response.token,
        user: {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
        },
      });

      // Redirect based on role
      if (response.user.role === 'production_manager') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/assigned-orders';
      }
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Failed to login. Please check your credentials and try again.');
      }

      setShowPopup(true);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Sign In</h2>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          label='Username'
          type='text'
          id='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          placeholder='Enter your username'
          autoComplete='username'
          required
          className='dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
        />

        <Input
          label='Password'
          type='password'
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          placeholder='Enter your password'
          autoComplete='current-password'
          required
          className='dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
        />

        <div className='mt-6'>
          <Button type='submit' fullWidth isLoading={isLoading} size='lg'>
            Sign In
          </Button>
        </div>
      </form>

      <PopupCard message={error || ''} type='error' isOpen={showPopup && !!error} onClose={() => setShowPopup(false)} />
    </div>
  );
};

export default LoginForm;
