import { queryUserDirectory } from '@/pages/users/apis';
import { request } from '@umijs/max';
import type { CancelToken } from 'axios';
import type {
  FormData,
  ListItem,
  MemberCandidate,
  MemberFormData,
  MemberItem,
  OrgRole
} from '../config/types';

// The shared request client supplies the management API baseURL (/v2).
const ORGANIZATIONS_API = '/organizations';

export function queryOrganizations(
  params: Global.SearchParams,
  options?: { token?: CancelToken }
) {
  return request<Global.PageResponse<ListItem>>(ORGANIZATIONS_API, {
    method: 'GET',
    params,
    cancelToken: options?.token
  });
}

export function queryOrganization(id: number) {
  return request<ListItem>(`${ORGANIZATIONS_API}/${id}`, { method: 'GET' });
}

export function createOrganization(data: FormData) {
  return request<ListItem>(ORGANIZATIONS_API, { method: 'POST', data });
}

export function updateOrganization(id: number, data: Omit<FormData, 'name'>) {
  return request<ListItem>(`${ORGANIZATIONS_API}/${id}`, {
    method: 'PUT',
    data
  });
}

export function deleteOrganization(id: number) {
  return request(`${ORGANIZATIONS_API}/${id}`, { method: 'DELETE' });
}

export function queryOrganizationMembers(id: number) {
  // Unlike the organization list, this endpoint returns a plain array.
  return request<MemberItem[]>(`${ORGANIZATIONS_API}/${id}/members`, {
    method: 'GET'
  });
}

export function addOrganizationMembers(id: number, data: MemberFormData) {
  return request<MemberItem[]>(`${ORGANIZATIONS_API}/${id}/members`, {
    method: 'POST',
    data
  });
}

export function updateOrganizationMember(
  id: number,
  principalId: number,
  role: OrgRole
) {
  return request<MemberItem>(
    `${ORGANIZATIONS_API}/${id}/members/${principalId}`,
    { method: 'PUT', data: { role } }
  );
}

export function removeOrganizationMember(id: number, principalId: number) {
  return request(`${ORGANIZATIONS_API}/${id}/members/${principalId}`, {
    method: 'DELETE'
  });
}

export async function queryMemberCandidates(): Promise<MemberCandidate[]> {
  // page=-1 is the existing backend's unpaginated directory convention.
  // User ids ARE user principal ids after identity consolidation.
  const [users, groups] = await Promise.all([
    queryUserDirectory({ page: -1 }),
    request<Global.PageResponse<{ id: number; name: string }>>('/groups', {
      method: 'GET',
      params: { page: -1 }
    })
  ]);
  return [
    ...users.items.map((user) => ({
      id: user.id,
      kind: 'user' as const,
      name: user.username,
      display_name: user.full_name
    })),
    ...groups.items.map((group) => ({
      id: group.id,
      kind: 'group' as const,
      name: group.name
    }))
  ];
}
