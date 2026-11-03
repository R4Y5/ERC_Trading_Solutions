const mongoose = require('mongoose')
const Order = require('../models/orderModel')
const generateReceiptPdf = require('../utils/generateReceiptPdf')
const { buildOrderSummary } = require('../utils/orderSummary')
const { isValidReceiptToken } = require('../utils/receiptLink')

// Finds the order, builds the PDF, and sends it as a file download
const sendReceiptPdf = async (res, filter) => {
    const order = await Order.findOne(filter)
        .populate('customer')
        .populate('order_lines.item')

    if (!order) {
        return res.status(404).json({
            message: 'Order not found'
        })
    }

    const summary = buildOrderSummary(order)
    const pdfBuffer = await generateReceiptPdf(summary)

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ERC-Receipt-${summary.orderId}.pdf"`,
        'Content-Length': pdfBuffer.length,
        'Cache-Control': 'no-store'
    })

    return res.status(200).send(pdfBuffer)
}

// GET /api/orders/:id/receipt   (logged in, from the website)
// Customers can only download receipts for their own orders;
// admins can download any order's receipt.
const downloadReceipt = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid order ID'
            })
        }

        const filter = {
            _id: req.params.id,
            deleted_at: null
        }

        if (req.user.role !== 'Admin') {
            filter.customer = req.user.id
        }

        return await sendReceiptPdf(res, filter)
    } catch (error) {
        console.error('Receipt download error:', error)
        return res.status(500).json({
            message: 'Error generating receipt'
        })
    }
}

// GET /api/orders/:id/receipt/download?token=...   (link in the email)
// No login needed: the signed token proves the link came from our email.
const downloadReceiptByLink = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid order ID')
        }

        if (!isValidReceiptToken(req.query.token, req.params.id)) {
            return res
                .status(403)
                .send('This receipt link is invalid or has expired. Please log in and download the receipt from My Orders.')
        }

        return await sendReceiptPdf(res, {
            _id: req.params.id,
            deleted_at: null
        })
    } catch (error) {
        console.error('Receipt link download error:', error)
        return res.status(500).send('Error generating receipt')
    }
}

module.exports = {
    downloadReceipt,
    downloadReceiptByLink
}
