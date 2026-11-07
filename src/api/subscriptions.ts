import api from "./axios";
import type { Subscription, WorkspaceSummary } from "../types/subscription";

export const subscriptionApi = {
  async getAll(params?: {
    workspace_id?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Subscription[]> {
    const response = await api.get<Subscription[]>("/subscriptions/", { params });
    return response.data;
  },

  async getCategories(workspace_id?: number): Promise<string[]> {
    const response = await api.get<string[]>("/subscriptions/categories", {
      params: { workspace_id: workspace_id || 1 }
    });
    return response.data;
  },

  async create(data: Omit<Subscription, "id" | "cost_uah" | "created_at">): Promise<Subscription> {
    const response = await api.post<Subscription>("/subscriptions/", data);
    return response.data;
  },

  async getSummary(workspace_id?: number): Promise<WorkspaceSummary> {
    const response = await api.get<WorkspaceSummary>("/subscriptions/summary", {
      params: { workspace_id }
    });
    return response.data;
  },

  async renew(subscriptionId: number): Promise<Subscription> {
    const response = await api.post(`/subscriptions/item/${subscriptionId}/renew`);
    return response.data;
  },

  async delete(subscriptionId: number): Promise<void> {
    await api.delete(`/subscriptions/item/${subscriptionId}`);
  }
};
