import { useEffect, useState } from 'react'
import { getShopItems } from '../services/shopService'
import userService from '../services/userService'
import { getAllAdminOrders } from '../services/adminOrderService'

// Summary numbers for the admin dashboard cards
export default function useDashboardStats() {
    const [stats, setStats] = useState({
        products: null,
        lowStock: null,
        customers: null,
        pendingOrders: null,
        totalOrders: null
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let ignore = false

        const load = async () => {
            // Each request is independent, so one failure doesn't hide the rest
            const [items, users, orders] = await Promise.allSettled([
                getShopItems(),
                userService.getUsers(),
                getAllAdminOrders()
            ])

            if (ignore) return

            const itemList = items.status === 'fulfilled' ? items.value : null
            const userList =
                users.status === 'fulfilled' ? users.value.users || users.value || [] : null
            const orderList = orders.status === 'fulfilled' ? orders.value : null

            setStats({
                products: itemList ? itemList.length : null,
                lowStock: itemList
                    ? itemList.filter((item) => Number(item.stock?.quantity ?? 0) < 10).length
                    : null,
                customers: Array.isArray(userList)
                    ? userList.filter((user) => user.role !== 'Admin' && !user.deleted_at).length
                    : null,
                pendingOrders: orderList
                    ? orderList.filter((order) => order.status === 'Pending').length
                    : null,
                totalOrders: orderList ? orderList.length : null
            })
            setLoading(false)
        }

        load()

        return () => {
            ignore = true
        }
    }, [])

    return { stats, loading }
}
