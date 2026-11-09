export interface FormData {
  name: string;
  display_name: string;
  description?: string | null;
}

export interface ListItem {
  id: number;
  name: string | null;
  display_name: string | null;
  description: string | null;
  is_personal: boolean;
  is_platform: boolean;
  created_at: string;
  updated_at: string;
}

export type OrgRole = 'owner' | 'member';

export interface MemberItem {
  principal_id: number;
  principal_kind: 'user' | 'group';
  principal_name: string | null;
  principal_display_name: string | null;
  principal_description: string | null;
  organization_id: number;
  role: OrgRole | null;
  created_at: string;
}

export interface MemberFormData {
  principal_ids: number[];
  role: OrgRole;
}

export interface MemberCandidate {
  id: number;
  kind: MemberItem['principal_kind'];
  name: string;
  display_name?: string;
}
