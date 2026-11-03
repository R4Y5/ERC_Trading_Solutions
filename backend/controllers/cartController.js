const Cart = require('../models/cartModel')
const Item = require('../models/itemModel')

// Get user's cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id

        let cart = await Cart.findOne({
            user: userId
        }).populate('items.item')

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            })
        }

        res.status(200).json({
            message: 'Cart retrieved successfully',
            cart
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting cart',
            error: error.message
        })
    }
}

// Add item to cart


 // Add item to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id

        const {
            item_id,
            quantity
        } = req.body

        // Find the item
        const item = await Item.findById(item_id)

        if (!item || item.deleted_at != null) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        // Validate quantity
        const requestedQuantity = Number(quantity)

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1
        ) {
            return res.status(400).json({
                message: 'Quantity must be a positive integer'
            })
        }

        // Check if the requested quantity exceeds available stock
        const availableStock = item.stock?.quantity ?? 0

        if (requestedQuantity > availableStock) {
            return res.status(400).json({
                message: `Only ${availableStock} unit(s) are available`
            })
        }

        // Find the user's cart
        let cart = await Cart.findOne({
            user: userId
        })

        // Create a cart if one does not exist
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            })
        }

        // Check whether the item already exists in the cart
        const existingItem = cart.items.find(
            (cartItem) =>
                cartItem.item.toString() === item_id
        )

        // Calculate the total quantity after adding the item
        const cartQuantity = existingItem
            ? existingItem.quantity + requestedQuantity
            : requestedQuantity

        // Prevent the cart quantity from exceeding available stock
        if (cartQuantity > availableStock) {
            return res.status(400).json({
                message: `You can only have ${availableStock} unit(s) of this product in your cart`
            })
        }

        // Update the existing cart item or add a new one
        if (existingItem) {
            existingItem.quantity = cartQuantity
        } else {
            cart.items.push({
                item: item_id,
                quantity: requestedQuantity
            })
        }

        // Update cart timestamp
        cart.updated_at = Date.now()

        // Save the cart
        await cart.save()

        // Populate item details
        cart = await Cart.findById(cart._id)
            .populate('items.item')

        return res.status(200).json({
            message: 'Item added to cart successfully',
            cart
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Error adding item to cart',
            error: error.message
        })
    }
}


// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id
        const itemId = req.params.itemId
        const quantity = Number(req.body.quantity)

        const cart = await Cart.findOne({
            user: userId
        })

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            })
        }

        const cartItem = cart.items.find(
            (item) =>
                item.item.toString() === itemId
        )

        if (!cartItem) {
            return res.status(404).json({
                message: 'Item not found in cart'
            })
        }

        if (quantity < 1) {
            return res.status(400).json({
                message: 'Quantity must be at least 1'
            })
        }

        cartItem.quantity = quantity
        cart.updated_at = Date.now()

        await cart.save()

        const updatedCart = await Cart.findById(cart._id)
            .populate('items.item')

        res.status(200).json({
            message: 'Cart item updated successfully',
            cart: updatedCart
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error updating cart item',
            error: error.message
        })
    }
}

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id
        const itemId = req.params.itemId

        const cart = await Cart.findOne({
            user: userId
        })

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            })
        }

        cart.items = cart.items.filter(
            (item) =>
                item.item.toString() !== itemId
        )

        cart.updated_at = Date.now()

        await cart.save()

        const updatedCart = await Cart.findById(cart._id)
            .populate('items.item')

        res.status(200).json({
            message: 'Item removed from cart successfully',
            cart: updatedCart
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error removing item from cart',
            error: error.message
        })
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart
}