import { defineStore } from "pinia";
import api from "../api/axios";
import { useAuthStore } from "./auth";
import type { Workspace, WorkspaceMember, UserRole } from "../types";

export const useWorkspaceStore = defineStore("workspace", {
  state: () => ({
    workspaces: [] as Workspace[],
    currentWorkspace: null as Workspace | null,
    members: [] as WorkspaceMember[],
    usdRate: 41.52,
    eurRate: 45.10,
    isLoading: false
  }),

  actions: {
    async fetchWorkspaces() {
      this.isLoading = true;
      try {
        const res = await api.get<Workspace[]>("/workspaces/");
        this.workspaces = res.data;
        if (res.data.length > 0 && !this.currentWorkspace) {
          this.currentWorkspace = res.data[0];
        }
        if (this.currentWorkspace) {
          await this.syncCurrentUserRole(this.currentWorkspace.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },

    async syncCurrentUserRole(workspaceId: number) {
      const authStore = useAuthStore();
      if (!authStore.user) {
        await authStore.fetchCurrentUser();
      }
      try {
        const res = await api.get<any[]>(`/workspaces/${workspaceId}/members`);
        this.members = res.data;
        const currentUserId = authStore.user?.id;
        const currentUserEmail = authStore.user?.email;

        const found = res.data.find(
          (m) =>
            (m.user && (m.user.id === currentUserId || m.user.email === currentUserEmail)) ||
            m.user_id === currentUserId ||
            m.email === currentUserEmail
        );

        if (found) {
          const detectedRole = (found.role_name || found.role || "Member") as UserRole;
          authStore.role = detectedRole;
        } else if (this.currentWorkspace?.owner_id === currentUserId) {
          authStore.role = "Admin";
        } else {
          authStore.role = "Member";
        }
      } catch (err) {
        console.error(err);
      }
    },

    async fetchRates() {
      try {
        const res = await api.get("/currencies/");
        if (res.data?.active_rates) {
          this.usdRate = res.data.active_rates.USD || 41.52;
          this.eurRate = res.data.active_rates.EUR || 45.10;
        }
      } catch (err) {
        console.warn(this.usdRate);
      }
    },

    async selectWorkspace(ws: Workspace) {
      this.currentWorkspace = ws;
      await this.syncCurrentUserRole(ws.id);
    }
  }
});