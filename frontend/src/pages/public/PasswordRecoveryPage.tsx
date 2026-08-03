import { FormEvent, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

export default function PasswordRecoveryPage() {
  const { pathname } = useLocation();
  const { token } = useParams();
  const reset = pathname.startsWith("/reset-password/");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    const data = new FormData(event.currentTarget);
    const body = reset
      ? {
          token,
          password: data.get("password"),
          passwordConfirmation: data.get("passwordConfirmation"),
        }
      : { email: data.get("email") };

    if (
      reset &&
      "password" in body &&
      body.password !== body.passwordConfirmation
    ) {
      setError("Les mots de passe ne correspondent pas.");
      setPending(false);
      return;
    }

    const response = await fetch(
      `/api/v1/auth/${reset ? "reset-password" : "forgot-password"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      setError(
        reset
          ? "Le lien est invalide ou expiré."
          : "La demande n’a pas pu être traitée.",
      );
      setPending(false);
      return;
    }

    setMessage(
      reset
        ? "Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter."
        : "Si un compte correspond, les instructions ont été envoyées.",
    );
    setPending(false);
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-950">
        {reset ? "Réinitialiser le mot de passe" : "Mot de passe oublié"}
      </h1>
      <p className="mt-3 text-slate-700">
        {reset
          ? "Choisissez un nouveau mot de passe robuste."
          : "Saisissez votre courriel. La réponse demeure identique, qu’un compte existe ou non."}
      </p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        {reset ? (
          <>
            <label className="block">
              <span className="font-medium">Nouveau mot de passe</span>
              <input
                className="mt-2 min-h-11 w-full rounded-md border px-3"
                name="password"
                type="password"
                minLength={12}
                required
                autoComplete="new-password"
              />
            </label>
            <label className="block">
              <span className="font-medium">Confirmation</span>
              <input
                className="mt-2 min-h-11 w-full rounded-md border px-3"
                name="passwordConfirmation"
                type="password"
                minLength={12}
                required
                autoComplete="new-password"
              />
            </label>
          </>
        ) : (
          <label className="block">
            <span className="font-medium">Courriel</span>
            <input
              className="mt-2 min-h-11 w-full rounded-md border px-3"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-green-800">
            {message}
          </p>
        )}
        <button
          className="min-h-11 w-full rounded-md bg-slate-950 px-5 font-semibold text-white disabled:opacity-60"
          disabled={pending}
        >
          {pending
            ? "Traitement…"
            : reset
              ? "Modifier le mot de passe"
              : "Envoyer les instructions"}
        </button>
      </form>
    </section>
  );
}
