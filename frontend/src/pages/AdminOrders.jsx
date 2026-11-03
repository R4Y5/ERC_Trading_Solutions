
import AdminNavbar from '../components/AdminNavbar'
import AdminOrderCard from '../components/adminOrders/AdminOrderCard'
import useAdminOrders from '../hooks/useAdminOrders'

function AdminOrders() {
    const {
        orders,
        loading,
        updatingOrderId,
        message,
        messageType,
        updateStatus
    } = useAdminOrders()

    return (
        <div>
            <AdminNavbar />

            <main style={{ padding: '20px' }}>
                <h1>Admin Orders</h1>

                {message && (
                    <p
                        role="status"
                        style={{
                            color:
                                messageType === 'error'
                                    ? 'red'
                                    : 'green'
                        }}
                    >
                        {message}
                    </p>
                )}

                {loading ? (
                    <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    orders.map((order) => (
                        <AdminOrderCard
                            key={order._id}
                            order={order}
                            onUpdateStatus={updateStatus}
                            updating={updatingOrderId === order._id}
                        />
                    ))
                )}
            </main>
        </div>
    )
}

export default AdminOrders
