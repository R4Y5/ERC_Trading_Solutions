import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import OrderCard from './OrderCard'

function MyOrdersList({
    orders,
    loading,
    cancellingId,
    onCancel
}) {
    if (loading) {
        return [0, 1].map((key) => (
            <Skeleton key={key} variant="rounded" height={260} sx={{ mb: 2 }} />
        ))
    }

    if (orders.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                <Typography variant="h3">No orders yet</Typography>
                <Typography sx={{ mb: 2 }}>
                    Your orders will appear here after checkout.
                </Typography>
                <Button component={RouterLink} to="/shop" variant="contained">
                    Continue shopping
                </Button>
            </Box>
        )
    }

    return orders.map((order) => (
        <OrderCard
            key={order._id}
            order={order}
            onCancel={onCancel}
            cancelling={cancellingId === order._id}
        />
    ))
}

export default MyOrdersList
