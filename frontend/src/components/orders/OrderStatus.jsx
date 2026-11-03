
function OrderStatus({ status }) {
    const normalizedStatus = status?.toLowerCase() || 'unknown'

    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        shipped: 'bg-blue-100 text-blue-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    }

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                statusStyles[normalizedStatus] ||
                'bg-gray-100 text-gray-700'
            }`}
        >
            {status || 'Unknown'}
        </span>
    )
}

export default OrderStatus
