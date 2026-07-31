import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-cityflow-700 text-white shadow-lg">
      <div className="px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-2xl font-bold tracking-tight">🏙️ CityFlow</span>
          <span className="text-sm text-cityflow-200 hidden md:inline">Gestion Dynamique de la Voirie</span>
        </Link>
        
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
