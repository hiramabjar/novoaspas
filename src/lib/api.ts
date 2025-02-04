import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
})

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  // Aqui você pode adicionar o token se necessário
  return config
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login ou renovar token
    }
    return Promise.reject(error)
  }
) 