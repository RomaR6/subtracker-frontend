export interface Subscription {
  id: number
  name: string
  description?: string
  category: string
  owner_name: string
  owner_department?: string
  billing_period: string
  cost_usd: number
  cost_uah: number
  next_payment_date: string
  status: string
  created_at?: string
}

export interface WorkspaceSummary {
  total_subscriptions: number
  monthly_budget_uah: number
  monthly_budget_usd: number
  active_subscriptions: number
  upcoming_payments_count: number
}
