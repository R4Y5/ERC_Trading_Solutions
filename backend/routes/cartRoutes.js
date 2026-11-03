const express = require('express')

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart
} = require('../controllers/cartController')

const {
    protect
} = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getCart)

router.post('/', protect, addToCart)

router.put('/:itemId', protect, updateCartItem)

router.delete('/:itemId', protect, removeFromCart)

module.exports = router