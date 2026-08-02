import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

const navigation = [
  {
    name: 'Tableau de bord',
    href: '/',
    icon: '📊',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER', 'CITIZEN'],
  },
  {
    name: 'Mes demandes',
    href: '/citizen',
    icon: '🏙️',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'VIEWER', 'CITIZEN'],
  },
  {
    name: 'Demandes citoyennes',
    href: '/municipal/citizen-requests',
    icon: '🗂️',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'],
  },
  {
    name: 'Délais citoyens',
    href: '/municipal/citizen-requests/service-levels',
    icon: '⏱️',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'],
  },
  {
    name: 'Cycles d’escalade',
    href: '/municipal/citizen-requests/escalations/history',
    icon: '🧾',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: '🔔',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER', 'CITIZEN'],
    badge: true,
  },
  {
    name: 'Événements',
    href: '/events',
    icon: '📋',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'VIEWER'],
  },
  {
    name: 'Permis',
    href: '/permits',
    icon: '🏗️',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'VIEWER'],
  },
  {
    name: 'Nouvel événement',
    href: '/events/new',
    icon: '➕',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'],
  },
  {
    name: 'Inspections',
    href: '/inspections',
    icon: '🔎',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR'],
  },
  {
    name: 'Suivi inspections',
    href: '/inspections/dashboard',
    icon: '📈',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR'],
  },
  {
    name: 'Tendances',
    href: '/inspections/trends',
    icon: '📉',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR'],
  },
  {
    name: 'Calendrier',
    href: '/inspections/calendar',
    icon: '🗓️',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR'],
  },
  {
    name: 'Exports',
    href: '/exports',
    icon: '📤',
    roles: ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-gray-900/80 md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      ) : null}

      <aside
        id="primary-sidebar"
        className={`absolute inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation principale"
      >
        <nav className="h-full space-y-1 overflow-y-auto p-4">
          {filteredNav.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cityflow-500 ${
                  isActive
                    ? 'bg-cityflow-50 text-cityflow-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span className="flex-1">{item.name}</span>
              {item.badge && unreadCount > 0 ? (
                <span
                  className="min-w-6 rounded-full bg-red-600 px-2 py-0.5 text-center text-xs font-semibold text-white"
                  aria-label={`${unreadCount} notifications non lues`}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
