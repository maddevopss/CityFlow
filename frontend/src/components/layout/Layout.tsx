import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { BackToTop } from '../common/BackToTop';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main id="main-scroll-container" className="flex-1 overflow-auto bg-gray-50 relative">
          <Outlet />
          <BackToTop containerId="main-scroll-container" />
        </main>
      </div>
    </div>
  );
};

export default Layout;
