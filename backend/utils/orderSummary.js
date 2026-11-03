// Builds the line items, subtotals and grand total for an order.
// Expects an order whose `customer` and `order_lines.item` are populated.

const formatPeso = (amount) =>
    'PHP ' +
    Number(amount || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

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

module.exports = {
    buildOrderSummary,
    formatPeso
}
