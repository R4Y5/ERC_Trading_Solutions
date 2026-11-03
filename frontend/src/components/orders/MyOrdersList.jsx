import { Link } from 'react-router-dom'
import OrderCard from './OrderCard'

function MyOrdersList({
    orders,
    loading,
    cancellingId,
    onCancel
}) {
    if (loading) {
        return <p className="py-8 text-center">Loading your orders...</p>
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 p-8 text-center">
                <h2 className="text-lg font-semibold">
                    No orders yet
                </h2>

                <p className="mt-2 text-gray-600">
                    Your orders will appear here after checkout.
                </p>

                <Link
                    to="/"
                    className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Continue shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {orders.map((order) => (
                <OrderCard
                    key={order._id}
                    order={order}
                    onCancel={onCancel}
                    cancelling={cancellingId === order._id}
                />
            ))}
        </div>
    )
}

export default MyOrdersList
