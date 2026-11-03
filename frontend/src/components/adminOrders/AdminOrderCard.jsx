import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import StatusChip from '../common/StatusChip'
import OrderItemsTable from '../common/OrderItemsTable'
import AdminOrderStatus from './AdminOrderStatus'
import ReceiptButton from '../common/ReceiptButton'

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
        : null

function AdminOrderCard({ order, onUpdateStatus, updating }) {
    const customer = order.customer?.customer
    const customerName =
        (customer ? `${customer.fname || ''} ${customer.lname || ''}`.trim() : '') ||
        order.customer?.username ||
        'N/A'

    const timeline = [
        ['Placed', formatDate(order.date_placed)],
        ['Shipped', formatDate(order.date_shipped)],
        ['Delivered', formatDate(order.date_delivered)]
    ].filter(([, date]) => date)

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
                >
                    <Box>
                        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            Order
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 15, wordBreak: 'break-all' }}>
                            #{order._id}
                        </Typography>
                    </Box>
                    <StatusChip status={order.status} size="medium" />
                </Stack>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />}
                >
                    {/* Customer and dates */}
                    <Box sx={{ width: { md: 280 }, flexShrink: 0 }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {customerName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600 }} noWrap>{customerName}</Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {order.customer?.email || 'N/A'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                            {timeline.map(([label, date]) => (
                                <Typography key={label} variant="body2">
                                    <Box component="span" sx={{ color: 'text.secondary', display: 'inline-block', width: 72 }}>
                                        {label}
                                    </Box>
                                    {date}
                                </Typography>
                            ))}
                        </Stack>

                        <AdminOrderStatus
                            order={order}
                            onUpdateStatus={onUpdateStatus}
                            updating={updating}
                        />
                                              {order.status !== 'Cancelled' && (
                          <Box sx={{ mt: 2 }}>
                              <ReceiptButton orderId={order._id} size="small" fullWidth />
                          </Box>
                      )}
                    </Box>

                    {/* Items */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <OrderItemsTable orderLines={order.order_lines || []} />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )
}

export default AdminOrderCard
