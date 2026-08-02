type SkipToContentProps = {
  targetId: string;
};

export function SkipToContent({ targetId }: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only fixed left-3 top-3 z-50 rounded-md bg-white px-4 py-3 font-medium text-cityflow-800 shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-cityflow-500"
    >
      Aller au contenu principal
    </a>
  );
}
