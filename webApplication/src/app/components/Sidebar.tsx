'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Here you can add any logout logic like clearing local storage, cookies, etc.
    router.replace('/login');
    onClose();
  };

  const menuItems = [
    { icon: '/home.svg', label: 'Home', href: '/' },
    { icon: '/bid.svg', label: 'My Bids', href: '/MyBids' },
    { icon: '/passbook.svg', label: 'Passbook', href: '/Passbook' },
    { icon: '/funds.svg', label: 'Funds', href: '/Funds' },
    { icon: '/rate.svg', label: 'Game Rate', href: '/GameRate' },
    { icon: '/chart.svg', label: 'Charts', href: '/Charts' },
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
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">Sachin</h3>
              <p className="text-gray-600">7777733333</p>
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