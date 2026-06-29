import apiClient from './client'

export interface MembershipPlan {
  id: number
  name: string
  description: string | null
  price: number
  duration_days: number
  max_prompts_per_day: number
  max_score_queries: number
  can_use_ai_scoring: boolean
  can_export_reports: boolean
  priority_support: boolean
  is_active: boolean
}

export interface UserMembership {
  id: number
  user_id: number
  membership_id: number
  membership_name: string | null
  start_date: string
  end_date: string
  is_active: boolean
  is_expired: boolean
}

export interface PaymentRecord {
  id: number
  user_id: number
  membership_id: number
  membership_name: string | null
  amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
}

export const membershipsAPI = {
  getPlans: async (): Promise<MembershipPlan[]> => {
    const response = await apiClient.get<MembershipPlan[]>('/memberships/plans')
    return response.data
  },

  getPlan: async (id: number): Promise<MembershipPlan> => {
    const response = await apiClient.get<MembershipPlan>(`/memberships/plans/${id}`)
    return response.data
  },

  getMyMembership: async (): Promise<UserMembership> => {
    const response = await apiClient.get<UserMembership>('/memberships/my')
    return response.data
  },

  getMembershipHistory: async (): Promise<UserMembership[]> => {
    const response = await apiClient.get<UserMembership[]>('/memberships/my/history')
    return response.data
  },

  createPayment: async (data: {
    membership_id: number
    amount: number
    payment_method?: string
  }): Promise<PaymentRecord> => {
    const response = await apiClient.post<PaymentRecord>(
      '/memberships/payments',
      data
    )
    return response.data
  },

  getPayments: async (skip = 0, limit = 20): Promise<PaymentRecord[]> => {
    const response = await apiClient.get<PaymentRecord[]>('/memberships/payments', {
      params: { skip, limit },
    })
    return response.data
  },
}
