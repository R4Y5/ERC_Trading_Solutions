
const mongoose = require('mongoose')

const temporaryRegistrationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter user email'],
        trim: true,
        lowercase: true,
        unique: true
    },

    registration_token_hash: {
        type: String,
        required: true
    },

    expires_at: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 30 * 60 * 1000),
        expires: 0
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

module.exports = mongoose.model(
    'TemporaryRegistration',
    temporaryRegistrationSchema
)
