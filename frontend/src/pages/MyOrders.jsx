
import CustomerNavbar from '../components/CustomerNavbar'
import MyOrdersList from '../components/orders/MyOrdersList'
import useMyOrders from '../hooks/useMyOrders'

function MyOrders() {
    const {
        orders,
        loading,
        cancellingId,
        error,
        message,
        cancelOrder
    } = useMyOrders()

    return (
        <div className="min-h-screen bg-gray-50">
            <CustomerNavbar />

            <main className="mx-auto max-w-4xl px-4 py-8">
                <h1 className="mb-6 text-2xl font-bold">
                    My Orders
                </h1>

                {error && (
                    <div
                        role="alert"
                        className="mb-4 rounded-md bg-red-100 p-3 text-red-800"
                    >
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className="mb-4 rounded-md bg-green-100 p-3 text-green-800"
                    >
                        {message}
                    </div>
                )}

                <MyOrdersList
                    orders={orders}
                    loading={loading}
                    cancellingId={cancellingId}
                    onCancel={cancelOrder}
                />
            </main>
        </div>
    )
}

export default MyOrders
