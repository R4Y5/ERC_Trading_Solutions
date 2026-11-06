const nodemailer = require('nodemailer')
const generateReceiptPdf = require('./generateReceiptPdf')
const { buildOrderSummary } = require('./orderSummary')
const { createReceiptDownloadUrl } = require('./receiptLink')
const {
    escapeHtml,
    wrapEmail,
    buildOrderEmailHtml,
    buildOrderEmailText
} = require('./orderEmailTemplate')

let transporter = null

const getTransporter = () => {
    if (transporter) return transporter

    const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } = process.env

    if (!SMTP_HOST || !SMTP_USERNAME || !SMTP_PASSWORD) {
        throw new Error(
            'SMTP is not configured. Set SMTP_HOST, SMTP_USERNAME and SMTP_PASSWORD in backend/.env'
        )
    }

    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 2525,
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASSWORD
        }
    })

    return transporter
}

// attachments: optional Nodemailer attachments, e.g. the PDF receipt
const sendMail = async ({ to, subject, text, html, attachments }) => {
    const fromName = process.env.SMTP_FROM_NAME || 'ERC Trading Solutions'
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@erctrading.com'

    const info = await getTransporter().sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
        attachments: attachments || []
    })

    console.log('Email sent:', info.messageId, '->', to)
    return info
}

const sendWelcomeEmail = (user) => {
    const name = user.customer?.fname || user.username || user.email

    return sendMail({
        to: user.email,
        subject: 'Welcome to ERC Trading Solutions',
        text: `Hello ${name}, your ERC Trading Solutions account has been created successfully.`,
        html: wrapEmail(`
            <p style="margin:0 0 12px;">Hello <strong>${escapeHtml(name)}</strong>,</p>
            <p style="margin:0 0 12px;">Your ERC Trading Solutions account has been created successfully.</p>
            <p style="margin:0;">You can now log in, browse our products, and place orders.</p>
        `)
    })
}

// Order emails (placed, cancelled). Uses the same styled template as
// the status-update email, with unit price, subtotal and grand total.
// A PDF receipt is attached unless the order was cancelled.
// order must have `customer` and `order_lines.item` populated
const sendOrderEmail = async (order, subject, message) => {
    const summary = buildOrderSummary(order)

    if (!summary.customerEmail) {
        throw new Error('Order has no customer email')
    }

    const hasReceipt = summary.status !== 'Cancelled'
    const downloadUrl = hasReceipt ? createReceiptDownloadUrl(summary.orderId) : null
    const attachments = hasReceipt
        ? [
            {
                filename: `ERC-Receipt-${summary.orderId}.pdf`,
                content: await generateReceiptPdf(summary),
                contentType: 'application/pdf'
            }
        ]
        : []

    return sendMail({
        to: summary.customerEmail,
        subject,
        text: buildOrderEmailText(summary, message, { hasReceipt, downloadUrl }),
        html: buildOrderEmailHtml(summary, message, { hasReceipt, downloadUrl }),
        attachments
    })
}

module.exports = { sendMail, sendWelcomeEmail, sendOrderEmail }
