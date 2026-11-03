
const express = require('express')

const {
    createOrder,
    getOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Admin routes
router.get('/admin/all', protect, getAllOrders)
router.put('/admin/:id', protect, updateOrderStatus)

// Customer routes
router.post('/', protect, createOrder)
router.get('/', protect, getOrders)
router.patch('/:id/cancel', protect, cancelOrder)
router.get('/:id', protect, getOrder)

module.exports = router
