import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import Card from '@mui/material/Card'
import SearchIcon from '@mui/icons-material/Search'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import AdminNavbar from '../components/AdminNavbar'
import AdminOrderCard from '../components/adminOrders/AdminOrderCard'
import useAdminOrders from '../hooks/useAdminOrders'

const STATUS_TABS = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled']

function AdminOrders() {
    const {
        orders,
        loading,
        updatingOrderId,
        message,
        messageType,
        updateStatus
    } = useAdminOrders()

    const [statusTab, setStatusTab] = useState('All')
    const [search, setSearch] = useState('')

    const counts = useMemo(() => {
        const result = { All: orders.length }
        orders.forEach((order) => {
            result[order.status] = (result[order.status] || 0) + 1
        })
        return result
    }, [orders])

    const visibleOrders = useMemo(() => {
        const term = search.trim().toLowerCase()
        return orders.filter((order) => {
            if (statusTab !== 'All' && order.status !== statusTab) return false
            if (!term) return true
            const c = order.customer || {}
            return [order._id, c.email, c.username, c.customer?.fname, c.customer?.lname]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        })
    }, [orders, statusTab, search])

    return (
        <div>
            <AdminNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h1">Orders</Typography>
                    <Typography color="text.secondary">
                        Update order statuses. Customers are emailed an itemized PDF receipt on every change.
                    </Typography>
                </Box>

                {message && (
                    <Alert
                        severity={messageType === 'error' ? 'error' : 'success'}
                        role="status"
                        sx={{ mb: 2 }}
                    >
                        {message}
                    </Alert>
                )}

                <Card sx={{ mb: 2 }}>
                    <Tabs
                        value={statusTab}
                        onChange={(_, value) => setStatusTab(value)}
                        variant="scrollable"
                        allowScrollButtonsMobile
                        sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
                    >
                        {STATUS_TABS.map((status) => (
                            <Tab key={status} value={status} label={`${status} (${counts[status] || 0})`} />
                        ))}
                    </Tabs>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            placeholder="Search by order ID, customer name, or email"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Box>
                </Card>

                {loading ? (
                    [0, 1].map((key) => (
                        <Skeleton key={key} variant="rounded" height={220} sx={{ mb: 2 }} />
                    ))
                ) : visibleOrders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                        <ReceiptLongOutlinedIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                        <Typography>No orders found.</Typography>
                    </Box>
                ) : (
                    visibleOrders.map((order) => (
                        <AdminOrderCard
                            key={order._id}
                            order={order}
                            onUpdateStatus={updateStatus}
                            updating={updatingOrderId === order._id}
                        />
                    ))
                )}
            </Box>
        </div>
    )
}

export default AdminOrders
