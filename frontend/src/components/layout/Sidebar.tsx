import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: '📊', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'VIEWER'] },
  { name: 'Événements', href: '/events', icon: '📋', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'VIEWER'] },
  { name: 'Nouvel événement', href: '/events/new', icon: '➕', roles: ['ADMIN', 'MUNICIPAL_AGENT'] },
  { name: 'Exports', href: '/exports', icon: '📤', roles: ['ADMIN', 'MUNICIPAL_AGENT'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const filteredNav = navigation.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <nav className="p-4 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-cityflow-50 text-cityflow-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
