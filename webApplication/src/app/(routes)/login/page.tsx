'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user has already set MPIN
    const hasMpin = localStorage.getItem('hasMpin');
    if (hasMpin) {
      router.replace('/mpin-login');
    } else {
      router.replace('/set-mpin');
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
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/80 transition-colors"
        >
          LOGIN
        </button>
      </form>
    </div>
  );
} 