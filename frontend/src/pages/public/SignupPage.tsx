import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    if (password !== data.get("passwordConfirmation")) { setError("Les mots de passe ne correspondent pas."); setPending(false); return; }
    const response = await fetch("/api/v1/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ municipalityName: data.get("municipalityName"), fullName: data.get("fullName"), email: data.get("email"), password, acceptTerms: data.get("acceptTerms") === "on", acceptPrivacy: data.get("acceptPrivacy") === "on" }) });
    if (!response.ok) { setError("L’inscription n’a pas pu être complétée. Vérifiez les renseignements fournis."); setPending(false); return; }
    navigate("/login?registered=1", { replace: true });
  }

  return <section className="mx-auto max-w-2xl px-4 py-16"><h1 className="text-3xl font-bold text-slate-950">Créer votre organisation CityFlow</h1><p className="mt-3 text-slate-700">Le premier compte devient administrateur de l’organisation.</p><form className="mt-8 space-y-5" onSubmit={submit}>{[["municipalityName","Nom de l’organisation","text"],["fullName","Nom complet","text"],["email","Courriel","email"],["password","Mot de passe","password"],["passwordConfirmation","Confirmer le mot de passe","password"]].map(([name,label,type]) => <label className="block" key={name}><span className="font-medium text-slate-900">{label}</span><input className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3" name={name} type={type} required minLength={name.includes("password") ? 12 : undefined} autoComplete={name === "email" ? "email" : name === "password" ? "new-password" : undefined}/></label>)}<label className="flex gap-3"><input name="acceptTerms" type="checkbox" required/><span>J’accepte les <Link className="underline" to="/terms">conditions d’utilisation</Link>.</span></label><label className="flex gap-3"><input name="acceptPrivacy" type="checkbox" required/><span>J’ai lu la <Link className="underline" to="/privacy">politique de confidentialité</Link>.</span></label>{error && <p role="alert" className="text-red-700">{error}</p>}<button disabled={pending} className="min-h-11 w-full rounded-md bg-slate-950 px-5 font-semibold text-white disabled:opacity-60">{pending ? "Création…" : "Créer l’organisation"}</button></form></section>;
}
