
function AdminOrderItems({ orderLines = [] }) {
    return (
        <div>
            <h3>Order Items</h3>

            {orderLines.length === 0 ? (
                <p>No items found for this order.</p>
            ) : (
                orderLines.map((line, index) => (
                    <div key={line._id || index}>
                        <p>
                            Item: {line.item?.item_name || 'Item unavailable'}
                        </p>
                        <p>Quantity: {line.quantity}</p>
                        <p>Price: {line.price}</p>
                    </div>
                ))
            )}
        </div>
    )
}

export default AdminOrderItems
