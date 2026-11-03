const {
    BRAND,
    getStatusColor,
    formatPeso,
    getDateRows
} = require('./orderSummary')

// Shared look for every email the store sends (order placed,
// status updated, cancelled, welcome). The PDF receipt
// (generateReceiptPdf.js) uses the same layout and colors.

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

// Branded wrapper used by all emails
const wrapEmail = (bodyHtml, { headerLabel = '' } = {}) => `
<div style="background:${BRAND.pageBg};padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
        <table style="width:100%;background:${BRAND.navy};border-collapse:collapse;">
            <tr>
                <td style="padding:18px 24px;">
                    <span style="display:inline-block;width:11px;height:11px;background:${BRAND.amber};margin-right:6px;"></span>
                    <span style="color:#ffffff;font-size:18px;font-weight:bold;">ERC Trading Solutions</span>
                </td>
                <td style="padding:18px 24px;text-align:right;color:#c7d2fe;font-size:11px;letter-spacing:1px;">
                    ${escapeHtml(headerLabel)}
                </td>
            </tr>
        </table>
        <div style="padding:24px;">
            ${bodyHtml}
        </div>
        <div style="padding:16px 24px;background:${BRAND.footerBg};color:${BRAND.muted};font-size:12px;border-top:1px solid ${BRAND.border};">
            Thank you for shopping with ERC Trading Solutions.
        </div>
    </div>
</div>`

// summary: result of buildOrderSummary(order)
// intro: the sentence explaining why the email was sent
// options.hasReceipt: a PDF receipt is attached
// options.downloadUrl: link to download the PDF receipt
const buildOrderEmailHtml = (summary, intro, { hasReceipt = true, downloadUrl = null } = {}) => {
    const color = getStatusColor(summary.status)

    const infoRow = (label, valueHtml) => `
            <tr>
                <td style="color:${BRAND.muted};padding:4px 0;">${label}</td>
                <td style="text-align:right;padding:4px 0;">${valueHtml}</td>
            </tr>`

    const dateRows = getDateRows(summary)
        .map(([label, value]) => infoRow(label, escapeHtml(value)))
        .join('')

    const rows = summary.lines
        .map(
            (line) => `
            <tr>
                <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.rowBorder};">${escapeHtml(line.name)}</td>
                <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.rowBorder};text-align:right;">${line.quantity}</td>
                <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.rowBorder};text-align:right;">${formatPeso(line.price)}</td>
                <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.rowBorder};text-align:right;">${formatPeso(line.subtotal)}</td>
            </tr>`
        )
        .join('')

    const downloadButton = downloadUrl
        ? `
        <div style="margin:20px 0 0;text-align:center;">
            <a href="${escapeHtml(downloadUrl)}"
               style="display:inline-block;background:${BRAND.blue};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;">
                &#8681; Download PDF Receipt
            </a>
            <p style="margin:8px 0 0;color:${BRAND.muted};font-size:12px;">
                The download link is valid for 30 days. The receipt is also attached to this email.
            </p>
        </div>`
        : hasReceipt
            ? '<p style="margin:16px 0 0;">Your PDF receipt is attached to this email.</p>'
            : ''

    return wrapEmail(
        `
        <p style="margin:0 0 12px;">Hi ${escapeHtml(summary.customerName)},</p>
        <p style="margin:0 0 16px;">${escapeHtml(intro)}</p>

        <table style="width:100%;margin:0 0 16px;font-size:14px;border-collapse:collapse;">
            ${infoRow('Order', `<span style="font-family:monospace;font-weight:bold;">#${escapeHtml(summary.orderId)}</span>`)}
            ${infoRow('Status', `<span style="background:${color.bg};color:${color.fg};padding:3px 10px;border-radius:999px;font-weight:bold;font-size:13px;">${escapeHtml(summary.status)}</span>`)}
            ${dateRows}
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
                <tr style="background:${BRAND.headerBg};">
                    <th style="padding:10px 8px;text-align:left;">Item</th>
                    <th style="padding:10px 8px;text-align:right;">Qty</th>
                    <th style="padding:10px 8px;text-align:right;">Unit Price</th>
                    <th style="padding:10px 8px;text-align:right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="padding:12px 8px;text-align:right;font-weight:bold;">Grand Total</td>
                    <td style="padding:12px 8px;text-align:right;font-weight:bold;color:${BRAND.blue};font-size:16px;">${formatPeso(summary.grandTotal)}</td>
                </tr>
            </tfoot>
        </table>

        ${downloadButton}
    `,
        { headerLabel: hasReceipt ? 'OFFICIAL RECEIPT' : 'ORDER UPDATE' }
    )
}

const buildOrderEmailText = (summary, intro, { hasReceipt = true, downloadUrl = null } = {}) => {
    const lines = summary.lines
        .map(
            (line) =>
                `- ${line.name} x${line.quantity} @ ${formatPeso(line.price)} = ${formatPeso(line.subtotal)}`
        )
        .join('\n')

    const dates = getDateRows(summary)
        .map(([label, value]) => `${label}: ${value}`)
        .join('\n')

    return [
        `Hi ${summary.customerName},`,
        '',
        intro,
        '',
        `Order #${summary.orderId}`,
        `Status: ${summary.status}`,
        dates,
        '',
        lines,
        '',
        `Grand Total: ${formatPeso(summary.grandTotal)}`,
        hasReceipt ? '\nYour PDF receipt is attached.' : '',
        downloadUrl ? `Download it here (valid for 30 days): ${downloadUrl}` : ''
    ].join('\n')
}

module.exports = {
    escapeHtml,
    wrapEmail,
    buildOrderEmailHtml,
    buildOrderEmailText
}
