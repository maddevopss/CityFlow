import { describe, expect, it } from 'vitest';
import { escalationAriaLive, escalationAriaRole, escalationFocusTarget, escalationStatusClassName, escalationStatusLabel } from './accessibility';

describe('citizen escalation accessibility', () => {
  it('réserve les annonces assertives aux erreurs', () => {
    expect(escalationAriaRole('error')).toBe('alert');
    expect(escalationAriaLive('error')).toBe('assertive');
    expect(escalationAriaRole('warning')).toBe('status');
  });

  it('détermine le focus et les libellés', () => {
    expect(escalationFocusTarget('warning')).toBe('message');
    expect(escalationFocusTarget('success')).toBe('run-button');
    expect(escalationStatusLabel('loading')).toBe('Traitement en cours');
  });

  it('fournit des contrastes renforcés', () => {
    expect(escalationStatusClassName('error')).toContain('text-red-950');
    expect(escalationStatusClassName('warning')).toContain('border-amber-300');
  });
});
