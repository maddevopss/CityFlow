import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  containerId: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({ containerId }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const handleScroll = () => {
      // Afficher le bouton après 300px de scroll
      if (container.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    // Vérification initiale
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerId]);

  const scrollToTop = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Respect des préférences de mouvement réduit
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    container.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-50 rounded-full bg-cityflow-600 p-3 text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cityflow-400 focus:ring-offset-2 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-10 opacity-0"
      }`}
      aria-label="Retour en haut"
      aria-hidden={!isVisible}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};
