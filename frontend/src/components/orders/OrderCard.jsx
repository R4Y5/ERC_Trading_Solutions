import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import OrderStatus from './OrderStatus'
import OrderItemsTable from '../common/OrderItemsTable'

const STEPS = ['Placed', 'Shipped', 'Delivered']

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('en-PH', { dateStyle: 'medium' })
        : null

function OrderCard({ order, onCancel, cancelling }) {
    const canCancel = order.status?.toLowerCase() === 'pending'
    const isCancelled = order.status === 'Cancelled'

    const activeStep =
        order.status === 'Delivered' ? 3 : order.status === 'Shipped' ? 1 : 0

    const stepDates = [order.date_placed, order.date_shipped, order.date_delivered]

    return (
        <Card component="article" sx={{ mb: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 2 }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="overline" color="text.secondary">
                            Order
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                            #{order._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Placed{' '}
                            {order.date_placed
                                ? new Date(order.date_placed).toLocaleString('en-PH', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short'
                                  })
                                : '—'}
                        </Typography>
                    </Box>
                    <OrderStatus status={order.status} />
                </Stack>

                {/* Progress tracker */}
                {!isCancelled && (
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                        {STEPS.map((label, index) => (
                            <Step key={label} completed={index < activeStep || (index === 0)}>
                                <StepLabel
                                    optional={
                                        stepDates[index] ? (
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(stepDates[index])}
                                            </Typography>
                                        ) : null
                                    }
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                )}

                <OrderItemsTable orderLines={order.order_lines || []} />

                {canCancel && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelOutlinedIcon />}
                            onClick={() => onCancel(order._id)}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

export default OrderCard
