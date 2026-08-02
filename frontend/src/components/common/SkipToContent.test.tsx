import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkipToContent } from './SkipToContent';

describe('SkipToContent', () => {
  it('pointe vers le contenu principal avec un libellé explicite', () => {
    render(<SkipToContent targetId="cityflow-main-content" />);

    const link = screen.getByRole('link', { name: 'Aller au contenu principal' });
    expect(link.getAttribute('href')).toBe('#cityflow-main-content');
  });
});
