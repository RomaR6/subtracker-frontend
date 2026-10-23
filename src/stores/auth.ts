import { defineStore } from "pinia";
import api from "../api/axios";
import type { User, UserRole, TokenResponse } from "../types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("subtracker_token") as string | null,
    user: null as User | null,
    role: "Admin" as UserRole,
    isLoading: false,
    errorMessage: "" as string
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperadmin: (state) => !!state.user?.is_superadmin,
    isAdminOrManager: (state) => state.role === "Admin" || state.role === "Manager" || !!state.user?.is_superadmin,
    userFullName: (state) => {
      if (!state.user) return "Користувач";
      const full = `${state.user.first_name || ""} ${state.user.last_name || ""}`.trim();
      return full || state.user.email;
    }
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("subtracker_token", token);
    },

    async fetchCurrentUser() {
      if (!this.token) return null;
      try {
        const res = await api.get<User>("/auth/me");
        this.user = res.data;
        return res.data;
      } catch (err) {
        this.logout();
        return null;
      }
    },

    async login(email: string, password: string): Promise<boolean> {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const res = await api.post<TokenResponse>("/auth/login", { email, password });
        this.setToken(res.data.access_token);
        this.user = res.data.user;
        return true;
      } catch (err: any) {
        this.errorMessage = err.response?.data?.detail || "Помилка авторизації. Перевірте email та пароль.";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async register(payload: { email: string; password: string; first_name?: string; last_name?: string; workspace_name?: string }): Promise<boolean> {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const res = await api.post<TokenResponse>("/auth/register", payload);
        this.setToken(res.data.access_token);
        this.user = res.data.user;
        return true;
      } catch (err: any) {
        this.errorMessage = err.response?.data?.detail || "Помилка реєстрації. Спробуйте інший email.";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("subtracker_token");
      window.location.href = "/login";
    }
  }
});