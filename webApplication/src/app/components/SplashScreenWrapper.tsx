'use client';

import { useState } from 'react';
import SplashScreen from './SplashScreen';

export default function SplashScreenWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <SplashScreen
          duration={1000} // 1 second, you can adjust this value
          onComplete={() => setShowSplash(false)}
        />
      ) : (
        children
      )}
    </>
  );
} 