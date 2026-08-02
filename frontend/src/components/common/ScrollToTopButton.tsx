import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

type ScrollToTopButtonProps = {
  scrollContainerId: string;
};

export function ScrollToTopButton({ scrollContainerId }: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById(scrollContainerId);
    if (!container) return undefined;

    const updateVisibility = () => setVisible(container.scrollTop > 320);
    updateVisibility();
    container.addEventListener('scroll', updateVisibility, { passive: true });
    return () => container.removeEventListener('scroll', updateVisibility);
  }, [scrollContainerId]);

  if (!visible) return null;

  const scrollToTop = () => {
    document.getElementById(scrollContainerId)?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-cityflow-700 p-3 text-white shadow-lg hover:bg-cityflow-800 focus:outline-none focus:ring-2 focus:ring-cityflow-500 focus:ring-offset-2"
      aria-label="Retourner en haut de la page"
      title="Retour en haut"
    >
      <ArrowUp aria-hidden="true" size={22} />
    </button>
  );
}
