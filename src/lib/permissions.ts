export type Role = 'admin' | 'owner' | 'user' | 'member' | string;

export const MASTER_ROLES = ['admin', 'owner'];

export const ROLE_ALLOWED_TABS: Record<string, string[]> = {
  admin: [
    'overview',
    'agents',
    'training',
    'conversations',
    'leads',
    'bookings',
    'services',
    'business_hours',
    'widget',
    'settings',
    'master_panel',
  ],
  owner: [
    'overview',
    'agents',
    'training',
    'conversations',
    'leads',
    'bookings',
    'services',
    'business_hours',
    'widget',
    'settings',
    'master_panel',
  ],
  user: [
    'overview',
    'agents',
    'training',
    'conversations',
    'leads',
    'bookings',
    'services',
    'business_hours',
    'widget',
    'settings',
  ],
  member: [
    'overview',
    'conversations',
    'leads',
    'bookings',
    'services',
    'business_hours',
    'widget',
  ],
};

export function canAccessTab(role: Role | undefined | null, tabId: string): boolean {
  const normalizedRole = (role || 'user').toLowerCase();
  if (MASTER_ROLES.includes(normalizedRole)) {
    return true;
  }
  const allowedTabs = ROLE_ALLOWED_TABS[normalizedRole] || ROLE_ALLOWED_TABS.user;
  return allowedTabs.includes(tabId);
}

export function isMasterAdmin(role: Role | undefined | null): boolean {
  const normalizedRole = (role || 'user').toLowerCase();
  return MASTER_ROLES.includes(normalizedRole);
}
