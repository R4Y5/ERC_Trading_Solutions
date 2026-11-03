import { useEffect, useState } from 'react'
import { getSalesReport } from '../services/salesService'

// 'YYYY-MM-DD' in the browser's local time (not UTC)
export const toDateInput = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const daysAgo = (days) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
}

export const PRESETS = [
    {
        label: 'Last 7 days',
        range: () => ({ start: toDateInput(daysAgo(6)), end: toDateInput(new Date()), groupBy: 'day' })
    },
    {
        label: 'Last 30 days',
        range: () => ({ start: toDateInput(daysAgo(29)), end: toDateInput(new Date()), groupBy: 'day' })
    },
    {
        label: 'This month',
        range: () => {
            const now = new Date()
            return {
                start: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
                end: toDateInput(now),
                groupBy: 'day'
            }
        }
    },
    {
        label: 'This year',
        range: () => {
            const now = new Date()
            return {
                start: toDateInput(new Date(now.getFullYear(), 0, 1)),
                end: toDateInput(now),
                groupBy: 'month'
            }
        }
    }
]

export default function useSalesReport() {
    const initial = PRESETS[1].range()

    const [start, setStart] = useState(initial.start)
    const [end, setEnd] = useState(initial.end)
    const [groupBy, setGroupBy] = useState(initial.groupBy)

    const [data, setData] = useState([])
    const [totals, setTotals] = useState({ sales: 0, orders: 0, itemsSold: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const rangeError =
        !start || !end
            ? 'Please choose both a start and an end date.'
            : start > end
                ? 'Start date must be on or before the end date.'
                : ''

    useEffect(() => {
        // Invalid range: skip the request (the error message is shown instead)
        if (rangeError) return

        // Ignore responses from older requests if the range changes quickly
        let ignore = false

        const load = async () => {
            try {
                setLoading(true)
                setError('')
                const report = await getSalesReport({ start, end, groupBy })
                if (ignore) return
                setData(report.data || [])
                setTotals(report.totals || { sales: 0, orders: 0, itemsSold: 0 })
            } catch (err) {
                if (ignore) return
                setError(err.response?.data?.message || 'Failed to load sales report.')
                setData([])
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        load()

        return () => {
            ignore = true
        }
    }, [start, end, groupBy, rangeError])

    const applyPreset = (preset) => {
        const range = preset.range()
        setStart(range.start)
        setEnd(range.end)
        setGroupBy(range.groupBy)
    }

    return {
        start,
        end,
        groupBy,
        setStart,
        setEnd,
        setGroupBy,
        applyPreset,
        data,
        totals,
        loading,
        error: rangeError || error
    }
}
