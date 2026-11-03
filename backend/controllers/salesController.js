const Order = require('../models/orderModel')

// Sales are grouped by the calendar day/month in the Philippines,
// so an order placed at 1 AM Manila time counts for that day.
const TIMEZONE = 'Asia/Manila'
const TZ_OFFSET = '+08:00'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MAX_RANGE_DAYS = 366 * 3

const isValidDateString = (value) => {
    if (!DATE_PATTERN.test(value)) return false
    const [y, m, d] = value.split('-').map(Number)
    const date = new Date(Date.UTC(y, m - 1, d))
    return (
        date.getUTCFullYear() === y &&
        date.getUTCMonth() === m - 1 &&
        date.getUTCDate() === d
    )
}

// Every bucket key between start and end (inclusive), so days or
// months with no sales still appear on the chart as zero.
const buildBucketKeys = (start, end, groupBy) => {
    const keys = []
    const [sy, sm, sd] = start.split('-').map(Number)
    const [ey, em, ed] = end.split('-').map(Number)

    if (groupBy === 'month') {
        let year = sy
        let month = sm
        while (year < ey || (year === ey && month <= em)) {
            keys.push(`${year}-${String(month).padStart(2, '0')}`)
            month += 1
            if (month > 12) {
                month = 1
                year += 1
            }
        }
        return keys
    }

    const cursor = new Date(Date.UTC(sy, sm - 1, sd))
    const last = new Date(Date.UTC(ey, em - 1, ed))
    while (cursor <= last) {
        keys.push(cursor.toISOString().slice(0, 10))
        cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return keys
}

// GET /api/orders/admin/sales?start=YYYY-MM-DD&end=YYYY-MM-DD&groupBy=day|month
const getSalesReport = async (req, res) => {
    try {
        const start = String(req.query.start || '')
        const end = String(req.query.end || '')
        const groupBy = req.query.groupBy === 'month' ? 'month' : 'day'

        if (!isValidDateString(start) || !isValidDateString(end)) {
            return res.status(400).json({
                message: 'Please provide valid start and end dates (YYYY-MM-DD)'
            })
        }

        if (start > end) {
            return res.status(400).json({
                message: 'Start date must be on or before the end date'
            })
        }

        const startDate = new Date(`${start}T00:00:00${TZ_OFFSET}`)
        const endDate = new Date(`${end}T00:00:00${TZ_OFFSET}`)
        endDate.setUTCDate(endDate.getUTCDate() + 1) // end date is inclusive

        const rangeDays = (endDate - startDate) / (24 * 60 * 60 * 1000)
        if (rangeDays > MAX_RANGE_DAYS) {
            return res.status(400).json({
                message: 'Date range is too large (maximum is 3 years)'
            })
        }

        const format = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d'

        const results = await Order.aggregate([
            {
                $match: {
                    deleted_at: null,
                    status: { $ne: 'Cancelled' },
                    date_placed: { $gte: startDate, $lt: endDate }
                }
            },
            {
                // Per-order totals first, so each order is counted once
                $project: {
                    date_placed: 1,
                    orderTotal: {
                        $sum: {
                            $map: {
                                input: '$order_lines',
                                as: 'line',
                                in: { $multiply: ['$$line.price', '$$line.quantity'] }
                            }
                        }
                    },
                    itemsSold: { $sum: '$order_lines.quantity' }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format,
                            date: '$date_placed',
                            timezone: TIMEZONE
                        }
                    },
                    sales: { $sum: '$orderTotal' },
                    orders: { $sum: 1 },
                    itemsSold: { $sum: '$itemsSold' }
                }
            }
        ])

        const byKey = new Map(results.map((row) => [row._id, row]))

        const data = buildBucketKeys(start, end, groupBy).map((key) => {
            const row = byKey.get(key)
            return {
                period: key,
                sales: Math.round((row?.sales || 0) * 100) / 100,
                orders: row?.orders || 0,
                itemsSold: row?.itemsSold || 0
            }
        })

        const totals = data.reduce(
            (acc, row) => ({
                sales: acc.sales + row.sales,
                orders: acc.orders + row.orders,
                itemsSold: acc.itemsSold + row.itemsSold
            }),
            { sales: 0, orders: 0, itemsSold: 0 }
        )
        totals.sales = Math.round(totals.sales * 100) / 100

        return res.status(200).json({
            message: 'Sales report retrieved successfully',
            start,
            end,
            groupBy,
            data,
            totals
        })
    } catch (error) {
        console.error('Sales report error:', error)
        return res.status(500).json({
            message: 'Error retrieving sales report'
        })
    }
}

module.exports = {
    getSalesReport,
    buildBucketKeys,
    isValidDateString
}
