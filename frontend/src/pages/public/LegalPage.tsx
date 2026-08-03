import { useLocation } from "react-router-dom";

type LegalPageDefinition = {
  id: string;
  version: string;
  title: string;
  sections: [string, string][];
};

const status = "PROJET — RÉVISION JURIDIQUE REQUISE";
const updatedAt = "3 août 2026";

const content: Record<string, LegalPageDefinition> = {
  "/about": {
    id: "LEGAL-ABOUT-001",
    version: "0.1.0",
    title: "À propos de CityFlow",
    sections: [
      ["Notre mission", "CityFlow aide les municipalités à structurer, vérifier et diffuser l’information liée aux événements routiers, aux permis et aux inspections."],
      ["Responsabilité", "La plateforme soutient la décision humaine. Elle ne remplace ni l’autorité municipale, ni les obligations réglementaires, ni la validation des données diffusées."],
    ],
  },
  "/privacy": {
    id: "LEGAL-PRIVACY-QC-001",
    version: "0.1.0",
    title: "Politique de confidentialité",
    sections: [
      ["Exploitant et contact", "Le service est présenté publiquement sous l’identité MAD DevOps — CityFlow, Québec, Canada. Le canal public confirmé est contact@maddevops.com. La dénomination juridique enregistrée et la désignation écrite du responsable de la protection des renseignements personnels doivent être confirmées avant la mise en production commerciale."],
      ["Renseignements traités", "La collecte doit être limitée aux renseignements nécessaires à la création du compte, à la sécurité, au soutien, à la fourniture du service et au respect des obligations légales."],
      ["Finalités et communications", "Les finalités, fournisseurs, sous-traitants, lieux d’hébergement et transferts hors Québec ou hors Canada doivent être inventoriés et validés avant publication finale."],
      ["Conservation et destruction", "Le calendrier proposé est documenté dans LEGAL-RETENTION-QC-001. Il doit être approuvé par le responsable de la protection des renseignements personnels et la direction avant de devenir normatif."],
      ["Droits et plaintes", "Les demandes d’accès, de rectification, de retrait du consentement ou les plaintes peuvent être transmises au canal public confirmé. La procédure formelle, les délais et le responsable doivent être approuvés avant publication finale."],
    ],
  },
  "/terms": {
    id: "LEGAL-TERMS-001",
    version: "0.1.0",
    title: "Conditions d’utilisation",
    sections: [
      ["Acceptation", "L’utilisation de CityFlow est soumise aux présentes conditions et aux politiques applicables, après validation juridique de leur opposabilité et du mécanisme d’acceptation."],
      ["Compte et accès", "Chaque personne protège ses identifiants, utilise un compte nominatif et respecte les rôles attribués par son organisation."],
      ["Utilisation permise", "Le service doit être utilisé légalement, sans compromettre sa sécurité, sa disponibilité ou les droits d’autrui."],
      ["Données et décisions", "L’organisation demeure responsable de la qualité des données saisies, des décisions municipales et des informations rendues publiques."],
    ],
  },
  "/cookies": {
    id: "LEGAL-COOKIES-001",
    version: "0.1.0",
    title: "Politique sur les témoins",
    sections: [
      ["Témoins nécessaires", "CityFlow peut utiliser des témoins strictement nécessaires à la sécurité, à la session et aux préférences."],
      ["Témoins facultatifs", "Aucun témoin facultatif ne doit être activé avant un consentement explicite. L’inventaire réel des témoins et fournisseurs doit être confirmé avant publication finale."],
      ["Modifier votre choix", "La procédure de retrait ou de modification du choix doit demeurer aussi simple que l’acceptation initiale."],
    ],
  },
  "/accessibility": {
    id: "LEGAL-A11Y-001",
    version: "0.1.0",
    title: "Accessibilité",
    sections: [
      ["Engagement", "CityFlow vise le niveau AA des Règles pour l’accessibilité des contenus Web 2.1 pour ses pages publiques."],
      ["Mesures", "Navigation au clavier, structure sémantique, contrastes suffisants, messages annoncés et cibles tactiles adaptées sont intégrés au design."],
      ["Signaler un obstacle", "Les obstacles peuvent être signalés à contact@maddevops.com. Le délai de traitement et le responsable doivent être confirmés avant publication finale."],
    ],
  },
};

export default function LegalPage() {
  const page = content[useLocation().pathname] ?? content["/about"];

  return (
    <article className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">{status}</p>
        <p className="mt-1">
          Cette préparation technique ne remplace pas un avis juridique fourni
          par un professionnel autorisé au Québec.
        </p>
      </div>
      <dl className="mt-6 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <div><dt className="font-semibold text-slate-900">Document</dt><dd>{page.id}</dd></div>
        <div><dt className="font-semibold text-slate-900">Version</dt><dd>{page.version}</dd></div>
        <div><dt className="font-semibold text-slate-900">Mise à jour</dt><dd>{updatedAt}</dd></div>
      </dl>
      <h1 className="mt-6 text-4xl font-bold text-slate-950">{page.title}</h1>
      <div className="mt-10 space-y-8">
        {page.sections.map(([title, body]) => (
          <section key={title}>
            <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
