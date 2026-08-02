import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { BackToTop } from '../common/BackToTop';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen flex-col">
      <Header
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen(current => !current)}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        <main id="main-scroll-container" className="relative flex-1 overflow-auto bg-gray-50">
          <Outlet />
          <BackToTop containerId="main-scroll-container" />
        </main>
      </div>
    </div>
  );
};

export default Layout;
