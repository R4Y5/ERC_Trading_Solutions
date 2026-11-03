
import api from './api'
import { getToken } from '../utils/auth'

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
})

export const getAllAdminOrders = async () => {
    const response = await api.get(
        '/orders/admin/all',
        getAuthConfig()
    )

    return response.data.orders || []
}

export const updateAdminOrderStatus = async (orderId, status) => {
    const response = await api.put(
        `/orders/admin/${orderId}`,
        { status },
        getAuthConfig()
    )

    return response.data
}
