import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const BottomNav = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleForward = () => {
    router.forward();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
      <div className="flex justify-around items-center px-2">
        {/* Back button */}
        <NavigationButton
          icon="/arrow-left.svg"
          label="Back"
          onClick={handleBack}
          position="left"
        />

        {/* Main navigation items */}
        <NavItem icon="/bid.svg" label="My Bids" href="/myBids" />
        {/* <NavItem icon="/passbook.svg" label="Passbook" href="/passbook" /> */}
        <NavItem icon="/home.svg" label="Home" href="/" isHome />
        <NavItem icon="/funds.svg" label="Funds" href="/funds" />

        {/* Forward button */}
        <NavigationButton
          icon="/arrow-right.svg"
          label="Forward"
          onClick={handleForward}
          position="right"
        />
      </div>
    </div>
  );
};

type NavItemProps = {
  icon: string;
  label: string;
  href: string;
  isHome?: boolean;
};

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, isHome = false }) => {
  return (
    <Link href={href} className="flex flex-col items-center">
      <div className={`w-12 h-12 flex items-center justify-center ${isHome ? 'bg-primary rounded-full' : ''}`}>
        <Image
          src={icon}
          alt={label}
          width={34}
          height={34}
          className={isHome ? 'text-white' : 'text-gray-600'}
        />
      </div>
      <span className="text-xs mt-1 text-gray-600">{label}</span>
    </Link>
  );
};

type NavigationButtonProps = {
  icon: string;
  label: string;
  onClick: () => void;
  position: 'left' | 'right';
};

const NavigationButton: React.FC<NavigationButtonProps> = ({ icon, label, onClick, position }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center"
    >
      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
        <Image
          src={icon}
          alt={label}
          width={20}
          height={20}
          className="text-gray-500"
        />
      </div>
      <span className="text-xs mt-1 text-gray-500">{label}</span>
    </button>
  );
};

export default BottomNav;
