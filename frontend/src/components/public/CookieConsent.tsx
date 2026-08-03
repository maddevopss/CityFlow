import { useState } from "react";
import { Link } from "react-router-dom";

const storageKey = "cityflow-cookie-consent-v1";

type CookieChoice = "necessary" | "all";

export default function CookieConsent() {
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.localStorage.getItem(storageKey),
  );

  if (!visible) return null;

  function choose(value: CookieChoice) {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ value, recordedAt: new Date().toISOString() }),
    );
    setVisible(false);
  }

  return (
    <section
      aria-label="Choix des témoins"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-5 shadow-2xl"
    >
      <h2 className="text-lg font-semibold text-slate-950">
        Votre choix concernant les témoins
      </h2>
      <p className="mt-2 text-sm text-slate-700">
        Les témoins nécessaires assurent le fonctionnement et la sécurité. Les
        témoins facultatifs restent désactivés sans votre accord. {" "}
        <Link className="underline" to="/cookies">
          Consulter la politique
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="min-h-11 rounded-md border border-slate-400 px-4 font-semibold"
          onClick={() => choose("necessary")}
        >
          Refuser les facultatifs
        </button>
        <button
          type="button"
          className="min-h-11 rounded-md bg-slate-950 px-4 font-semibold text-white"
          onClick={() => choose("all")}
        >
          Tout accepter
        </button>
      </div>
    </section>
  );
}
