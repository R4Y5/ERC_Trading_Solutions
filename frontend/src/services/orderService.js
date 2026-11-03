import api from './api'

export const getCustomerOrders = async () => {
    const response = await api.get('/orders')
    return response.data
}

export const cancelCustomerOrder = async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/cancel`)
    return response.data
}

// Download an order's PDF receipt (works for customers and admins).
// The login token is added by api.js, so the file is fetched as a
// blob and saved through a temporary link.
export const downloadOrderReceipt = async (orderId) => {
    const response = await api.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob'
    })

    const url = URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
    )

    const link = document.createElement('a')
    link.href = url
    link.download = `ERC-Receipt-${orderId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()

    // Give the browser a moment to start the download before cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}