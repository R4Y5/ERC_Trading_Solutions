import Chip from '@mui/material/Chip'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'

// Order status colors used on both admin and customer pages
const STATUS_STYLES = {
    Pending: { color: 'warning', icon: <HourglassEmptyIcon /> },
    Shipped: { color: 'info', icon: <LocalShippingOutlinedIcon /> },
    Delivered: { color: 'success', icon: <CheckCircleOutlinedIcon /> },
    Cancelled: { color: 'error', icon: <CancelOutlinedIcon /> }
}

function StatusChip({ status, size = 'small' }) {
    const style = STATUS_STYLES[status] || { color: 'default' }

    return (
        <Chip
            label={status || 'Unknown'}
            color={style.color}
            icon={style.icon}
            size={size}
            variant="outlined"
            sx={{ fontWeight: 700 }}
        />
    )
}

export default StatusChip
