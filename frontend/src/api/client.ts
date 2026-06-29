import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail: string }>) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          message.error('登录已过期，请重新登录')
          break
        case 403:
          message.error('没有权限执行此操作')
          break
        case 404:
          message.error(data?.detail || '请求的资源不存在')
          break
        case 422:
          message.error('输入数据格式不正确')
          break
        case 500:
          message.error('服务器内部错误')
          break
        default:
          message.error(data?.detail || `请求失败 (${status})`)
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default apiClient
