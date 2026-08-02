import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

interface HeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="relative z-20 bg-cityflow-700 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-md p-1 text-cityflow-200 hover:bg-cityflow-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
            aria-controls="primary-sidebar"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Fermer le menu principal' : 'Ouvrir le menu principal'}
          >
            {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>

          <Link
            to="/"
            className="flex items-center space-x-3 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cityflow-700"
          >
            <span className="text-2xl font-bold tracking-tight">🏙️ CityFlow</span>
            <span className="hidden text-sm text-cityflow-200 lg:inline">Gestion Dynamique de la Voirie</span>
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
            <Link to="/login" className="transition-colors hover:text-cityflow-200">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
