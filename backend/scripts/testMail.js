// Run from backend/:  node scripts/testMail.js
require('dotenv').config()
const { sendMail } = require('../utils/mailer')
 
sendMail({
    to: 'test@example.com',
    subject: 'Mailtrap test from ERC Trading',
    text: 'If you can read this in Mailtrap, SMTP works.'
})
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('SMTP test failed:', err.message)
        process.exit(1)
    })
 