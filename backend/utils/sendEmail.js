const nodemailer = require('nodemailer')

// Reusable mail sender.
// options: { to, subject, html, text, attachments }
// attachments follow the Nodemailer format, e.g.
// [{ filename: 'receipt.pdf', content: <Buffer>, contentType: 'application/pdf' }]
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    const fromName = process.env.SMTP_FROM_NAME || 'ERC Trading Solutions'
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL

    return transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || []
    })
}

module.exports = sendEmail
