
import { useCallback, useEffect, useState } from 'react'
import {
    getAllAdminOrders,
    updateAdminOrderStatus
} from '../services/adminOrderService'

const FINAL_STATUSES = ['Delivered', 'Cancelled']

export default function useAdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingOrderId, setUpdatingOrderId] = useState(null)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true)
            setMessage('')
            setMessageType('')

            const fetchedOrders = await getAllAdminOrders()
            setOrders(fetchedOrders)
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get orders'
            )
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadOrders()
    }, [loadOrders])

    const updateStatus = async (orderId, status) => {
        const order = orders.find(
            (item) => item._id === orderId
        )

        if (!order) {
            setMessage('Order not found.')
            setMessageType('error')
            return
        }

        if (FINAL_STATUSES.includes(order.status)) {
            setMessage(
                'Delivered or cancelled orders cannot be updated.'
            )
            setMessageType('error')
            return
        }

        if (updatingOrderId !== null || order.status === status) {
            return
        }

        try {
            setUpdatingOrderId(orderId)
            setMessage('')
            setMessageType('')

            const response = await updateAdminOrderStatus(
                orderId,
                status
            )

            setOrders((previousOrders) =>
                previousOrders.map((item) =>
                    item._id === orderId
                        ? { ...item, status }
                        : item
                )
            )

            setMessage(
                response.message ||
                'Order status updated successfully.'
            )
            setMessageType('success')
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to update order status.'
            )
            setMessageType('error')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    return {
        orders,
        loading,
        updatingOrderId,
        message,
        messageType,
        updateStatus,
        refreshOrders: loadOrders
    }
}
