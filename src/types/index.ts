export type UserRole = "Admin" | "Manager" | "Member";

export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  is_superadmin: boolean;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  owner_id: number;
  base_currency_id: number;
  created_at: string;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user: User;
  role_name: UserRole;
  joined_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface NbuRates {
  USD: number;
  EUR: number;
  UAH: number;
}