const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    date_placed: {
        type: Date,
        default: Date.now
    },

    date_shipped: {
        type: Date,
        default: null
    },

    date_delivered: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: {
            values: [
                'Pending',
                'Shipped',
                'Delivered',
                'Cancelled'
            ],
            message: 'Please select correct order status'
        },
        default: 'Pending'
    },

    order_lines: [
        {
            item: {
                type: mongoose.Schema.ObjectId,
                ref: 'Item',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: Number,
                required: true,
                default: 0
            }
        }
    ],

    deleted_at: {
        type: Date,
        default: null
    },

    created_at: {
        type: Date,
        default: Date.now
    },

    updated_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Order', orderSchema)