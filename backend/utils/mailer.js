const nodemailer = require('nodemailer')

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

const sendWelcomeEmail = (user) =>
    sendMail({
        to: user.email,
        subject: 'Welcome to ERC Trading Solutions',
        text: `Hello ${user.username || user.email}, your account has been created successfully.`,
        html: `<p>Hello <strong>${user.username || user.email}</strong>,</p>
               <p>Your ERC Trading Solutions account has been created successfully.</p>`
    })

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

// order must have `customer` and `order_lines.item` populated
const sendOrderEmail = (order, subject, message) => {
    const customer = order.customer
    if (!customer || !customer.email) {
        throw new Error('Order has no customer email')
    }

    const name = customer.customer?.fname || customer.username || customer.email
    const lines = order.order_lines || []

    const total = lines.reduce(
        (sum, line) => sum + Number(line.price) * Number(line.quantity),
        0
    )

    const rowsHtml = lines
        .map(
            (line) =>
                `<tr><td>${escapeHtml(line.item?.item_name || 'Item')}</td>` +
                `<td align="center">${line.quantity}</td>` +
                `<td align="right">${Number(line.price).toFixed(2)}</td></tr>`
        )
        .join('')

    const rowsText = lines
        .map(
            (line) =>
                `- ${line.item?.item_name || 'Item'} x${line.quantity} @ ${Number(line.price).toFixed(2)}`
        )
        .join('\n')

    return sendMail({
        to: customer.email,
        subject,
        text:
            `Hello ${name},\n\n${message}\n\nOrder #${order._id}\n` +
            `Status: ${order.status}\n${rowsText}\nTotal: ${total.toFixed(2)}`,
        html:
            `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>` +
            `<p>${escapeHtml(message)}</p>` +
            `<p>Order <strong>#${order._id}</strong> &mdash; Status: <strong>${escapeHtml(order.status)}</strong></p>` +
            `<table border="1" cellpadding="6" cellspacing="0">` +
            `<tr><th>Item</th><th>Qty</th><th>Price</th></tr>${rowsHtml}` +
            `<tr><td colspan="2"><strong>Total</strong></td><td align="right"><strong>${total.toFixed(2)}</strong></td></tr>` +
            `</table>`
    })
}

module.exports = { sendMail, sendWelcomeEmail, sendOrderEmail }