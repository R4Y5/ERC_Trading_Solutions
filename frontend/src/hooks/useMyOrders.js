
import { useCallback, useEffect, useState } from 'react'
import {
    getCustomerOrders,
    cancelCustomerOrder
} from '../services/orderService'

export default function useMyOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState(null)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const data = await getCustomerOrders()
            setOrders(data.orders || [])
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to retrieve your orders.'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const cancelOrder = async (orderId) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this pending order?'
        )

        if (!confirmed) return

        setCancellingId(orderId)
        setError('')
        setMessage('')

        try {
            const data = await cancelCustomerOrder(orderId)

            // Update the cancelled order immediately.
            if (data.order) {
                setOrders((currentOrders) =>
                    currentOrders.map((order) =>
                        order._id === orderId ? data.order : order
                    )
                )
            } else {
                await fetchOrders()
            }

            setMessage(data.message || 'Order cancelled successfully.')
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to cancel the order.'
            )
        } finally {
            setCancellingId(null)
        }
    }

    return {
        orders,
        loading,
        cancellingId,
        error,
        message,
        cancelOrder,
        refreshOrders: fetchOrders
    }
}
