'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';

export default function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!mobileNumber.trim() || !password.trim()) {
        setError('Please enter both mobile number and password');
        return;
      }

      // Call login API
      // console.log('------------------------------------------------->>', response.response.data);
      const response = await authAPI.login({
        username: mobileNumber.trim(),
        password: password,
        login: 'web' // Indicate this is web login
      });

      if (response.success && response.data) {
        const { user } = response.data;

        // Check if user is a player (only players should login through web app)
        if (user.role !== 'player') {
          setError('Access denied. This login is only for players.');
          return;
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', user.role);

        // Check if user has already set MPIN
        const hasMpin = localStorage.getItem('hasMpin');
        if (hasMpin) {
          router.replace('/mpin-login');
        } else {
          router.replace('/set-mpin');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.response?.status === 401) {
        setError('Invalid mobile number or password');
      } else if (error.response?.status === 403) {
        setError('Access denied. This login is only for players.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      {/* Logo */}
      <div className="w-32 h-32 mb-12">
        <Image
          src="/Logo.png"
          alt="Logo"
          width={128}
          height={128}
          priority
        />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Mobile Number Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <Image
              src="/mobile-icon.svg"
              alt="Mobile"
              width={24}
              height={24}
              className="text-gray-400"
            />
          </div>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter Mobile number"
            className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-black"
            required
            disabled={isLoading}
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <Image
              src="/password-icon.svg"
              alt="Password"
              width={24}
              height={24}
              className="text-gray-400"
            />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={isLoading}
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'LOGGING IN...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
} 