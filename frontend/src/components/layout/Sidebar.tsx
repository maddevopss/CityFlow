import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: '📊', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER', 'CITIZEN'] },
  { name: 'Mes demandes', href: '/citizen', icon: '🏙️', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'VIEWER', 'CITIZEN'] },
  { name: 'Demandes citoyennes', href: '/municipal/citizen-requests', icon: '🗂️', roles: ['ADMIN', 'MUNICIPAL_AGENT'] },
  { name: 'Notifications', href: '/notifications', icon: '🔔', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER', 'CITIZEN'], badge: true },
  { name: 'Événements', href: '/events', icon: '📋', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'VIEWER'] },
  { name: 'Nouvel événement', href: '/events/new', icon: '➕', roles: ['ADMIN', 'MUNICIPAL_AGENT'] },
  { name: 'Inspections', href: '/inspections', icon: '🔎', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Suivi inspections', href: '/inspections/dashboard', icon: '📈', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Tendances', href: '/inspections/trends', icon: '📉', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Calendrier', href: '/inspections/calendar', icon: '🗓️', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Exports', href: '/exports', icon: '📤', roles: ['ADMIN', 'MUNICIPAL_AGENT'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block" aria-label="Navigation principale">
      <nav className="p-4 space-y-1">
        {filteredNav.map((item) => (
          <NavLink key={item.href} to={item.href} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-cityflow-50 text-cityflow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <span className="text-lg" aria-hidden="true">{item.icon}</span>
            <span className="flex-1">{item.name}</span>
            {item.badge && unreadCount > 0 ? <span className="min-w-6 rounded-full bg-red-600 px-2 py-0.5 text-center text-xs font-semibold text-white" aria-label={`${unreadCount} notifications non lues`}>{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
