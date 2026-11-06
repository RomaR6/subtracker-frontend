import { defineStore } from "pinia";
import { workspaceApi } from "../api/workspaces";
import { useAuthStore } from "./auth";
import type { Workspace, WorkspaceMember, UserRole } from "../types";

export const useWorkspaceStore = defineStore("workspace", {
  state: () => {
    let cachedWs: Workspace | null = null;
    try {
      const stored = localStorage.getItem("subtracker_current_ws");
      if (stored) {
        cachedWs = JSON.parse(stored);
      }
    } catch {
      cachedWs = null;
    }

    let initialUsd = 45.35;
    try {
      const storedRate = localStorage.getItem("subtracker_usd_rate");
      if (storedRate) {
        initialUsd = Number(storedRate) || 45.35;
      }
    } catch {
      initialUsd = 45.35;
    }

    return {
      workspaces: [] as Workspace[],
      currentWorkspace: cachedWs as Workspace | null,
      members: [] as WorkspaceMember[],
      usdRate: initialUsd,
      eurRate: 48.10,
      isLoading: false
    };
  },

  actions: {
    async fetchWorkspaces() {
      this.isLoading = true;
      try {
        const data = await workspaceApi.getAll();
        this.workspaces = data;

        if (data.length > 0) {
          if (!this.currentWorkspace) {
            this.selectWorkspace(data[0]);
          } else {
            const exists = data.find((w) => w.id === this.currentWorkspace?.id);
            if (exists) {
              this.currentWorkspace = exists;
              localStorage.setItem("subtracker_current_ws", JSON.stringify(exists));
            } else {
              this.selectWorkspace(data[0]);
            }
          }
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
        const data = await workspaceApi.getMembers(workspaceId);
        this.members = data;
        const currentUserId = authStore.user?.id;
        const currentUserEmail = authStore.user?.email;

        const found = data.find(
          (m: any) =>
            (m.user && (m.user.id === currentUserId || m.user.email === currentUserEmail)) ||
            m.user_id === currentUserId ||
            m.email === currentUserEmail
        );

        if (found) {
          const rawRole = (found as any).role_name || (found as any).role || "Member";
          authStore.role = rawRole as UserRole;
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
      const cachedRate = localStorage.getItem("subtracker_usd_rate");
      const cachedTime = localStorage.getItem("subtracker_usd_rate_time");

      if (cachedRate && cachedTime && Date.now() - Number(cachedTime) < 4 * 60 * 60 * 1000) {
        this.usdRate = Number(cachedRate);
        return;
      }

      try {
        const data = await workspaceApi.getRates();
        if (data?.active_rates) {
          const usd = data.active_rates.USD || 45.35;
          this.usdRate = usd;
          this.eurRate = data.active_rates.EUR || 48.10;
          localStorage.setItem("subtracker_usd_rate", String(usd));
          localStorage.setItem("subtracker_usd_rate_time", String(Date.now()));
        }
      } catch (err) {
        console.warn(this.usdRate);
      }
    },

    async selectWorkspace(ws: Workspace) {
      this.currentWorkspace = ws;
      localStorage.setItem("subtracker_current_ws", JSON.stringify(ws));
      await this.syncCurrentUserRole(ws.id);
    }
  }
});
