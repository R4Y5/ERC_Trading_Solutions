const PDFDocument = require('pdfkit')
const { formatPeso } = require('./orderSummary')

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleString('en-PH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        : '-'

// Creates a PDF receipt in memory and resolves with a Buffer,
// ready to be attached to an email.
const generateReceiptPdf = (summary) =>
    new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 })
        const chunks = []

        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        const left = 50
        const right = doc.page.width - 50

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('ERC Trading Solutions', left, 50)
        doc.fontSize(12).font('Helvetica').fillColor('#555').text('Official Receipt')
        doc.fillColor('#000').moveDown()

        // Order details
        doc.fontSize(10)
        doc.text(`Order ID: ${summary.orderId}`)
        doc.text(`Customer: ${summary.customerName}`)
        doc.text(`Email: ${summary.customerEmail || '-'}`)
        doc.text(`Date placed: ${formatDate(summary.datePlaced)}`)
        if (summary.dateShipped) doc.text(`Date shipped: ${formatDate(summary.dateShipped)}`)
        if (summary.dateDelivered) doc.text(`Date delivered: ${formatDate(summary.dateDelivered)}`)
        doc.font('Helvetica-Bold').text(`Status: ${summary.status}`)
        doc.font('Helvetica').moveDown()

        // Table columns
        const col = {
            item: left,
            qty: 300,
            price: 360,
            subtotal: 450
        }

        const drawRow = (y, values, bold = false) => {
            doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
            doc.text(values.item, col.item, y, { width: col.qty - col.item - 10 })
            doc.text(values.qty, col.qty, y, { width: 50, align: 'right' })
            doc.text(values.price, col.price, y, { width: 80, align: 'right' })
            doc.text(values.subtotal, col.subtotal, y, { width: right - col.subtotal, align: 'right' })
        }

        let y = doc.y
        drawRow(y, { item: 'Item', qty: 'Qty', price: 'Unit Price', subtotal: 'Subtotal' }, true)
        y = doc.y + 4
        doc.moveTo(left, y).lineTo(right, y).stroke()
        y += 8

        summary.lines.forEach((line) => {
            // Start a new page if the table runs out of room
            if (y > doc.page.height - 120) {
                doc.addPage()
                y = 50
            }
            drawRow(y, {
                item: line.name,
                qty: String(line.quantity),
                price: formatPeso(line.price),
                subtotal: formatPeso(line.subtotal)
            })
            y = Math.max(doc.y, y + 14) + 6
        })

        doc.moveTo(left, y).lineTo(right, y).stroke()
        y += 10
        doc.font('Helvetica-Bold').fontSize(12)
        doc.text('Grand Total:', col.price - 60, y, { width: 140, align: 'right' })
        doc.text(formatPeso(summary.grandTotal), col.subtotal, y, { width: right - col.subtotal, align: 'right' })

        // Footer
        doc.font('Helvetica').fontSize(9).fillColor('#777')
        doc.text(
            `Generated on ${formatDate(new Date())}. Thank you for your order!`,
            left,
            doc.page.height - 80,
            { width: right - left, align: 'center' }
        )

        doc.end()
    })

module.exports = generateReceiptPdf
