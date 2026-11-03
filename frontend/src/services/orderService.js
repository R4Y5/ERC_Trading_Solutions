
import api from './api'

export const getCustomerOrders = async () => {
    const response = await api.get('/orders')
    return response.data
}

export const cancelCustomerOrder = async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/cancel`)
    return response.data
}
