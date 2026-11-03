
const FINAL_STATUSES = ['Delivered', 'Cancelled']

function AdminOrderStatus({ order, onUpdateStatus, updating }) {
    const isFinalized = FINAL_STATUSES.includes(order.status)

    return (
        <div>
            <p>
                Status: <strong>{order.status}</strong>
            </p>

            <label htmlFor={`status-${order._id}`}>
                Change Status:
            </label>

            <br />

            <select
                id={`status-${order._id}`}
                value={order.status}
                disabled={isFinalized || updating}
                onChange={(event) =>
                    onUpdateStatus(order._id, event.target.value)
                }
            >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>

            {updating && <p>Updating status...</p>}

            {isFinalized && (
                <p>
                    This order is finalized. Its status can no longer be changed.
                </p>
            )}
        </div>
    )
}

export default AdminOrderStatus
