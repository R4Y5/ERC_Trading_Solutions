// Builds the line items, subtotals and grand total for an order,
// plus the shared colors and formatting used by BOTH the email and the
// PDF receipt, so the two always look the same.
// Expects an order whose `customer` and `order_lines.item` are populated.

// Brand colors (same as the website theme)
const BRAND = {
    navy: '#172554',
    blue: '#1e3a8a',
    amber: '#f59e0b',
    text: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb',
    rowBorder: '#eeeeee',
    headerBg: '#f3f4f6',
    footerBg: '#f9fafb',
    pageBg: '#f5f7fb'
}

// Status pill colors
const STATUS_COLORS = {
    Pending: { bg: '#fef3c7', fg: '#92400e' },
    Shipped: { bg: '#dbeafe', fg: '#1e40af' },
    Delivered: { bg: '#dcfce7', fg: '#166534' },
    Cancelled: { bg: '#fee2e2', fg: '#991b1b' }
}

const getStatusColor = (status) =>
    STATUS_COLORS[status] || { bg: '#f3f4f6', fg: '#374151' }

// "PHP 1,234.50" (the PDF's built-in font has no peso sign)
const formatPeso = (amount) =>
    'PHP ' +
    Number(amount || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

// Dates are always shown in Philippine time, whatever the server's timezone
const formatDateTime = (date) =>
    date
        ? new Date(date).toLocaleString('en-PH', {
            timeZone: 'Asia/Manila',
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        : null

const getCustomerName = (customer) => {
    if (!customer) return 'Customer'
    const fullName = [customer.customer?.fname, customer.customer?.lname]
        .filter(Boolean)
        .join(' ')
        .trim()
    return fullName || customer.username || customer.email || 'Customer'
}

const buildOrderSummary = (order) => {
    const lines = (order.order_lines || []).map((line) => {
        const quantity = Number(line.quantity) || 0
        const price = Number(line.price) || 0
        return {
            name: line.item?.item_name || 'Item no longer available',
            quantity,
            price,
            subtotal: quantity * price
        }
    })

    const grandTotal = lines.reduce((sum, line) => sum + line.subtotal, 0)

    return {
        orderId: order._id.toString(),
        status: order.status,
        datePlaced: order.date_placed,
        dateShipped: order.date_shipped,
        dateDelivered: order.date_delivered,
        customerName: getCustomerName(order.customer),
        customerEmail: order.customer?.email,
        lines,
        grandTotal
    }
}

// Rows shown under "Order" and "Status" in both the email and the PDF
const getDateRows = (summary) =>
    [
        ['Placed', formatDateTime(summary.datePlaced)],
        ['Shipped', formatDateTime(summary.dateShipped)],
        ['Delivered', formatDateTime(summary.dateDelivered)]
    ].filter(([, value]) => value)

module.exports = {
    BRAND,
    STATUS_COLORS,
    getStatusColor,
    formatPeso,
    formatDateTime,
    getDateRows,
    buildOrderSummary
}
