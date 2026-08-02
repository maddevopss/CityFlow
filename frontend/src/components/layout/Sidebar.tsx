import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: '📊', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'] },
  { name: 'Événements', href: '/events', icon: '📋', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'VIEWER'] },
  { name: 'Nouvel événement', href: '/events/new', icon: '➕', roles: ['ADMIN', 'MUNICIPAL_AGENT'] },
  { name: 'Inspections', href: '/inspections', icon: '🔎', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Suivi inspections', href: '/inspections/dashboard', icon: '📈', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Tendances', href: '/inspections/trends', icon: '📉', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Calendrier', href: '/inspections/calendar', icon: '🗓️', roles: ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'] },
  { name: 'Exports', href: '/exports', icon: '📤', roles: ['ADMIN', 'MUNICIPAL_AGENT'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/80 z-30 md:hidden transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Barre latérale (fixe sur desktop, absolute sur mobile) */}
      <aside 
        className={`absolute inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          {filteredNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cityflow-500 ${isActive ? 'bg-cityflow-50 text-cityflow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
