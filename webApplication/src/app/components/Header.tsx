'use client';

import React, { useState } from 'react';
import { Wallet, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useGlobalContext } from '@/contexts/GlobalContext';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { state: { user } } = useGlobalContext();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="bg-primary text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="p-1">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold pt-1">SK Matka Booking</h1>
        </div>
        <div className="flex items-center">
          <div className="text-white px-3 py-1 rounded-lg flex items-center">
            <span className="mr-1"><Wallet /></span>
            <span className="font-bold">{user?.balance || 0}</span>
          </div>
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={toggleSidebar}
      />
    </>
  );
};

export default Header;

