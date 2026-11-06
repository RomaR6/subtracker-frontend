import api from "./axios";

export interface FopCalculationPayload {
  net_salary_uah: number;
  custom_software_cost_uah?: number;
  assigned_user_id?: number;
}

export interface FopCalculationResult {
  net_salary_uah: number;
  single_tax_5_percent: number;
  gross_income_uah: number;
  esv_uah: number;
  total_software_cost_uah: number;
  total_cost_to_company_uah: number;
  formula_reference: string;
}

export interface CashFlowPoint {
  month_name: string;
  year: number;
  total_uah: number;
  total_usd: number;
  is_projected: boolean;
}

export interface UpcomingPaymentItem {
  id: number;
  name: string;
  category: string;
  domain?: string;
  logo_url: string;
  cost_usd: number;
  cost_uah: number;
  next_billing_date: string;
  days_left: number;
}

export interface AnalyticsDashboardData {
  monthly_budget_uah: number;
  monthly_budget_usd: number;
  active_subscriptions_count: number;
  pending_approvals_count: number;
  pending_approvals_budget_uah: number;
  avg_check_per_engineer_uah: number;
  engineers_count: number;
  nbu_usd_rate: number;
  cash_flow: CashFlowPoint[];
  upcoming_payments_14_days: UpcomingPaymentItem[];
  inactive_subscriptions_count: number;
  potential_monthly_savings_uah: number;
}

export const analyticsApi = {
  async getDashboard(workspaceId: number): Promise<AnalyticsDashboardData> {
    const res = await api.get<AnalyticsDashboardData>("/analytics/dashboard", {
      params: { workspace_id: workspaceId }
    });
    return res.data;
  },

  async calculateFop(workspaceId: number, payload: FopCalculationPayload): Promise<FopCalculationResult> {
    const res = await api.post<FopCalculationResult>("/analytics/fop-calculator", payload, {
      params: { workspace_id: workspaceId }
    });
    return res.data;
  },

  getFopPdfUrl(workspaceId: number, netSalary: number, softwareCost: number): string {
    const base = api.defaults.baseURL || "/api/v1";
    return `${base}/analytics/export/fop-pdf?workspace_id=${workspaceId}&net_salary=${netSalary}&software_cost=${softwareCost}`;
  },

  getFopCsvUrl(workspaceId: number, netSalary: number, softwareCost: number): string {
    const base = api.defaults.baseURL || "/api/v1";
    return `${base}/analytics/export/fop-csv?workspace_id=${workspaceId}&net_salary=${netSalary}&software_cost=${softwareCost}`;
  },

  sendTelegramAlert(subscriptionId: number, chatId: string): Promise<any> {
    return api.post(`/subscriptions/${subscriptionId}/send-telegram`, null, {
      params: { chat_id: chatId }
    });
  }
};
