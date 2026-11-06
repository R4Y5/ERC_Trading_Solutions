import { useEffect, useState } from 'react'
import { getTopProducts } from '../services/salesService'
import { toDateInput } from './useSalesReport'

const daysAgo = (days) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
}

// Date ranges offered on the Top-Selling Products card
export const TOP_PRODUCT_RANGES = [
    {
        key: '30d',
        label: 'Last 30 days',
        range: () => ({ start: toDateInput(daysAgo(29)), end: toDateInput(new Date()) })
    },
    {
        key: 'year',
        label: 'This year',
        range: () => ({
            start: toDateInput(new Date(new Date().getFullYear(), 0, 1)),
            end: toDateInput(new Date())
        })
    },
    {
        key: 'all',
        label: 'All time',
        range: () => ({ start: '', end: '' })
    }
]

export default function useTopProducts() {
    const [metric, setMetric] = useState('units')
    const [rangeKey, setRangeKey] = useState('all')
    const [limit, setLimit] = useState(10)

    const [products, setProducts] = useState([])
    const [totals, setTotals] = useState({ units: 0, revenue: 0, products: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        // Ignore responses from older requests if the options change quickly
        let ignore = false

        const load = async () => {
            const range = TOP_PRODUCT_RANGES.find((r) => r.key === rangeKey).range()

            try {
                const data = await getTopProducts({ metric, limit, ...range })
                if (ignore) return
                setProducts(data.products || [])
                setTotals(data.totals || { units: 0, revenue: 0, products: 0 })
                setError('')
            } catch (err) {
                if (ignore) return
                setError(err.response?.data?.message || 'Failed to load top products.')
                setProducts([])
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        load()

        return () => {
            ignore = true
        }
    }, [metric, rangeKey, limit])

    return {
        metric,
        setMetric,
        rangeKey,
        setRangeKey,
        limit,
        setLimit,
        products,
        totals,
        loading,
        error
    }
}
