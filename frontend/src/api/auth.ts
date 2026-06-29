import apiClient from './client'

export interface User {
  id: number
  username: string
  email: string
  display_name: string | null
  is_active: boolean
  is_superuser: boolean
  created_at: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  display_name?: string
}

interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export const authAPI = {
  login: async (data: LoginData): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterData): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/register', data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/auth/me', data)
    return response.data
  },
}
