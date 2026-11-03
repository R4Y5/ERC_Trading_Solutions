import { useEffect, useState } from 'react'
import api from '../services/api'
import CustomerNavbar from '../components/CustomerNavbar'
import ReviewForm from '../components/reviews/ReviewForm'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import StatusChip from '../components/common/StatusChip'

function Reviews() {
    const [orders, setOrders] = useState([])
    const [reviewStates, setReviewStates] = useState({})
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    // Orders still on their way (can be reviewed once delivered)
    const [awaitingCount, setAwaitingCount] = useState(0)

    // Each item in each order has its own review state.
    const getReviewKey = (orderId, itemId) =>
        `${orderId}:${itemId}`

    useEffect(() => {
        loadOrdersAndReviews()
    }, [])

    // Load orders and check the review status of every order-item pair.
    const loadOrdersAndReviews = async () => {
        setLoading(true)
        setMessage('')

        try {
            const response = await api.get('/orders')
            const allOrders = response.data.orders || []

            // Only delivered orders can be reviewed
            const fetchedOrders = allOrders.filter(
                (order) => order.status === 'Delivered'
            )
            setAwaitingCount(
                allOrders.filter((order) =>
                    ['Pending', 'Shipped'].includes(order.status)
                ).length
            )

            setOrders(fetchedOrders)

            const pairs = []

            fetchedOrders.forEach((order) => {
                ;(order.order_lines || []).forEach((line) => {
                    if (line.item?._id) {
                        pairs.push({
                            orderId: order._id,
                            item: line.item
                        })
                    }
                })
            })

            const results = await Promise.all(
                pairs.map(async ({ orderId, item }) => {
                    const key = getReviewKey(orderId, item._id)

                    try {
                        const result = await api.get(
                            `/reviews/my/${item._id}/orders/${orderId}`
                        )

                        return [
                            key,
                            {
                                status: 'reviewed',
                                review: result.data.review,
                                mode: 'view'
                            }
                        ]
                    } catch (error) {
                        if (error.response?.status === 404) {
                            return [
                                key,
                                {
                                    status: 'notReviewed',
                                    review: null,
                                    mode: 'view'
                                }
                            ]
                        }

                        return [
                            key,
                            {
                                status: 'error',
                                review: null,
                                mode: 'view'
                            }
                        ]
                    }
                })
            )

            setReviewStates(Object.fromEntries(results))

            if (results.some(([, state]) => state.status === 'error')) {
                setMessage(
                    'Some review statuses could not be loaded. Please refresh the page.'
                )
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to load your orders'
            )
        } finally {
            setLoading(false)
        }
    }

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
    const submitReview = async (
        orderId,
        itemId,
        values,
        isEditing
    ) => {
        const key = getReviewKey(orderId, itemId)

        try {
            setMessage('')

            if (isEditing) {
                const response = await api.put(
                    `/reviews/my/${itemId}/orders/${orderId}`,
                    values
                )

                updateReviewState(key, {
                    status: 'reviewed',
                    review: response.data.review,
                    mode: 'details'
                })

                setMessage('Review updated successfully.')
            } else {
                const response = await api.post('/reviews', {
                    item_id: itemId,
                    order_id: orderId,
                    rating: Number(values.rating),
                    review_text: values.review_text
                })

                updateReviewState(key, {
                    status: 'reviewed',
                    review: response.data.review,
                    mode: 'details'
                })

                setMessage('Review submitted successfully.')
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to save your review'
            )

            // Refresh the review status in case the server saved
            // the review but the response was interrupted.
            try {
                const response = await api.get(
                    `/reviews/my/${itemId}/orders/${orderId}`
                )

                updateReviewState(key, {
                    status: 'reviewed',
                    review: response.data.review,
                    mode: 'details'
                })
            } catch {
                // Keep the current form available for another attempt.
            }
        }
    }

    // Open a saved review's details.
    const openReview = async (orderId, itemId) => {
        const key = getReviewKey(orderId, itemId)

        try {
            const response = await api.get(
                `/reviews/my/${itemId}/orders/${orderId}`
            )

            updateReviewState(key, {
                status: 'reviewed',
                review: response.data.review,
                mode: 'details'
            })
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to retrieve the review'
            )
        }
    }

    return (
        <div>
            <CustomerNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h1">My Reviews</Typography>
                    <Typography color="text.secondary">
                        Rate and review the products from your delivered orders.
                    </Typography>
                </Box>

                {message && (
                    <Alert severity="info" role="status" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                {!loading && awaitingCount > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {awaitingCount} order(s) are still on their way. You can
                        review those items once they are delivered.
                    </Alert>
                )}

                {loading ? (
                    [0, 1].map((key) => (
                        <Skeleton key={key} variant="rounded" height={160} sx={{ mb: 2 }} />
                    ))
                ) : orders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                        <RateReviewOutlinedIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                        <Typography>You have no delivered orders to review yet.</Typography>
                    </Box>
                ) : (
                    orders.map((order) => (
                        <Card component="section" key={order._id} sx={{ mb: 2 }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                                >
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">
                                            Order
                                        </Typography>
                                        <Typography sx={{ fontWeight: 700, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                                            #{order._id}
                                        </Typography>
                                    </Box>
                                    <StatusChip status={order.status} />
                                </Stack>

                                {(order.order_lines || []).map(
                                    (line, index) => {
                                        const item = line.item

                                        if (!item?._id) {
                                            return null
                                        }

                                        const key = getReviewKey(
                                            order._id,
                                            item._id
                                        )

                                        const state = reviewStates[key]

                                        return (
                                            <article
                                                key={`${key}:${index}`}
                                                style={{
                                                    borderTop: '1px solid #eee',
                                                    padding: '16px 0'
                                                }}
                                            >
                                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                                                    <Avatar
                                                        variant="rounded"
                                                        src={(item.images || []).find((img) => !img.deleted_at && img.image_path)?.image_path}
                                                        sx={{ width: 48, height: 48, bgcolor: 'grey.100' }}
                                                    />
                                                    <Typography variant="h4" component="h3">
                                                        {item.item_name ||
                                                            'Unnamed item'}
                                                    </Typography>
                                                </Stack>

                                                <p>
                                                    Quantity ordered: {
                                                        line.quantity
                                                    }
                                                </p>

                                                {!state && (
                                                    <p>
                                                        Checking review status...
                                                    </p>
                                                )}

                                                {state?.status === 'error' && (
                                                    <p role="alert">
                                                        Unable to load this review's
                                                        status. Please refresh the page.
                                                    </p>
                                                )}

                                                {state?.status === 'notReviewed' &&
                                                    state.mode === 'view' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateReviewState(
                                                                    key,
                                                                    { mode: 'create' }
                                                                )
                                                            }
                                                        >
                                                            Review Item
                                                        </button>
                                                    )}

                                                {state?.status === 'notReviewed' &&
                                                    state.mode === 'create' && (
                                                        <div>
                                                            <h4>Write a Review</h4>

                                                            <ReviewForm
                                                                key={`${key}:create`}
                                                                submitLabel="Submit Review"
                                                                onSubmit={(values) =>
                                                                    submitReview(
                                                                        order._id,
                                                                        item._id,
                                                                        values,
                                                                        false
                                                                    )
                                                                }
                                                                onCancel={() =>
                                                                    updateReviewState(
                                                                        key,
                                                                        { mode: 'view' }
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                {state?.status === 'reviewed' &&
                                                    state.mode === 'view' && (
                                                        <div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openReview(
                                                                        order._id,
                                                                        item._id
                                                                    )
                                                                }
                                                            >
                                                                View Review
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateReviewState(
                                                                        key,
                                                                        { mode: 'edit' }
                                                                    )
                                                                }
                                                            >
                                                                Edit Review
                                                            </button>
                                                        </div>
                                                    )}

                                                {state?.status === 'reviewed' &&
                                                    state.mode === 'details' && (
                                                        <div>
                                                            <h4>Your Review</h4>

                                                            <p>
                                                                <strong>Rating:</strong>{' '}
                                                                {state.review.rating}/5
                                                            </p>

                                                            <p>
                                                                <strong>Review:</strong>{' '}
                                                                {state.review.review_text}
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateReviewState(
                                                                        key,
                                                                        { mode: 'edit' }
                                                                    )
                                                                }
                                                            >
                                                                Edit Review
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateReviewState(
                                                                        key,
                                                                        { mode: 'view' }
                                                                    )
                                                                }
                                                            >
                                                                Close Review
                                                            </button>
                                                        </div>
                                                    )}

                                                {state?.status === 'reviewed' &&
                                                    state.mode === 'edit' && (
                                                        <div>
                                                            <h4>Edit Your Review</h4>

                                                            <ReviewForm
                                                                key={`${key}:edit:${state.review?._id}`}
                                                                initialValues={{
                                                                    rating:
                                                                        state.review?.rating ?? '',
                                                                    review_text:
                                                                        state.review?.review_text ?? ''
                                                                }}
                                                                submitLabel="Save Changes"
                                                                onSubmit={(values) =>
                                                                    submitReview(
                                                                        order._id,
                                                                        item._id,
                                                                        values,
                                                                        true
                                                                    )
                                                                }
                                                                onCancel={() =>
                                                                    updateReviewState(
                                                                        key,
                                                                        { mode: 'details' }
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                            </article>
                                        )
                                    }
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </div>
    )
}

export default Reviews