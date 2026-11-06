import api from "./axios";
import type { Workspace, WorkspaceMember, UserRole } from "../types";

export interface CreateWorkspacePayload {
  name: string;
  base_currency_code?: "UAH" | "USD" | "EUR";
}

export interface InvitePayload {
  email: string;
  role_name: UserRole;
}

export interface InviteResponse {
  workspace_id: number;
  invited_email: string;
  role_name: UserRole;
  invite_token: string;
  invite_link: string;
}

export const workspaceApi = {
  async getAll(): Promise<Workspace[]> {
    const res = await api.get<Workspace[]>("/workspaces/");
    return res.data;
  },

  async create(data: CreateWorkspacePayload): Promise<Workspace> {
    const res = await api.post<Workspace>("/workspaces/", data);
    return res.data;
  },

  async getMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    const res = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
    return res.data;
  },

  async updateMemberRole(workspaceId: number, memberId: number, role_name: UserRole): Promise<WorkspaceMember> {
    const res = await api.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}`, { role_name });
    return res.data;
  },

  async removeMember(workspaceId: number, memberId: number): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  async createInvite(workspaceId: number, payload: InvitePayload): Promise<InviteResponse> {
    const res = await api.post<InviteResponse>(`/workspaces/${workspaceId}/invites`, payload);
    return res.data;
  },

  async getRates(): Promise<any> {
    const res = await api.get("/currencies/");
    return res.data;
  }
};
