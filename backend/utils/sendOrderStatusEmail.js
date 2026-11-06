const sendEmail = require('./sendEmail')
const generateReceiptPdf = require('./generateReceiptPdf')
const { buildOrderSummary } = require('./orderSummary')
const { createReceiptDownloadUrl } = require('./receiptLink')
const {
    buildOrderEmailHtml,
    buildOrderEmailText
} = require('./orderEmailTemplate')

// Emails the customer the updated order with a PDF receipt attached.
// Used when the admin changes an order's status.
// `order` must have `customer` and `order_lines.item` populated.
const sendOrderStatusEmail = async (order) => {
    const summary = buildOrderSummary(order)

    if (!summary.customerEmail) {
        throw new Error('Customer has no email address')
    }

    const intro = `Your order #${summary.orderId} is now ${summary.status}.`
    const pdfBuffer = await generateReceiptPdf(summary)
    const downloadUrl = createReceiptDownloadUrl(summary.orderId)

    await sendEmail({
        to: summary.customerEmail,
        subject: `Your order #${summary.orderId} is now ${summary.status}`,
        html: buildOrderEmailHtml(summary, intro, { downloadUrl }),
        text: buildOrderEmailText(summary, intro, { downloadUrl }),
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
