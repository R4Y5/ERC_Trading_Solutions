
const mongoose = require('mongoose')
const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')
const Item = require('../models/itemModel')

// Create an order from selected cart items or the entire cart
const createOrder = async (req, res) => {
    const session = await mongoose.startSession()

    try {
        const userId = req.user.id
        const { item_ids } = req.body

        // Validate selected item IDs when provided
        if (item_ids !== undefined) {
            if (
                !Array.isArray(item_ids) ||
                item_ids.length === 0 ||
                item_ids.some(
                    id =>
                        typeof id !== 'string' ||
                        !mongoose.isValidObjectId(id)
                )
            ) {
                return res.status(400).json({
                    message: 'Please select valid cart items to check out'
                })
            }

            const normalizedIds = item_ids.map(id => id.toString())

            if (new Set(normalizedIds).size !== normalizedIds.length) {
                return res.status(400).json({
                    message: 'Duplicate item IDs are not allowed'
                })
            }
        }

        let createdOrder

        await session.withTransaction(async () => {
            // Find the customer's cart
            const cart = await Cart.findOne({
                user: userId
            }).session(session)

            if (!cart || !cart.items || cart.items.length === 0) {
                throw new Error('CART_EMPTY')
            }

            // Choose only the selected items, or everything if item_ids
            // was not provided
            let selectedCartItems

            if (item_ids !== undefined) {
                const selectedIds = new Set(
                    item_ids.map(id => id.toString())
                )

                selectedCartItems = cart.items.filter(cartItem => {
                    const id = cartItem.item?.toString()
                    return selectedIds.has(id)
                })

                // Ensure every selected item actually belongs to this cart
                if (selectedCartItems.length !== item_ids.length) {
                    throw new Error('ITEM_NOT_IN_CART')
                }
            } else {
                selectedCartItems = [...cart.items]
            }

            if (selectedCartItems.length === 0) {
                throw new Error('NO_ITEMS_SELECTED')
            }

            const orderLines = []

            // Validate products and deduct stock atomically
            for (const cartItem of selectedCartItems) {
                const itemId = cartItem.item

                if (!itemId) {
                    throw new Error('ITEM_NOT_FOUND')
                }

                const quantity = Number(cartItem.quantity)

                if (
                    !Number.isInteger(quantity) ||
                    quantity < 1
                ) {
                    throw new Error('INVALID_QUANTITY')
                }

                // Atomically decrement stock only if enough remains.
                // This also protects against concurrent checkouts.
                const item = await Item.findOneAndUpdate(
                    {
                        _id: itemId,
                        deleted_at: null,
                        'stock.quantity': { $gte: quantity }
                    },
                    {
                        $inc: {
                            'stock.quantity': -quantity
                        }
                    },
                    {
                        new: true,
                        session
                    }
                )

                if (!item) {
                    const existingItem = await Item.findById(itemId)
                        .session(session)

                    if (!existingItem || existingItem.deleted_at) {
                        throw new Error('ITEM_NOT_FOUND')
                    }

                    throw new Error(
                        `INSUFFICIENT_STOCK:${existingItem.item_name}`
                    )
                }

                const price = Number(item.sell_price)

                if (!Number.isFinite(price) || price < 0) {
                    throw new Error('INVALID_PRICE')
                }

                orderLines.push({
                    item: item._id,
                    quantity,
                    price
                })
            }

            // Create the order inside the same transaction
            const orders = await Order.create(
                [
                    {
                        customer: userId,
                        order_lines: orderLines,
                        status: 'Pending'
                    }
                ],
                { session }
            )

            createdOrder = orders[0]

            // Remove only checked-out products from the cart
            const purchasedIds = new Set(
                selectedCartItems.map(cartItem =>
                    cartItem.item.toString()
                )
            )

            cart.items = cart.items.filter(
                cartItem =>
                    !purchasedIds.has(cartItem.item.toString())
            )

            cart.updated_at = new Date()

            await cart.save({ session })
        })

        // Populate the response after the transaction completes
        const populatedOrder = await Order.findById(createdOrder._id)
            .populate('customer')
            .populate('order_lines.item')

        return res.status(201).json({
            message: 'Order created successfully',
            order: populatedOrder
        })
    } catch (error) {
        const message = error.message || ''

        if (message === 'CART_EMPTY') {
            return res.status(400).json({
                message: 'Cart is empty'
            })
        }

        if (message === 'ITEM_NOT_IN_CART') {
            return res.status(400).json({
                message: 'One or more selected items are not in your cart'
            })
        }

        if (message === 'NO_ITEMS_SELECTED') {
            return res.status(400).json({
                message: 'Please select at least one item to check out'
            })
        }

        if (message === 'ITEM_NOT_FOUND') {
            return res.status(404).json({
                message: 'A selected product no longer exists or is unavailable'
            })
        }

        if (message === 'INVALID_QUANTITY') {
            return res.status(400).json({
                message: 'A cart item has an invalid quantity'
            })
        }

        if (message === 'INVALID_PRICE') {
            return res.status(400).json({
                message: 'A selected product has an invalid selling price'
            })
        }

        if (message.startsWith('INSUFFICIENT_STOCK:')) {
            const itemName = message.split(':').slice(1).join(':')

            return res.status(400).json({
                message: `Not enough stock available for ${itemName}`
            })
        }

        console.error('Create order error:', error)

        return res.status(500).json({
            message: 'Error creating order',
            error: error.message
        })
    } finally {
        await session.endSession()
    }
}

// Get orders belonging to the logged-in customer
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            customer: req.user.id,
            deleted_at: null
        })
            .populate('customer')
            .populate('order_lines.item')
            .sort({ date_placed: -1 })

        return res.status(200).json({
            message: 'Orders retrieved successfully',
            orders
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving orders',
            error: error.message
        })
    }
}

// Get one order belonging to the logged-in customer
const getOrder = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid order ID'
            })
        }

        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user.id,
            deleted_at: null
        })
            .populate('customer')
            .populate('order_lines.item')

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        return res.status(200).json({
            message: 'Order retrieved successfully',
            order
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving order',
            error: error.message
        })
    }
}

// Get all orders (protect this route with admin authorization)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            deleted_at: null
        })
            .populate('customer')
            .populate('order_lines.item')
            .sort({ date_placed: -1 })

        return res.status(200).json({
            message: 'All orders retrieved successfully',
            orders
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving all orders',
            error: error.message
        })
    }
}

// Update an order's status (protect this route with admin authorization)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid order ID'
            })
        }

        const allowedStatuses = [
            'Pending',
            'Shipped',
            'Delivered',
            'Cancelled'
        ]

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Please select a valid order status'
            })
        }

        const order = await Order.findOne({
            _id: req.params.id,
            deleted_at: null
        })

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        order.status = status

        if (status === 'Shipped' && !order.date_shipped) {
            order.date_shipped = new Date()
        }

        if (status === 'Delivered' && !order.date_delivered) {
            order.date_delivered = new Date()
        }

        order.updated_at = new Date()

        await order.save()

        const updatedOrder = await Order.findById(order._id)
            .populate('customer')
            .populate('order_lines.item')

        return res.status(200).json({
            message: 'Order status updated successfully',
            order: updatedOrder
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating order status',
            error: error.message
        })
    }
}


const cancelOrder = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            message: 'Invalid order ID'
        })
    }

    const session = await mongoose.startSession()

    try {
        let cancelledOrder

        await session.withTransaction(async () => {
            // Only the owner can cancel their own pending order.
            // The status condition prevents duplicate cancellation.
            const order = await Order.findOneAndUpdate(
                {
                    _id: req.params.id,
                    customer: req.user.id,
                    status: 'Pending',
                    deleted_at: null
                },
                {
                    $set: {
                        status: 'Cancelled',
                        updated_at: new Date()
                    }
                },
                {
                    new: true,
                    session
                }
            )

            if (!order) {
                const existingOrder = await Order.findOne({
                    _id: req.params.id,
                    customer: req.user.id,
                    deleted_at: null
                }).session(session)

                if (!existingOrder) {
                    throw new Error('ORDER_NOT_FOUND')
                }

                throw new Error('ORDER_NOT_PENDING')
            }

            // Restore stock reserved when this order was created.
            for (const line of order.order_lines) {
                if (!line.item || line.quantity < 1) {
                    throw new Error('INVALID_ORDER_LINE')
                }

                const result = await Item.updateOne(
                    { _id: line.item },
                    {
                        $inc: {
                            'stock.quantity': line.quantity
                        }
                    },
                    { session }
                )

                if (result.matchedCount !== 1) {
                    throw new Error('ORDER_ITEM_NOT_FOUND')
                }
            }

            cancelledOrder = order
        })

        const populatedOrder = await Order.findById(cancelledOrder._id)
            .populate('customer')
            .populate('order_lines.item')

        return res.status(200).json({
            message: 'Order cancelled successfully',
            order: populatedOrder
        })
    } catch (error) {
        if (error.message === 'ORDER_NOT_FOUND') {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        if (error.message === 'ORDER_NOT_PENDING') {
            return res.status(400).json({
                message: 'Only pending orders can be cancelled'
            })
        }

        if (
            error.message === 'INVALID_ORDER_LINE' ||
            error.message === 'ORDER_ITEM_NOT_FOUND'
        ) {
            return res.status(400).json({
                message: 'Unable to restore stock for this order'
            })
        }

        console.error('Cancel order error:', error)

        return res.status(500).json({
            message: 'Error cancelling order'
        })
    } finally {
        await session.endSession()
    }
}


module.exports = {
    createOrder,
    getOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
}
