import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const publicLinks = [
  { to: "/", label: "Accueil", end: true },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

const PublicLayout: React.FC = () => (
  <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
    <a
      href="#public-main-content"
      className="sr-only z-50 rounded bg-white px-4 py-2 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-blue-700"
    >
      Aller au contenu principal
    </a>

    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="text-xl font-bold tracking-tight" to="/" aria-label="CityFlow — accueil">
          CityFlow
        </Link>

        <nav aria-label="Navigation publique principale">
          <ul className="flex flex-wrap items-center gap-1 sm:gap-3">
            {publicLinks.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${
                      isActive
                        ? "bg-blue-50 text-blue-800"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            to="/login"
          >
            Se connecter
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            to="/signup"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>

    <main id="public-main-content" className="flex-1" tabIndex={-1}>
      <Outlet />
    </main>

    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} CityFlow. Tous droits réservés.</p>
        <nav aria-label="Liens légaux">
          <ul className="flex flex-wrap gap-x-5 gap-y-3">
            <li><Link className="hover:text-slate-950 hover:underline" to="/privacy">Confidentialité</Link></li>
            <li><Link className="hover:text-slate-950 hover:underline" to="/terms">Conditions</Link></li>
            <li><Link className="hover:text-slate-950 hover:underline" to="/cookies">Témoins</Link></li>
            <li><Link className="hover:text-slate-950 hover:underline" to="/accessibility">Accessibilité</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  </div>
);

export default PublicLayout;
