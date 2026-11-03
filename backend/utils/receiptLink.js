const jwt = require('jsonwebtoken')

// Signed links that let a customer download their PDF receipt straight
// from the email, without logging in. Each link only works for one
// order and expires after 30 days.

const LINK_LIFETIME = '30d'
const PURPOSE = 'receipt-download'

// Base URL of this backend as seen from the customer's browser.
// Set BACKEND_URL in backend/.env when the site is deployed.
const getBackendUrl = () =>
    (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`)
        .replace(/\/+$/, '')

const createReceiptDownloadUrl = (orderId) => {
    const token = jwt.sign(
        { orderId: String(orderId), purpose: PURPOSE },
        process.env.JWT_SECRET,
        { expiresIn: LINK_LIFETIME }
    )

    return `${getBackendUrl()}/api/orders/${orderId}/receipt/download?token=${encodeURIComponent(token)}`
}

// Returns true only for a valid, unexpired link made for this order
const isValidReceiptToken = (token, orderId) => {
    try {
        const payload = jwt.verify(String(token || ''), process.env.JWT_SECRET)
        return payload.purpose === PURPOSE && payload.orderId === String(orderId)
    } catch {
        return false
    }
}

module.exports = {
    createReceiptDownloadUrl,
    isValidReceiptToken
}
