import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollToTopButton } from '../common/ScrollToTopButton';
import { SkipToContent } from '../common/SkipToContent';
import Header from './Header';
import Sidebar from './Sidebar';

const MAIN_SCROLL_CONTAINER_ID = 'cityflow-main-content';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden">
      <SkipToContent targetId={MAIN_SCROLL_CONTAINER_ID} />
      <Header />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main
          id={MAIN_SCROLL_CONTAINER_ID}
          className="min-w-0 flex-1 overflow-auto bg-gray-50 overscroll-contain"
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
