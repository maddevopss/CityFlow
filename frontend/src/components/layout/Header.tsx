import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-cityflow-700 text-white shadow-lg relative z-20">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1 rounded-md text-cityflow-200 hover:text-white hover:bg-cityflow-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-expanded={isMenuOpen}
            aria-label="Menu principal"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cityflow-700 rounded">
            <span className="text-2xl font-bold tracking-tight">🏙️ CityFlow</span>
            <span className="text-sm text-cityflow-200 hidden lg:inline">Gestion Dynamique de la Voirie</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-cityflow-200">
                {user?.fullName || user?.email}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="!bg-cityflow-600 !text-white hover:!bg-cityflow-500"
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/login" className="hover:text-cityflow-200 transition-colors">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
