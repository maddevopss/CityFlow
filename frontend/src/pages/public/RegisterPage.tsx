import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export default function RegisterPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const data = new FormData(event.currentTarget);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        municipalityName: data.get("municipalityName"),
        fullName: data.get("fullName"),
        email: data.get("email"),
        password: data.get("password"),
        acceptedTerms: data.get("acceptedTerms") === "on",
      });
      setStatus("success");
      setMessage(
        "Votre compte municipal a été créé. Vous pouvez maintenant vous connecter.",
      );
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Inscription impossible"
          : "Inscription impossible",
      );
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black tracking-tight">
        Créer un compte CityFlow
      </h1>
      <p className="mt-3 text-slate-600">
        Créez votre espace municipal et le premier compte administrateur.
      </p>
      {message && (
        <div
          role="status"
          className={`mt-6 rounded-lg p-4 ${
            status === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="font-semibold">Municipalité</span>
          <input
            name="municipalityName"
            required
            maxLength={120}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="font-semibold">Nom complet</span>
          <input
            name="fullName"
            required
            maxLength={120}
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="font-semibold">Courriel</span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="font-semibold">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <span className="mt-1 block text-sm text-slate-500">
            Au moins 12 caractères.
          </span>
        </label>
        <label className="flex gap-3 text-sm">
          <input
            name="acceptedTerms"
            type="checkbox"
            required
            className="mt-1"
          />
          <span>
            J’accepte les{" "}
            <Link to="/terms" className="underline">
              conditions d’utilisation
            </Link>{" "}
            et la{" "}
            <Link to="/privacy" className="underline">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        <button
          disabled={status === "loading"}
          className="w-full rounded-lg bg-sky-600 px-4 py-3 font-bold text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {status === "loading" ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </section>
  );
}
