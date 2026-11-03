const express = require('express')

const {
    createOrder,
    getOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController')

const { getSalesReport } = require('../controllers/salesController')
const { downloadReceipt } = require('../controllers/receiptController')
const { protect, admin } = require('../middleware/authMiddleware')

const router = express.Router()

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders)
router.get('/admin/sales', protect, admin, getSalesReport)
router.put('/admin/:id', protect, admin, updateOrderStatus)

// Customer routes
router.post('/', protect, createOrder)
router.get('/', protect, getOrders)
router.patch('/:id/cancel', protect, cancelOrder)
router.get('/:id/receipt', protect, downloadReceipt)
router.get('/:id', protect, getOrder)

module.exports = router