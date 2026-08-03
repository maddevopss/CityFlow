import { FormEvent, useState } from "react";

const fields = [
  ["name", "Nom", "text"],
  ["email", "Courriel", "email"],
  ["organization", "Organisation", "text"],
  ["subject", "Sujet", "text"],
] as const;

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setStatus("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });

    if (!response.ok) {
      setError("Le message n’a pas pu être envoyé. Réessayez plus tard.");
      setPending(false);
      return;
    }

    event.currentTarget.reset();
    setStatus(
      "Votre message a été reçu. Notre équipe vous répondra dès que possible.",
    );
    setPending(false);
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Nous joindre</h1>
        <p className="mt-3 text-slate-700">
          Parlez-nous de votre municipalité, de votre projet pilote ou de vos
          besoins d’intégration.
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          {fields.map(([name, label, type]) => (
            <label className="block" key={name}>
              <span className="font-medium">{label}</span>
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3"
                name={name}
                type={type}
                required={name !== "organization"}
                maxLength={160}
              />
            </label>
          ))}
          <label className="block">
            <span className="font-medium">Message</span>
            <textarea
              className="mt-2 min-h-40 w-full rounded-md border border-slate-300 p-3"
              name="message"
              required
              minLength={10}
              maxLength={4000}
            />
          </label>
          <label className="sr-only" aria-hidden="true">
            Site web
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          {status && (
            <p role="status" className="text-green-800">
              {status}
            </p>
          )}
          <button
            disabled={pending}
            className="min-h-11 rounded-md bg-slate-950 px-6 font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Envoi…" : "Envoyer"}
          </button>
        </form>
      </div>
      <aside className="rounded-xl bg-slate-100 p-6">
        <h2 className="text-xl font-semibold">Coordonnées officielles</h2>
        <p className="mt-4 text-slate-700">
          MAD DevOps — CityFlow
          <br />
          Québec, Canada
        </p>
        <p className="mt-4">
          <a className="underline" href="mailto:contact@maddevops.com">
            contact@maddevops.com
          </a>
        </p>
      </aside>
    </section>
  );
}
