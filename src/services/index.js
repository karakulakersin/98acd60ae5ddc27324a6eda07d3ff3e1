import apiClient from '@/services/api.js'
import endpoint from '@/services/endpoint.js'

export const getFishList = () => apiClient.get(endpoint.getFishList)
