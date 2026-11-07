import api from "./axios";
import type { User, TokenResponse } from "../types";

export interface GoogleAuthPayload {
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

export interface GoogleAuthResult {
  access_token?: string;
  token_type: string;
  user?: User;
  requires_2fa: boolean;
  temp_email?: string;
  user_id?: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  workspace_name?: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/login", { email, password });
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/register", payload);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },

  async googleAuth(payload: GoogleAuthPayload): Promise<GoogleAuthResult> {
    const res = await api.post<GoogleAuthResult>("/auth/google", payload);
    return res.data;
  },

  async exchange2FaToken(userId: number): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>(`/auth/2fa/exchange-token?user_id=${userId}`);
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>("/auth/reset-password", { token, new_password });
    return res.data;
  }
};
