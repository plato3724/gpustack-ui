export const OrgRoleOptions = [
  { value: 'owner', label: 'organizations.role.owner', locale: true },
  { value: 'member', label: 'organizations.role.member', locale: true }
];

export const OrganizationNamePattern = /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/;

export const isReservedOrganizationName = (value: string) =>
  ['personal', 'global', 'system', 'system-toolkit'].includes(
    value.trim().toLowerCase()
  );
