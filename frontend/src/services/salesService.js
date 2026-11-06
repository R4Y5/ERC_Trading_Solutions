import api from './api'
import { getToken } from '../utils/auth'

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
})

// start / end are 'YYYY-MM-DD' strings, groupBy is 'day' or 'month'
export const getSalesReport = async ({ start, end, groupBy }) => {
    const response = await api.get('/orders/admin/sales', {
        ...getAuthConfig(),
        params: { start, end, groupBy }
    })

    return response.data
}

// Best-selling products.
// metric: 'units' | 'revenue'; start/end: 'YYYY-MM-DD' (omit both for all time)
export const getTopProducts = async ({ metric, limit, start, end }) => {
    const params = { metric, limit }

    if (start && end) {
        params.start = start
        params.end = end
    }

    const response = await api.get('/orders/admin/top-products', {
        ...getAuthConfig(),
        params
    })

    return response.data
}
