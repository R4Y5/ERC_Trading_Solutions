
const mongoose = require('mongoose')
const Item = require('../models/itemModel')
const Order = require('../models/orderModel')
const maskBadWords = require('../utils/profanityFilter')

// Validate a rating and review text.
const validateReviewInput = (rating, review_text) => {
    const numericRating = Number(rating)

    if (
        rating === undefined ||
        rating === null ||
        rating === '' ||
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
    ) {
        return {
            valid: false,
            message: 'Rating must be a whole number between 1 and 5'
        }
    }

    if (
        typeof review_text !== 'string' ||
        !review_text.trim()
    ) {
        return {
            valid: false,
            message: 'Review text is required'
        }
    }

    if (review_text.trim().length > 1000) {
        return {
            valid: false,
            message: 'Review must not exceed 1000 characters'
        }
    }

    return {
        valid: true,
        rating: numericRating,
        review_text: maskBadWords(review_text.trim())
    }
}

// Confirm that the logged-in customer owns the order
// and that the order contains the specified item.
const findCustomerOrder = async (orderId, itemId, userId) => {
    return Order.findOne({
        _id: orderId,
        customer: userId,
        'order_lines.item': itemId,
        deleted_at: null
    })
}

// Create one review for one item in one specific order.
const createReview = async (req, res) => {
    try {
        const userId = req.user.id
        const { item_id, order_id, rating, review_text } = req.body

        if (
            !mongoose.Types.ObjectId.isValid(item_id) ||
            !mongoose.Types.ObjectId.isValid(order_id)
        ) {
            return res.status(400).json({
                message: 'Valid item ID and order ID are required'
            })
        }

        const validation = validateReviewInput(rating, review_text)

        if (!validation.valid) {
            return res.status(400).json({
                message: validation.message
            })
        }

        const order = await findCustomerOrder(
            order_id,
            item_id,
            userId
        )

        if (!order) {
            return res.status(403).json({
                message: 'You can only review items in your own order'
            })
        }

        const item = await Item.findOne({
            _id: item_id,
            deleted_at: null
        })

        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        // One review per customer, item, and order.
        // Deleted reviews still count toward this restriction.
        const existingReview = item.reviews.find((review) =>
            review.customer?.toString() === userId.toString() &&
            review.order?.toString() === order._id.toString()
        )

        if (existingReview) {
            return res.status(409).json({
                message: 'You have already reviewed this item in this order'
            })
        }

        item.reviews.push({
            customer: userId,
            order: order._id,
            rating: validation.rating,
            review_text: validation.review_text,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
        })

        item.updated_at = new Date()

        await item.save()

        const savedReview = item.reviews[item.reviews.length - 1]

        return res.status(201).json({
            message: 'Review created successfully',
            review: savedReview
        })
    } catch (error) {
        console.error('Create review error:', error)

        return res.status(500).json({
            message: 'Error creating review'
        })
    }
}

// Get the logged-in customer's active review for one order and item.
// A 404 means that no active review exists for this order-item pair.
const getMyOrderItemReview = async (req, res) => {
    try {
        const { itemId, orderId } = req.params
        const userId = req.user.id

        if (
            !mongoose.Types.ObjectId.isValid(itemId) ||
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                message: 'Valid item ID and order ID are required'
            })
        }

        const order = await findCustomerOrder(
            orderId,
            itemId,
            userId
        )

        if (!order) {
            return res.status(404).json({
                message: 'Order or item not found'
            })
        }

        const item = await Item.findOne({
            _id: itemId,
            deleted_at: null
        })

        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        const review = item.reviews.find((entry) =>
            entry.order?.toString() === order._id.toString() &&
            entry.customer?.toString() === userId.toString() &&
            entry.deleted_at == null
        )

        if (!review) {
            return res.status(404).json({
                message: 'No review found for this item in this order'
            })
        }

        return res.status(200).json({
            message: 'Review retrieved successfully',
            review
        })
    } catch (error) {
        console.error('Get customer review error:', error)

        return res.status(500).json({
            message: 'Error getting review'
        })
    }
}

// Edit an existing review. This never creates a new review.
const updateOrderItemReview = async (req, res) => {
    try {
        const { itemId, orderId } = req.params
        const userId = req.user.id
        const { rating, review_text } = req.body

        if (
            !mongoose.Types.ObjectId.isValid(itemId) ||
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                message: 'Valid item ID and order ID are required'
            })
        }

        const validation = validateReviewInput(rating, review_text)

        if (!validation.valid) {
            return res.status(400).json({
                message: validation.message
            })
        }

        const order = await findCustomerOrder(
            orderId,
            itemId,
            userId
        )

        if (!order) {
            return res.status(403).json({
                message: 'You can only edit reviews for your own orders'
            })
        }

        const item = await Item.findOne({
            _id: itemId,
            deleted_at: null
        })

        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        const review = item.reviews.find((entry) =>
            entry.order?.toString() === order._id.toString() &&
            entry.customer?.toString() === userId.toString() &&
            entry.deleted_at == null
        )

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            })
        }

        review.rating = validation.rating
        review.review_text = validation.review_text
        review.updated_at = new Date()

        item.updated_at = new Date()

        await item.save()

        return res.status(200).json({
            message: 'Review updated successfully',
            review
        })
    } catch (error) {
        console.error('Update review error:', error)

        return res.status(500).json({
            message: 'Error updating review'
        })
    }
}

// Get all active reviews for the admin.
const getAllReviews = async (req, res) => {
    try {
        const items = await Item.find({
            deleted_at: null
        }).populate('reviews.customer', 'name email')

        const reviews = []

        items.forEach((item) => {
            item.reviews.forEach((review) => {
                if (review.deleted_at == null) {
                    reviews.push({
                        _id: review._id,
                        item: {
                            _id: item._id,
                            item_name: item.item_name
                        },
                        order: review.order,
                        customer: review.customer,
                        rating: review.rating,
                        review_text: review.review_text,
                        admin_reply: review.admin_reply || '',
                        created_at: review.created_at,
                        updated_at: review.updated_at
                    })
                }
            })
        })

        return res.status(200).json({
            message: 'Reviews retrieved successfully',
            reviews
        })
    } catch (error) {
        console.error('Get reviews error:', error)

        return res.status(500).json({
            message: 'Error getting reviews'
        })
    }
}

// Soft-delete a review.
const deleteReview = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Valid review ID is required'
            })
        }

        const item = await Item.findOne({
            'reviews._id': req.params.id
        })

        if (!item) {
            return res.status(404).json({
                message: 'Review not found'
            })
        }

        const review = item.reviews.id(req.params.id)

        if (!review || review.deleted_at != null) {
            return res.status(404).json({
                message: 'Review not found'
            })
        }

        review.deleted_at = new Date()
        review.updated_at = new Date()
        item.updated_at = new Date()

        await item.save()

        return res.status(200).json({
            message: 'Review deleted successfully'
        })
    } catch (error) {
        console.error('Delete review error:', error)

        return res.status(500).json({
            message: 'Error deleting review'
        })
    }
}

const replyToReview = async (req, res) => {
    try {
        const { id } = req.params
        const { admin_reply } = req.body

        if (typeof admin_reply !== 'string' || !admin_reply.trim()) {
            return res.status(400).json({
                message: 'Please enter a reply.'
            })
        }

        if (admin_reply.trim().length > 1000) {
            return res.status(400).json({
                message: 'Reply cannot exceed 1000 characters.'
            })
        }

        const item = await Item.findOne({
            'reviews._id': id
        })

        if (!item) {
            return res.status(404).json({
                message: 'Review not found.'
            })
        }

        const review = item.reviews.id(id)

        if (!review || review.deleted_at) {
            return res.status(404).json({
                message: 'Review not found.'
            })
        }

        review.admin_reply = maskBadWords(admin_reply.trim())
        await item.save()

        return res.status(200).json({
            message: 'Reply saved successfully.',
            review: {
                _id: review._id,
                admin_reply: review.admin_reply
            }
        })
    } catch (error) {
        console.error('Reply to review error:', error)

        return res.status(500).json({
            message: 'Failed to save reply.'
        })
    }
}

module.exports.replyToReview = replyToReview


module.exports = {
    createReview,
    getMyOrderItemReview,
    updateOrderItemReview,
    getAllReviews,
    deleteReview,
    replyToReview
}
