import { defineStore } from "pinia";
import api from "../api/axios";
import type { Workspace, WorkspaceMember } from "../types";

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
      } catch (err) {
        console.error("Не вдалося завантажити робочі простори:", err);
      } finally {
        this.isLoading = false;
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
        console.warn("Використовуємо кешований курс НБУ:", this.usdRate);
      }
    },

    selectWorkspace(ws: Workspace) {
      this.currentWorkspace = ws;
    }
  }
});