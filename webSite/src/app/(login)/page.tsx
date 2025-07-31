'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, state: { loading, error: authError, isAuthenticated } } = useAuthContext();

  // Redirect if already authenticated - only run once when isAuthenticated changes
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('🔄 User is authenticated, redirecting to home...');
      router.replace('/home');
    }
  }, [isAuthenticated, loading]); // Removed router from dependencies

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError('Please enter both mobile number and password');
      return;
    }

    // Use auth context login
    const success = await login(username.trim(), password);

    if (success) {
      // Redirect directly to home page (skip MPIN setup)
      router.replace('/home');
    } else {
      // Error is handled by the auth context
      setError(authError || 'Login failed');
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
        {(error || authError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error || authError}
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
            type="text"
            value={username}
            onChange={(e) => setusername(e.target.value)}
            placeholder="Enter Mobile number"
            className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-black"
            required
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'LOGGING IN...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
} 