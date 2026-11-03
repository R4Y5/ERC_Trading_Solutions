import OrderStatus from './OrderStatus'

const formatPrice = (amount) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(Number(amount) || 0)

function OrderCard({ order, onCancel, cancelling }) {
    const canCancel =
        order.status?.toLowerCase() === 'pending'

    const total = (order.order_lines || []).reduce(
        (sum, line) =>
            sum +
            (Number(line.price) || 0) *
            (Number(line.quantity) || 0),
        0
    )

    return (
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="break-all text-lg font-semibold">
                        Order #{order._id}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Placed:{' '}
                        {order.date_placed
                            ? new Date(order.date_placed).toLocaleString()
                            : 'Date unavailable'}
                    </p>
                </div>

                <OrderStatus status={order.status} />
            </div>

            <div className="my-4 border-t border-gray-200" />

            <h3 className="mb-3 font-semibold">Order items</h3>

            <div className="space-y-3">
                {(order.order_lines || []).map((line, index) => (
                    <div
                        key={line._id || `${line.item?._id}-${index}`}
                        className="flex justify-between gap-4 text-sm"
                    >
                        <div>
                            <p className="font-medium">
                                {line.item?.item_name ||
                                    'Product unavailable'}
                            </p>

                            <p className="text-gray-500">
                                Quantity: {line.quantity}
                            </p>
                        </div>

                        <p className="whitespace-nowrap">
                            {formatPrice(
                                (Number(line.price) || 0) *
                                (Number(line.quantity) || 0)
                            )}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold">Order total</span>
                <span className="font-bold">{formatPrice(total)}</span>
            </div>

            {canCancel && (
                <button
                    type="button"
                    onClick={() => onCancel(order._id)}
                    disabled={cancelling}
                    className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
            )}
        </article>
    )
}

export default OrderCard
