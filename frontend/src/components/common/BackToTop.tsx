import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

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

    container.addEventListener('scroll', handleScroll);
    // Vérification initiale
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerId]);

  const scrollToTop = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Respect des préférences de mouvement réduit
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    container.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-cityflow-600 text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cityflow-400 focus:ring-offset-2 z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Retour en haut"
      aria-hidden={!isVisible}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
