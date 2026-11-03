import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
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
        <div>
            <CustomerNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h1">My Orders</Typography>
                    <Typography color="text.secondary">
                        Track your orders. Pending orders can still be cancelled.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" role="alert" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {message && (
                    <Alert severity="success" role="status" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <MyOrdersList
                    orders={orders}
                    loading={loading}
                    cancellingId={cancellingId}
                    onCancel={cancelOrder}
                />
            </Box>
        </div>
    )
}

export default MyOrders
