import { Link, NavLink, Outlet } from "react-router-dom";
import CookieConsent from "./CookieConsent";

const inactiveLink = "text-slate-700 hover:bg-slate-100";
const activeLink = "bg-slate-900 text-white";
const navigationLink = "rounded-md px-3 py-2 text-sm font-medium";
const loginLink =
  "rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100";
const registerLink =
  "rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${navigationLink} ${isActive ? activeLink : inactiveLink}`;

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-black tracking-tight">
            CityFlow
          </Link>
          <nav
            aria-label="Navigation publique"
            className="flex items-center gap-1"
          >
            <NavLink to="/" end className={linkClass}>
              Accueil
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              À propos
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
            <Link to="/login" className={loginLink}>
              Connexion
            </Link>
            <Link to="/register" className={registerLink}>
              Inscription
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
          <strong className="text-slate-900">CityFlow</strong>
          <p>
            Une source municipale claire pour les entraves, permis, inspections
            et demandes citoyennes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="hover:text-slate-950">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-slate-950">
              Confidentialité
            </Link>
            <Link to="/terms" className="hover:text-slate-950">
              Conditions
            </Link>
            <Link to="/cookies" className="hover:text-slate-950">
              Témoins
            </Link>
            <Link to="/accessibility" className="hover:text-slate-950">
              Accessibilité
            </Link>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
}
