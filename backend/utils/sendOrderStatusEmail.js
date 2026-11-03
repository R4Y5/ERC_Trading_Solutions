const sendEmail = require('./sendEmail')
const generateReceiptPdf = require('./generateReceiptPdf')
const { buildOrderSummary, formatPeso } = require('./orderSummary')

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

const buildHtml = (summary) => {
    const rows = summary.lines
        .map(
            (line) => `
            <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(line.name)}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${line.quantity}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPeso(line.price)}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPeso(line.subtotal)}</td>
            </tr>`
        )
        .join('')

    return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#222;">
        <h2 style="margin-bottom:4px;">ERC Trading Solutions</h2>
        <p>Hi ${escapeHtml(summary.customerName)},</p>
        <p>Your order <strong>#${escapeHtml(summary.orderId)}</strong> is now
            <strong>${escapeHtml(summary.status)}</strong>.</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
                <tr style="background:#f4f4f4;">
                    <th style="padding:8px;text-align:left;">Item</th>
                    <th style="padding:8px;text-align:right;">Qty</th>
                    <th style="padding:8px;text-align:right;">Unit Price</th>
                    <th style="padding:8px;text-align:right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="padding:10px 8px;text-align:right;font-weight:bold;">Grand Total</td>
                    <td style="padding:10px 8px;text-align:right;font-weight:bold;">${formatPeso(summary.grandTotal)}</td>
                </tr>
            </tfoot>
        </table>

        <p>Your PDF receipt is attached to this email.</p>
        <p style="color:#777;font-size:12px;">Thank you for shopping with ERC Trading Solutions.</p>
    </div>`
}

const buildText = (summary) => {
    const lines = summary.lines
        .map(
            (line) =>
                `- ${line.name} x${line.quantity} @ ${formatPeso(line.price)} = ${formatPeso(line.subtotal)}`
        )
        .join('\n')

    return [
        `Hi ${summary.customerName},`,
        '',
        `Your order #${summary.orderId} is now ${summary.status}.`,
        '',
        lines,
        '',
        `Grand Total: ${formatPeso(summary.grandTotal)}`,
        '',
        'Your PDF receipt is attached.'
    ].join('\n')
}

// Emails the customer the updated order with a PDF receipt attached.
// `order` must have `customer` and `order_lines.item` populated.
const sendOrderStatusEmail = async (order) => {
    const summary = buildOrderSummary(order)

    if (!summary.customerEmail) {
        throw new Error('Customer has no email address')
    }

    const pdfBuffer = await generateReceiptPdf(summary)

    await sendEmail({
        to: summary.customerEmail,
        subject: `Your order #${summary.orderId} is now ${summary.status}`,
        html: buildHtml(summary),
        text: buildText(summary),
        attachments: [
            {
                filename: `ERC-Receipt-${summary.orderId}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    })

    return summary
}

module.exports = sendOrderStatusEmail
