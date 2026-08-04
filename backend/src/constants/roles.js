// Role constants and role set definitions
// Centralized to avoid duplication across routes

const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MUNICIPAL_AGENT: 'MUNICIPAL_AGENT',
  INSPECTOR: 'INSPECTOR',
  AGENT: 'AGENT',
  VIEWER: 'VIEWER',
  CITIZEN: 'CITIZEN'
};

// Common role combinations for authorization middleware
const ROLE_SETS = {
  // Admin only
  ADMIN_ONLY: [ROLES.ADMIN],

  // Managers and above
  MANAGERS: [ROLES.ADMIN, ROLES.MANAGER],

  // Municipal staff
  STAFF: [ROLES.ADMIN, ROLES.MANAGER, ROLES.MUNICIPAL_AGENT],

  // Operations staff (includes inspectors)
  OPERATIONS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.MUNICIPAL_AGENT, ROLES.INSPECTOR],

  // Everyone (read-only)
  VIEWERS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.MUNICIPAL_AGENT, ROLES.INSPECTOR, ROLES.VIEWER],

  // Agents (older role variant)
  AGENTS: [ROLES.ADMIN, ROLES.AGENT],

  // Events/permits staff
  EVENTS_STAFF: [ROLES.ADMIN, ROLES.MUNICIPAL_AGENT]
};

module.exports = {
  ROLES,
  ROLE_SETS
};
