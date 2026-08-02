import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollToTopButton } from '../common/ScrollToTopButton';
import Header from './Header';
import Sidebar from './Sidebar';

const MAIN_SCROLL_CONTAINER_ID = 'cityflow-main-content';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          id={MAIN_SCROLL_CONTAINER_ID}
          className="flex-1 overflow-auto bg-gray-50"
          tabIndex={-1}
        >
          <Outlet />
        </main>
        <ScrollToTopButton scrollContainerId={MAIN_SCROLL_CONTAINER_ID} />
      </div>
    </div>
  );
};

export default Layout;
