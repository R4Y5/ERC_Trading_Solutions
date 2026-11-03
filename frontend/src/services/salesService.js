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
