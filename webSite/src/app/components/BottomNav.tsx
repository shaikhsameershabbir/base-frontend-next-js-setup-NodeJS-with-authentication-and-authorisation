import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
      <div className="flex justify-around items-center">
        <NavItem icon="/bid.svg" label="My Bids" href="/MyBids" />
        <NavItem icon="/passbook.svg" label="Passbook" href="/Passbook" />
        <NavItem icon="/home.svg" label="Home" href="/" isHome />
        <NavItem icon="/funds.svg" label="Funds" href="/Funds" />
        <NavItem icon="/support.svg" label="Support" href="https://wa.me/7588244575" />
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

export default BottomNav;
