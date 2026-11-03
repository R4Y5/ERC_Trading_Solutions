import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Rating from '@mui/material/Rating'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import api from '../services/api'
import CustomerNavbar from '../components/CustomerNavbar'
import ReviewForm from '../components/reviews/ReviewForm'

// Each item in each order has its own review state.
const getReviewKey = (orderId, itemId) => `${orderId}:${itemId}`

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('en-PH', { dateStyle: 'medium' })
        : null

// One product from one delivered order
function ReviewItemCard({ entry, state, onStartWriting, onStartEditing, onCancel, onSubmit }) {
    const { item, order, quantity } = entry
    const image = (item.images || []).find((img) => !img.deleted_at && img.image_path)
    const review = state?.review
    const mode = state?.mode || 'view'

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                {/* Product */}
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar
                        variant="rounded"
                        src={image?.image_path}
                        alt={item.item_name}
                        sx={{ width: 64, height: 64, bgcolor: 'grey.100', color: 'grey.400' }}
                    >
                        <ImageOutlinedIcon />
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }} noWrap>
                            {item.item_name || 'Unnamed item'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            Qty {quantity} · Order #{order._id.slice(-8)}
                            {order.date_delivered && ` · Delivered ${formatDate(order.date_delivered)}`}
                        </Typography>
                    </Box>

                    {state?.status === 'notReviewed' && mode === 'view' && (
                        <Button
                            variant="contained"
                            startIcon={<RateReviewOutlinedIcon />}
                            onClick={onStartWriting}
                            sx={{ flexShrink: 0, display: { xs: 'none', sm: 'inline-flex' } }}
                        >
                            Write a Review
                        </Button>
                    )}
                </Stack>

                {/* Phone-size button below the product */}
                {state?.status === 'notReviewed' && mode === 'view' && (
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<RateReviewOutlinedIcon />}
                        onClick={onStartWriting}
                        sx={{ mt: 2, display: { xs: 'flex', sm: 'none' } }}
                    >
                        Write a Review
                    </Button>
                )}

                {!state && (
                    <Skeleton width="40%" sx={{ mt: 2 }} />
                )}

                {state?.status === 'error' && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Unable to load this review's status. Please refresh the page.
                    </Alert>
                )}

                {/* Saved review */}
                {state?.status === 'reviewed' && mode === 'view' && review && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}
                        >
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Rating value={Number(review.rating) || 0} readOnly size="small" />
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(review.updated_at || review.created_at)}
                                </Typography>
                            </Stack>
                            <Button size="small" startIcon={<EditOutlinedIcon />} onClick={onStartEditing}>
                                Edit Review
                            </Button>
                        </Stack>

                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{review.review_text}</Typography>

                        {review.admin_reply?.trim() && (
                            <Box
                                sx={{
                                    mt: 1.5,
                                    p: 1.5,
                                    bgcolor: 'grey.50',
                                    borderLeft: 3,
                                    borderColor: 'primary.main',
                                    borderRadius: 1
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    ERC Trading replied
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {review.admin_reply}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}

                {/* Write / edit form */}
                <Collapse in={mode === 'create' || mode === 'edit'} unmountOnExit>
                    <Divider sx={{ my: 2 }} />
                    <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                        {mode === 'edit' ? 'Edit your review' : 'Write a review'}
                    </Typography>
                    <ReviewForm
                        key={`${mode}:${review?._id || 'new'}`}
                        initialValues={
                            mode === 'edit'
                                ? { rating: review?.rating ?? '', review_text: review?.review_text ?? '' }
                                : undefined
                        }
                        submitLabel={mode === 'edit' ? 'Save Changes' : 'Submit Review'}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                    />
                </Collapse>
            </CardContent>
        </Card>
    )
}

function Reviews() {
    const [orders, setOrders] = useState([])
    const [reviewStates, setReviewStates] = useState({})
    const [message, setMessage] = useState({ text: '', type: 'success' })
    const [loading, setLoading] = useState(true)
    // Orders still on their way (can be reviewed once delivered)
    const [awaitingCount, setAwaitingCount] = useState(0)
    const [tab, setTab] = useState('toReview')

    // Load delivered orders and check the review status of every
    // order-item pair (runs once when the page opens).
    useEffect(() => {
        let ignore = false

        const load = async () => {
            try {
                const response = await api.get('/orders')
                const allOrders = response.data.orders || []

                // Only delivered orders can be reviewed
                const deliveredOrders = allOrders.filter(
                    (order) => order.status === 'Delivered'
                )

                const pairs = []
                deliveredOrders.forEach((order) => {
                    ;(order.order_lines || []).forEach((line) => {
                        if (line.item?._id) {
                            pairs.push({ orderId: order._id, itemId: line.item._id })
                        }
                    })
                })

                const results = await Promise.all(
                    pairs.map(async ({ orderId, itemId }) => {
                        const key = getReviewKey(orderId, itemId)

                        try {
                            const result = await api.get(
                                `/reviews/my/${itemId}/orders/${orderId}`
                            )
                            return [key, { status: 'reviewed', review: result.data.review, mode: 'view' }]
                        } catch (error) {
                            if (error.response?.status === 404) {
                                return [key, { status: 'notReviewed', review: null, mode: 'view' }]
                            }
                            return [key, { status: 'error', review: null, mode: 'view' }]
                        }
                    })
                )

                if (ignore) return

                setOrders(deliveredOrders)
                setAwaitingCount(
                    allOrders.filter((order) =>
                        ['Pending', 'Shipped'].includes(order.status)
                    ).length
                )
                setReviewStates(Object.fromEntries(results))

                if (results.some(([, state]) => state.status === 'error')) {
                    setMessage({
                        text: 'Some review statuses could not be loaded. Please refresh the page.',
                        type: 'warning'
                    })
                }
            } catch (error) {
                if (!ignore) {
                    setMessage({
                        text: error.response?.data?.message || 'Failed to load your orders',
                        type: 'error'
                    })
                }
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        load()

        return () => {
            ignore = true
        }
    }, [])

    // Update only the selected order-item pair.
    const updateReviewState = (key, updates) => {
        setReviewStates((previous) => ({
            ...previous,
            [key]: {
                ...previous[key],
                ...updates
            }
        }))
    }

    // Create a review or update an existing review.
    const submitReview = async (orderId, itemId, values, isEditing) => {
        const key = getReviewKey(orderId, itemId)

        try {
            setMessage({ text: '', type: 'success' })

            const response = isEditing
                ? await api.put(`/reviews/my/${itemId}/orders/${orderId}`, values)
                : await api.post('/reviews', {
                    item_id: itemId,
                    order_id: orderId,
                    rating: Number(values.rating),
                    review_text: values.review_text
                })

            updateReviewState(key, {
                status: 'reviewed',
                review: response.data.review,
                mode: 'view'
            })

            setMessage({
                text: isEditing ? 'Review updated successfully.' : 'Thank you! Your review was submitted.',
                type: 'success'
            })
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || 'Failed to save your review',
                type: 'error'
            })

            // Refresh the review status in case the server saved
            // the review but the response was interrupted.
            try {
                const response = await api.get(`/reviews/my/${itemId}/orders/${orderId}`)
                updateReviewState(key, {
                    status: 'reviewed',
                    review: response.data.review,
                    mode: 'view'
                })
            } catch {
                // Keep the current form available for another attempt.
            }
        }
    }

    // Every product from every delivered order, newest delivery first
    const entries = useMemo(() => {
        const list = []
        orders.forEach((order) => {
            ;(order.order_lines || []).forEach((line, index) => {
                if (!line.item?._id) return
                list.push({
                    key: getReviewKey(order._id, line.item._id),
                    rowKey: `${order._id}:${line.item._id}:${index}`,
                    order,
                    item: line.item,
                    quantity: line.quantity
                })
            })
        })
        return list.sort(
            (a, b) =>
                new Date(b.order.date_delivered || b.order.date_placed || 0) -
                new Date(a.order.date_delivered || a.order.date_placed || 0)
        )
    }, [orders])

    const toReview = entries.filter((entry) => reviewStates[entry.key]?.status !== 'reviewed')
    const reviewed = entries.filter((entry) => reviewStates[entry.key]?.status === 'reviewed')
    const visible = tab === 'toReview' ? toReview : reviewed

    return (
        <div>
            <CustomerNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h1">My Reviews</Typography>
                    <Typography color="text.secondary">
                        Rate the products from your delivered orders and help other shoppers.
                    </Typography>
                </Box>

                {message.text && (
                    <Alert
                        severity={message.type}
                        role="status"
                        onClose={() => setMessage({ text: '', type: 'success' })}
                        sx={{ mb: 2 }}
                    >
                        {message.text}
                    </Alert>
                )}

                {!loading && awaitingCount > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {awaitingCount} order(s) are still on their way. You can
                        review those items once they are delivered.
                    </Alert>
                )}

                {loading ? (
                    [0, 1, 2].map((key) => (
                        <Skeleton key={key} variant="rounded" height={96} sx={{ mb: 2 }} />
                    ))
                ) : entries.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <RateReviewOutlinedIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                            <Typography variant="h3" sx={{ mt: 1 }}>
                                Nothing to review yet
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Once your orders are delivered, you can rate the products here.
                            </Typography>
                            <Button component={RouterLink} to="/shop" variant="contained" startIcon={<StorefrontOutlinedIcon />}>
                                Go to Shop
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card sx={{ mb: 2 }}>
                            <Tabs
                                value={tab}
                                onChange={(_, value) => setTab(value)}
                                variant="fullWidth"
                            >
                                <Tab value="toReview" label={`To Review (${toReview.length})`} />
                                <Tab value="reviewed" label={`Reviewed (${reviewed.length})`} />
                            </Tabs>
                        </Card>

                        {visible.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                                {tab === 'toReview' ? (
                                    <>
                                        <CheckCircleOutlinedIcon sx={{ fontSize: 48, color: 'success.main' }} />
                                        <Typography sx={{ fontWeight: 600 }}>
                                            You're all caught up — every delivered item has a review.
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography>You haven't reviewed any products yet.</Typography>
                                )}
                            </Box>
                        ) : (
                            visible.map((entry) => (
                                <ReviewItemCard
                                    key={entry.rowKey}
                                    entry={entry}
                                    state={reviewStates[entry.key]}
                                    onStartWriting={() => updateReviewState(entry.key, { mode: 'create' })}
                                    onStartEditing={() => updateReviewState(entry.key, { mode: 'edit' })}
                                    onCancel={() => updateReviewState(entry.key, { mode: 'view' })}
                                    onSubmit={(values) =>
                                        submitReview(
                                            entry.order._id,
                                            entry.item._id,
                                            values,
                                            reviewStates[entry.key]?.status === 'reviewed'
                                        )
                                    }
                                />
                            ))
                        )}
                    </>
                )}
            </Box>
        </div>
    )
}

export default Reviews
