import apiClient from './client'

export interface Prompt {
  id: number
  title: string
  content: string
  category: string | null
  difficulty: string
  author_id: number
  is_public: boolean
  created_at: string
  updated_at: string
  author_name: string | null
  average_score: number | null
}

export interface PromptScore {
  id: number
  prompt_id: number
  user_id: number
  clarity: number
  specificity: number
  creativity: number
  feasibility: number
  overall_score: number
  feedback: string | null
  ai_feedback: string | null
  created_at: string
  username: string | null
}

export interface PromptCreateData {
  title: string
  content: string
  category?: string
  difficulty?: string
  is_public?: boolean
}

export interface ScoreCreateData {
  clarity: number
  specificity: number
  creativity: number
  feasibility: number
  feedback?: string
}

export const promptsAPI = {
  list: async (params?: {
    skip?: number
    limit?: number
    category?: string
    difficulty?: string
    author_id?: number
    public_only?: boolean
  }): Promise<Prompt[]> => {
    const response = await apiClient.get<Prompt[]>('/prompts', { params })
    return response.data
  },

  get: async (id: number): Promise<Prompt> => {
    const response = await apiClient.get<Prompt>(`/prompts/${id}`)
    return response.data
  },

  create: async (data: PromptCreateData): Promise<Prompt> => {
    const response = await apiClient.post<Prompt>('/prompts', data)
    return response.data
  },

  update: async (id: number, data: Partial<PromptCreateData>): Promise<Prompt> => {
    const response = await apiClient.put<Prompt>(`/prompts/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/prompts/${id}`)
  },

  search: async (q: string, skip = 0, limit = 20): Promise<Prompt[]> => {
    const response = await apiClient.get<Prompt[]>('/prompts/search', {
      params: { q, skip, limit },
    })
    return response.data
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<{ categories: string[] }>('/prompts/categories')
    return response.data.categories
  },

  score: async (promptId: number, data: ScoreCreateData): Promise<PromptScore> => {
    const response = await apiClient.post<PromptScore>(
      `/prompts/${promptId}/scores`,
      data
    )
    return response.data
  },

  getScores: async (promptId: number): Promise<PromptScore[]> => {
    const response = await apiClient.get<PromptScore[]>(
      `/prompts/${promptId}/scores`
    )
    return response.data
  },
}
