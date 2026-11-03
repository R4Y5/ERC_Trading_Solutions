const PDFDocument = require('pdfkit')
const {
    BRAND,
    getStatusColor,
    formatPeso,
    formatDateTime,
    getDateRows
} = require('./orderSummary')

// PDF receipt with the SAME layout as the email:
// navy header, greeting, order/status block, items table with
// unit price + subtotal, grand total, and a footer.
// Resolves with a Buffer (used for the email attachment and the
// in-app "Download Receipt" button).

const PAGE_MARGIN = 36
const CARD_PADDING = 24
const HEADER_HEIGHT = 58
const FOOTER_HEIGHT = 44

const generateReceiptPdf = (summary) =>
    new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 0 })
        const chunks = []

        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        const pageW = doc.page.width
        const pageH = doc.page.height
        const card = {
            x: PAGE_MARGIN,
            y: PAGE_MARGIN,
            w: pageW - PAGE_MARGIN * 2,
            h: pageH - PAGE_MARGIN * 2
        }
        const left = card.x + CARD_PADDING
        const width = card.w - CARD_PADDING * 2
        const right = left + width
        const contentBottom = card.y + card.h - FOOTER_HEIGHT - 16

        // Item table columns (same order as the email)
        const col = {
            qtyW: 50,
            priceW: 95,
            subW: 95
        }
        col.itemW = width - col.qtyW - col.priceW - col.subW - 24
        col.item = left + 8
        col.qty = col.item + col.itemW + 8
        col.price = col.qty + col.qtyW
        col.sub = col.price + col.priceW

        // ---------- page frame: background, white card, navy header ----------
        const drawPageFrame = () => {
            doc.rect(0, 0, pageW, pageH).fill(BRAND.pageBg)
            doc.roundedRect(card.x, card.y, card.w, card.h, 12)
                .fillAndStroke('#ffffff', BRAND.border)

            doc.save()
            doc.roundedRect(card.x, card.y, card.w, card.h, 12).clip()
            doc.rect(card.x, card.y, card.w, HEADER_HEIGHT).fill(BRAND.navy)
            doc.restore()

            doc.rect(left, card.y + 23, 11, 11).fill(BRAND.amber)
            doc.font('Helvetica-Bold').fontSize(16).fillColor('#ffffff')
                .text('ERC Trading Solutions', left + 18, card.y + 20, { lineBreak: false })
            doc.font('Helvetica').fontSize(9).fillColor('#c7d2fe')
                .text('OFFICIAL RECEIPT', left, card.y + 25, {
                    width,
                    align: 'right',
                    characterSpacing: 1
                })

            return card.y + HEADER_HEIGHT + CARD_PADDING
        }

        // ---------- items table header row ----------
        const drawTableHeader = (y) => {
            doc.rect(left, y, width, 28).fill(BRAND.headerBg)
            doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.text)
            doc.text('Item', col.item, y + 9, { width: col.itemW })
            doc.text('Qty', col.qty, y + 9, { width: col.qtyW, align: 'right' })
            doc.text('Unit Price', col.price, y + 9, { width: col.priceW, align: 'right' })
            doc.text('Subtotal', col.sub, y + 9, { width: col.subW, align: 'right' })
            return y + 28
        }

        let y = drawPageFrame()

        // ---------- greeting ----------
        doc.font('Helvetica').fontSize(11).fillColor(BRAND.text)
            .text(`Hi ${summary.customerName},`, left, y, { width })
        y = doc.y + 8
        doc.text('Thank you for your order. Here is your official receipt.', left, y, { width })
        y = doc.y + 16

        // ---------- order / status / dates block ----------
        const infoRow = (label, drawValue) => {
            doc.font('Helvetica').fontSize(10).fillColor(BRAND.muted)
                .text(label, left, y, { width: 120 })
            drawValue(y)
            y += 20
        }

        infoRow('Order', (rowY) => {
            doc.font('Courier-Bold').fontSize(10).fillColor(BRAND.text)
                .text(`#${summary.orderId}`, left, rowY, { width, align: 'right' })
        })

        infoRow('Status', (rowY) => {
            const color = getStatusColor(summary.status)
            const label = summary.status || 'Unknown'
            doc.font('Helvetica-Bold').fontSize(9)
            const pillW = doc.widthOfString(label) + 20
            doc.roundedRect(right - pillW, rowY - 3, pillW, 17, 8.5).fill(color.bg)
            doc.fillColor(color.fg).text(label, right - pillW, rowY + 1, {
                width: pillW,
                align: 'center'
            })
        })

        getDateRows(summary).forEach(([label, value]) => {
            infoRow(label, (rowY) => {
                doc.font('Helvetica').fontSize(10).fillColor(BRAND.text)
                    .text(value, left, rowY, { width, align: 'right' })
            })
        })

        y += 8

        // ---------- items table ----------
        y = drawTableHeader(y)

        summary.lines.forEach((line) => {
            doc.font('Helvetica').fontSize(10)
            const nameHeight = doc.heightOfString(line.name, { width: col.itemW })
            const rowH = Math.max(nameHeight, 12) + 18

            // Continue on a new page if this row doesn't fit
            if (y + rowH > contentBottom) {
                doc.addPage()
                y = drawPageFrame()
                y = drawTableHeader(y)
            }

            doc.font('Helvetica').fontSize(10).fillColor(BRAND.text)
            doc.text(line.name, col.item, y + 9, { width: col.itemW })
            doc.text(String(line.quantity), col.qty, y + 9, { width: col.qtyW, align: 'right' })
            doc.text(formatPeso(line.price), col.price, y + 9, { width: col.priceW, align: 'right' })
            doc.text(formatPeso(line.subtotal), col.sub, y + 9, { width: col.subW, align: 'right' })

            y += rowH
            doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor(BRAND.rowBorder).stroke()
        })

        // ---------- grand total ----------
        if (y + 40 > contentBottom) {
            doc.addPage()
            y = drawPageFrame()
        }

        // Place the label just left of the amount, however long it is
        const totalText = formatPeso(summary.grandTotal)
        doc.font('Helvetica-Bold').fontSize(13)
        const totalWidth = doc.widthOfString(totalText)
        const valueRight = col.sub + col.subW
        const labelRight = valueRight - totalWidth - 18

        doc.fillColor(BRAND.blue)
            .text(totalText, valueRight - totalWidth, y + 12, { lineBreak: false })
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND.text)
            .text('Grand Total', left, y + 14, {
                width: labelRight - left,
                align: 'right'
            })

        // ---------- footer (bottom of the card) ----------
        const footerY = card.y + card.h - FOOTER_HEIGHT
        doc.save()
        doc.roundedRect(card.x, card.y, card.w, card.h, 12).clip()
        doc.rect(card.x, footerY, card.w, FOOTER_HEIGHT).fill(BRAND.footerBg)
        doc.restore()
        doc.moveTo(card.x, footerY).lineTo(card.x + card.w, footerY)
            .lineWidth(1).strokeColor(BRAND.border).stroke()

        doc.font('Helvetica').fontSize(9).fillColor(BRAND.muted)
            .text('Thank you for shopping with ERC Trading Solutions.', left, footerY + 17, {
                width: width / 2 + 40,
                lineBreak: false
            })
        doc.text(`Generated ${formatDateTime(new Date())}`, left, footerY + 17, {
            width,
            align: 'right'
        })

        doc.end()
    })

module.exports = generateReceiptPdf
