'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  duration?: number; // Duration in milliseconds
  onComplete: () => void;
}

const SplashScreen = ({ duration = 4000, onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {/* You can replace the src with your company logo */}
      <div className="w-32 h-32 relative mb-4">
        <Image
          src="/Logo.png"
          alt="Company Logo"
          fill
          className="object-contain animate-bounce"
          priority
        />
      </div>
      <motion.h1 
        className="text-2xl font-bold text-gray-800 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, delay: 0.5 }}
      >
        {Array.from("Matka Booking Indias No.1").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.1, 
              delay: 0.5 + (index * 0.1) 
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>
      <h5 className="text-gray-600 mt-2 animate-pulse font-bold">Loading...</h5>
    </div>
  );
};

export default SplashScreen; 