
import AdminOrderItems from './AdminOrderItems'
import AdminOrderStatus from './AdminOrderStatus'

function AdminOrderCard({ order, onUpdateStatus, updating }) {
    const customer = order.customer?.customer

    const customerName = customer
        ? `${customer.fname || ''} ${customer.lname || ''}`.trim()
        : 'N/A'

    return (
        <section
            style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
            }}
        >
            <h2>Order ID: {order._id}</h2>

            <p>Customer: {customerName || 'N/A'}</p>

            <p>
                Email: {order.customer?.email || 'N/A'}
            </p>

            <p>
                Date Placed:{' '}
                {order.date_placed
                    ? new Date(order.date_placed).toLocaleString()
                    : 'N/A'}
            </p>

            <AdminOrderStatus
                order={order}
                onUpdateStatus={onUpdateStatus}
                updating={updating}
            />

            <AdminOrderItems
                orderLines={order.order_lines || []}
            />

            <hr />
        </section>
    )
}

export default AdminOrderCard
