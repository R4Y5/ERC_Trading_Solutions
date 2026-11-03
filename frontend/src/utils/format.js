// Shared formatting helpers

// 1234.5 -> '₱1,234.50'
export const peso = (value) =>
    '₱' +
    Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

// Sum of price × quantity for an order's lines
export const orderTotal = (orderLines = []) =>
    orderLines.reduce(
        (sum, line) => sum + Number(line.price || 0) * Number(line.quantity || 0),
        0
    )