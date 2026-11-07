import { defineStore } from "pinia";
import { authApi, type RegisterPayload, type GoogleAuthPayload } from "../api/auth";
import type { User, UserRole } from "../types";

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
    setSession(token: string, user: User) {
      this.token = token;
      this.user = user;
      localStorage.setItem("subtracker_token", token);
      localStorage.setItem("subtracker_user", JSON.stringify(user));
    },

    async fetchCurrentUser() {
      if (!this.token) return null;
      try {
        const user = await authApi.getMe();
        this.user = user;
        return user;
      } catch (err) {
        this.logout();
        return null;
      }
    },

    async login(email: string, password: string): Promise<boolean> {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const data = await authApi.login(email, password);
        this.setSession(data.access_token, data.user);
        return true;
      } catch (err: any) {
        this.errorMessage = err.response?.data?.detail || "Помилка авторизації. Перевірте email та пароль.";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async register(payload: RegisterPayload): Promise<boolean> {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const data = await authApi.register(payload);
        this.setSession(data.access_token, data.user);
        return true;
      } catch (err: any) {
        this.errorMessage = err.response?.data?.detail || "Помилка реєстрації. Спробуйте інший email.";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async loginGoogle(payload: GoogleAuthPayload): Promise<{ success: boolean; requires2fa?: boolean; userId?: number }> {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const data = await authApi.googleAuth(payload);
        if (data.requires_2fa && data.user_id) {
          return { success: false, requires2fa: true, userId: data.user_id };
        }
        if (data.access_token && data.user) {
          this.setSession(data.access_token, data.user);
          return { success: true };
        }
        return { success: false };
      } catch (err: any) {
        this.errorMessage = err.response?.data?.detail
          ? JSON.stringify(err.response.data.detail)
          : "Не вдалося авторизуватись через Google.";
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    async complete2FaLogin(userId: number): Promise<boolean> {
      this.isLoading = true;
      try {
        const data = await authApi.exchange2FaToken(userId);
        this.setSession(data.access_token, data.user);
        return true;
      } catch {
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("subtracker_token");
      localStorage.removeItem("subtracker_user");
      window.location.href = "/login";
    }
  }
});
