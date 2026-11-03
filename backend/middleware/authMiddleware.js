
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

// Verify token and current account status
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Not authorized'
            })
        }

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        // Check the current account in the database
        const user = await User.findById(decoded.id)

        if (
            !user ||
            user.deleted_at ||
            user.status !== 'Active'
        ) {
            return res.status(403).json({
                message: 'Your account is inactive or unavailable.'
            })
        }

        // Use the current role from the database
        req.user = {
            id: user._id.toString(),
            role: user.role
        }

        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Invalid or expired token'
            })
        }

        console.error('Authentication error:', error)

        return res.status(500).json({
            message: 'Authentication failed'
        })
    }
}

// Check whether the current user is an admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        return next()
    }

    return res.status(403).json({
        message: 'Admin access required'
    })
}

module.exports = {
    protect,
    admin
}
