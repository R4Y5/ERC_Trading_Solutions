
import { useEffect, useState } from 'react'
import api from '../services/api'
import CustomerNavbar from '../components/CustomerNavbar'
import ReviewForm from '../components/reviews/ReviewForm'

function Reviews() {
    const [orders, setOrders] = useState([])
    const [reviewStates, setReviewStates] = useState({})
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)

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
            const fetchedOrders = response.data.orders || []

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

            <main style={{ padding: '20px' }}>
                <h1>My Reviews</h1>

                {message && (
                    <p role="status">{message}</p>
                )}

                {loading ? (
                    <p>Loading your orders and reviews...</p>
                ) : orders.length === 0 ? (
                    <p>You have no orders to review.</p>
                ) : (
                    orders.map((order) => (
                        <section
                            key={order._id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}
                        >
                            <h2>Order #{order._id}</h2>

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
                                            <h3>
                                                {item.item_name ||
                                                    'Unnamed item'}
                                            </h3>

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
                        </section>
                    ))
                )}
            </main>
        </div>
    )
}

export default Reviews
