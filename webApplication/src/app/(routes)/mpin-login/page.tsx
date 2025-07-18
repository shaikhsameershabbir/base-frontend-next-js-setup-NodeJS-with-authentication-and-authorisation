'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MPINLoginPage() {
  const [mpin, setMpin] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user has set MPIN
    const hasMpin = localStorage.getItem('hasMpin');
    if (!hasMpin) {
      router.replace('/home');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedMpin = localStorage.getItem('mpin');
    if (mpin === storedMpin) {
      router.replace('/');
    } else {
      alert('Incorrect MPIN');
      setMpin('');
    }
  };

  const handleMpinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and max 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setMpin(value);
    }
  };

  const handleForgotMpin = () => {
    // Clear stored MPIN and redirect to set new MPIN
    localStorage.removeItem('mpin');
    localStorage.removeItem('hasMpin');
    router.replace('/home');
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
      <h1 className="text-2xl font-bold mb-12 text-black">Login With Mpin</h1>

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
          LOGIN
        </button>

        {/* Forgot MPIN */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotMpin}
            className="text-gray-600 hover:text-primary"
          >
            Forgot MPIN ?
          </button>
        </div>

        {/* Fingerprint Icon */}
        <div className="flex justify-center mt-8">
          <Image
            src="/fingerprint.svg"
            alt="Fingerprint"
            width={64}
            height={64}
            className="text-primary"
          />
        </div>
      </form>
    </div>
  );
} 