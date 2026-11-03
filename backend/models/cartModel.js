const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    items: [
        {
            item: {
                type: mongoose.Schema.ObjectId,
                ref: 'Item',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            }
        }
    ],

    created_at: {
        type: Date,
        default: Date.now
    },

    updated_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Cart', cartSchema)