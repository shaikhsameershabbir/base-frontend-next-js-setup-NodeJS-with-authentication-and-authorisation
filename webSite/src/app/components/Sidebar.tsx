"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { state: { user }, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      // Clear any remaining data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      // Redirect to root page (which will handle routing to login)
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local data and redirect
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      router.replace('/');
    }
  };

  const menuItems = [
    { icon: '/home.svg', label: 'Home', href: '/home' },
    { icon: '/bid.svg', label: 'My Bids', href: '/myBids' },
    { icon: '/passbook.svg', label: 'Passbook', href: '/passbook' },
    { icon: '/funds.svg', label: 'Funds', href: '/funds' },
    { icon: '/rate.svg', label: 'Game Rate', href: '/game-rate' },
    { icon: '/chart.svg', label: 'Charts', href: '/charts' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">{user?.username || 'User'}</h3>
              <p className="text-gray-600">{user?.username || 'Loading...'}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
              onClick={onClose}
            >
              <div className="w-6 h-6 relative">
                <Image
                  src={item.icon}
                  alt={item.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-gray-800">{item.label}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left"
          >
            <div className="w-6 h-6 relative">
              <Image
                src="/logout.svg"
                alt="Logout"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-gray-800">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 