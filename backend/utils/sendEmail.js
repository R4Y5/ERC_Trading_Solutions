// Uses the shared mailer (utils/mailer.js) so every email in the app
// reads the same SMTP settings from backend/.env:
//   SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
//   SMTP_FROM_EMAIL, SMTP_FROM_NAME
// options: { to, subject, html, text, attachments }
const { sendMail } = require('./mailer')

const sendEmail = (options) => sendMail(options)

module.exports = sendEmail
