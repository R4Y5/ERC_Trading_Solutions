import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

const FINAL_STATUSES = ['Delivered', 'Cancelled']

function AdminOrderStatus({ order, onUpdateStatus, updating }) {
    const isFinalized = FINAL_STATUSES.includes(order.status)

    return (
        <Box>
            <TextField
                select
                id={`status-${order._id}`}
                label="Change status"
                value={order.status}
                disabled={isFinalized || updating}
                onChange={(event) => onUpdateStatus(order._id, event.target.value)}
            >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>

            {updating && (
                <Box sx={{ mt: 1 }}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary">
                        Updating status and emailing the customer...
                    </Typography>
                </Box>
            )}

            {isFinalized && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 14 }} />
                    This order is finalized and can no longer be changed.
                </Typography>
            )}
        </Box>
    )
}

export default AdminOrderStatus
