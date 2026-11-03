import api from './api'

export const getCart = async () => {
    const response = await api.get('/cart')
    return response.data
}

export const updateCartItem = async (itemId, quantity) => {
    const response = await api.put(`/cart/${itemId}`, {
        quantity: Number(quantity)
    })
    return response.data
}

export const removeCartItem = async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`)
    return response.data
}

export const checkoutCart = async (itemIds) => {
    const payload = itemIds === undefined
        ? {}
        : { item_ids: itemIds }

    const response = await api.post('/orders', payload)
    return response.data
}
