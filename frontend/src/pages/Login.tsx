import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Input } from "../components/forms/Input";
import {
  resolveSafeReturnLocation,
  type ReturnLocation,
} from "../features/auth/returnLocation";
import { useAuth } from "../hooks/useAuth";

type LoginLocationState = {
  from?: ReturnLocation;
};

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      const { from } = (location.state as LoginLocationState | null) ?? {};
      navigate(resolveSafeReturnLocation(from), { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cityflow-50 to-cityflow-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cityflow-700">
              🏙️ CityFlow
            </h1>
            <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
          </div>

          {error && (
            <div
              className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Courriel"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              autoFocus
            />

            <Input
              id="password"
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              Se connecter
            </Button>
          </form>

          <footer className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              CityFlow © 2026 - Plateforme de Gestion Dynamique de la Voirie
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
};

export default Login;
