
const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    item_name: {
        type: String,
        required: [true, 'Please enter item name'],
        trim: true,
        maxLength: [100, 'Item name cannot exceed 100 characters']
    },

    description: {
        type: String,
        required: [true, 'Please enter item description']
    },

    cost_price: {
        type: Number,
        required: [true, 'Please enter item cost price'],
        default: 0
    },

    sell_price: {
        type: Number,
        required: [true, 'Please enter item selling price'],
        default: 0
    },

    category: {
        type: String,
        required: [true, 'Please enter item category'],
        trim: true
    },

    images: [
        {
            image_path: {
                type: String,
                required: true
            },

            public_id: {
                type: String,
                default: null
            },

            created_at: {
                type: Date,
                default: Date.now
            },

            updated_at: {
                type: Date,
                default: Date.now
            },

            deleted_at: {
                type: Date,
                default: null
            }
        }
    ],

    stock: {
        quantity: {
            type: Number,
            default: 0
        }
    },

    reviews: [
        {
            customer: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },

            order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: false
            },

            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },

            review_text: {
                type: String,
                required: true
            },

            admin_reply: {
                type: String,
                default: '',
                trim: true,
                maxlength: 1000
            },

            images: [
                {
                    image_path: {
                        type: String,
                        required: true
                    },

                    public_id: {
                        type: String,
                        default: null
                    },

                    created_at: {
                        type: Date,
                        default: Date.now
                    },

                    updated_at: {
                        type: Date,
                        default: Date.now
                    },

                    deleted_at: {
                        type: Date,
                        default: null
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
            },

            deleted_at: {
                type: Date,
                default: null
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

module.exports = mongoose.model('Item', itemSchema)
