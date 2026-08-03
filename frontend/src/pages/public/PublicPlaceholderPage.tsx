import React from "react";

interface PublicPlaceholderPageProps {
  title: string;
  description: string;
}

const PublicPlaceholderPage: React.FC<PublicPlaceholderPageProps> = ({
  title,
  description,
}) => (
  <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
        CityFlow
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
        {description}
      </p>
    </div>
  </section>
);

export default PublicPlaceholderPage;
