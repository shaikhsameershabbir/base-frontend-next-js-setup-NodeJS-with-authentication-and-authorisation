'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SetMPINPage() {
  const [mpin, setMpin] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mpin.length === 4) {
      // Store MPIN in localStorage to remember the user has set it
      localStorage.setItem('mpin', mpin);
      localStorage.setItem('hasMpin', 'true');
      router.replace('/mpin-login');
    }
  };

  const handleMpinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and max 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setMpin(value);
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

      {/* Title */}
      <h1 className="text-2xl font-bold mb-12 text-black">SET NEW 4 DIGIT M-PIN</h1>

      {/* MPIN Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="relative">
          <input
            type="password"
            value={mpin}
            onChange={handleMpinChange}
            placeholder="Enter M-pin"
            className="w-full px-4 py-4 bg-gray-100 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg"
            required
            maxLength={4}
            pattern="\d{4}"
          />
        </div>

        <button
          type="submit"
          disabled={mpin.length !== 4}
          className="w-full py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          NEXT
        </button>
      </form>
    </div>
  );
} 