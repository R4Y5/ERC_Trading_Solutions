
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter user email'],
        unique: true,
        trim: true,
        lowercase: true
    },

    username: {
        type: String,
        required: [false, 'Please enter username'],
        unique: true,
        trim: true,
        lowercase: true
    },

    email_verified_at: {
        type: Date,
        default: null
    },

    password: {
        type: String,
        required: [true, 'Please enter user password']
    },

    remember_token: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: {
            values: ['User', 'Admin'],
            message: 'Please select correct user role'
        },
        default: 'User'
    },

    profile_image: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: {
            values: ['Active', 'Deactivated'],
            message: 'Please select correct user status'
        },
        default: 'Active'
    },

    token: {
        type: String,
        default: null
    },

    registration_completed: {
        type: Boolean,
        default: true
    },

    customer: {
        title: {
            type: String,
            default: null
        },

        fname: {
            type: String,
            required: [false, 'Please enter first name'],
            trim: true
        },

        lname: {
            type: String,
            required: [false, 'Please enter last name'],
            trim: true
        },

        addressline: {
            type: String,
            default: null
        },

        town: {
            type: String,
            default: null
        },

        phone: {
            type: String,
            required: [false, 'Please enter contact number'],
            trim: true
        },

        gender: {
            type: String,
            enum: {
                values: ['Male', 'Female', 'Other', 'Prefer not to say'],
                message: 'Please select a valid gender'
            },
            default: null
        },

        date_of_birth: {
            type: Date,
            default: null
        },

        image_path: {
            type: String,
            default: null
        }
    },

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

module.exports = mongoose.model('User', userSchema)
