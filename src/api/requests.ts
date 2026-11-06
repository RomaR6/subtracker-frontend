import api from "./axios";

export interface ApprovalRequestItem {
  id: number;
  workspace_id: number;
  requester_id: number;
  requester_name: string;
  reviewer_id?: number | null;
  reviewer_name?: string | null;
  currency_id: number;
  currency_code: string;
  software_name: string;
  logo_url: string;
  estimated_cost: number;
  estimated_cost_uah: number;
  reason: string;
  status: string;
  review_comment?: string | null;
  created_at: string;
  reviewed_at?: string | null;
}

export interface CreateApprovalRequestPayload {
  workspace_id: number;
  requester_id?: number;
  software_name: string;
  estimated_cost: number;
  currency_code?: "USD" | "EUR" | "UAH";
  reason: string;
}

export interface ReviewApprovalPayload {
  status: "Approved" | "Rejected";
  review_comment: string;
  reviewer_id?: number;
  auto_create_subscription?: boolean;
  category_name?: string;
  billing_period?: "monthly" | "yearly" | "quarterly";
}

export const requestsApi = {
  async getAll(workspaceId: number, statusFilter?: string): Promise<ApprovalRequestItem[]> {
    const res = await api.get<ApprovalRequestItem[]>("/requests/", {
      params: {
        workspace_id: workspaceId,
        status_filter: statusFilter
      }
    });
    return res.data;
  },

  async create(payload: CreateApprovalRequestPayload): Promise<ApprovalRequestItem> {
    const res = await api.post<ApprovalRequestItem>("/requests/", payload);
    return res.data;
  },

  async review(requestId: number, payload: ReviewApprovalPayload): Promise<ApprovalRequestItem> {
    const res = await api.patch<ApprovalRequestItem>(`/requests/${requestId}/review`, payload);
    return res.data;
  }
};
