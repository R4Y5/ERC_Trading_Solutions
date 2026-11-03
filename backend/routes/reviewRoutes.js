
const express = require('express')

const {
    createReview,
    getMyOrderItemReview,
    updateOrderItemReview,
    getAllReviews,
    deleteReview,
    replyToReview
} = require('../controllers/reviewController')

const { protect, admin } = require('../middleware/authMiddleware')

const router = express.Router()

// Customer: get a review for a particular order and item
router.get(
    '/my/:itemId/orders/:orderId',
    protect,
    getMyOrderItemReview
)

// Customer: update an existing review
router.put(
    '/my/:itemId/orders/:orderId',
    protect,
    updateOrderItemReview
)

// Customer: create a review
router.post(
    '/',
    protect,
    createReview
)

// Admin: get all reviews
router.get(
    '/admin/all',
    protect,
    admin,
    getAllReviews
)

// Admin: delete a review
router.delete(
    '/admin/:id',
    protect,
    admin,
    deleteReview
)

// Admin: reply to a review
router.put(
    '/admin/:id/reply',
    protect,
    admin,
    replyToReview
)

module.exports = router
