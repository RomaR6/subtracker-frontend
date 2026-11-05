import { defineStore } from "pinia";
import api from "../api/axios";
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
    } catch (e) {
      cachedWs = null;
    }

    let initialUsd = 41.52;
    try {
      const storedRate = localStorage.getItem("subtracker_usd_rate");
      if (storedRate) {
        initialUsd = Number(storedRate) || 41.52;
      }
    } catch (e) {
      initialUsd = 41.52;
    }

    return {
      workspaces: [] as Workspace[],
      currentWorkspace: cachedWs as Workspace | null,
      members: [] as WorkspaceMember[],
      usdRate: initialUsd,
      eurRate: 45.10,
      isLoading: false
    };
  },

  actions: {
    async fetchWorkspaces() {
      this.isLoading = true;
      try {
        const res = await api.get<Workspace[]>("/workspaces/");
        this.workspaces = res.data;

        if (res.data.length > 0) {
          if (!this.currentWorkspace) {
            this.selectWorkspace(res.data[0]);
          } else {
            const exists = res.data.find((w) => w.id === this.currentWorkspace?.id);
            if (exists) {
              this.currentWorkspace = exists;
              localStorage.setItem("subtracker_current_ws", JSON.stringify(exists));
            } else {
              this.selectWorkspace(res.data[0]);
            }
          }
        }

        if (this.currentWorkspace) {
          this.syncCurrentUserRole(this.currentWorkspace.id);
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
      const cachedRate = localStorage.getItem("subtracker_usd_rate");
      const cachedTime = localStorage.getItem("subtracker_usd_rate_time");

      if (cachedRate && cachedTime && Date.now() - Number(cachedTime) < 4 * 60 * 60 * 1000) {
        this.usdRate = Number(cachedRate);
        return;
      }

      try {
        const res = await api.get("/currencies/");
        if (res.data?.active_rates) {
          const usd = res.data.active_rates.USD || 41.52;
          this.usdRate = usd;
          this.eurRate = res.data.active_rates.EUR || 45.10;
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