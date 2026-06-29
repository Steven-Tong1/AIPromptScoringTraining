import { create } from 'zustand'
import { User, authAPI, LoginData, RegisterData } from '../api'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  initialized: boolean

  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  initialize: () => Promise<void>
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  initialized: false,

  initialize: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const user = await authAPI.getCurrentUser()
      set({ user, token, initialized: true })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      set({ user: null, token: null, initialized: true })
    }
  },

  login: async (data: LoginData) => {
    set({ loading: true })
    try {
      const response = await authAPI.login(data)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      set({ user: response.user, token: response.access_token, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  register: async (data: RegisterData) => {
    set({ loading: true })
    try {
      const response = await authAPI.register(data)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      set({ user: response.user, token: response.access_token, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  updateUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))
