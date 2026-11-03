
import api from './api'

// Fetch all active products from the backend
export const getShopItems = async () => {
    const firstResponse = await api.get('/items', {
        params: {
            page: 1,
            limit: 100
        }
    })

    const firstData = firstResponse.data
    const items = [...(firstData.items || [])]
    const totalPages = firstData.pagination?.pages || 1

    for (let page = 2; page <= totalPages; page += 1) {
        const response = await api.get('/items', {
            params: {
                page,
                limit: 100
            }
        })

        items.push(...(response.data.items || []))
    }

    return items
}

// Fetch one product's full details
export const getShopItem = async (itemId) => {
    const response = await api.get(`/items/${itemId}`)
    return response.data.item
}

// Add a product to the cart
export const addShopItemToCart = async (
    itemId,
    quantity = 1
) => {
    const response = await api.post('/cart', {
        item_id: itemId,
        quantity
    })

    return response.data
}
