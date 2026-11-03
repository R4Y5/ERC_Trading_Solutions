const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const TemporaryRegistration = require('../models/temporaryRegistrationModel')
const { verifyFirebaseIdToken } = require('../config/firebaseAdmin')

// Usernames follow the same rule as normal registration:
// 3-30 characters, letters / numbers / . _ -
const makeBaseUsername = (email) => {
    const local = String(email.split('@')[0] || '')
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, '')
        .slice(0, 20)

    return local.length >= 3 ? local : `user${local}`
}

const generateUniqueUsername = async (email) => {
    const base = makeBaseUsername(email)

    if (!(await User.exists({ username: base }))) return base

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = `${base}${crypto.randomInt(1000, 10000)}`
        if (!(await User.exists({ username: candidate }))) return candidate
    }

    return `${base}${Date.now().toString().slice(-8)}`
}

// "Juan Dela Cruz" -> { fname: 'Juan', lname: 'Dela Cruz' }
const splitName = (fullName) => {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
    return {
        fname: parts[0] || '',
        lname: parts.slice(1).join(' ')
    }
}

// Same details normal registration requires before password login
const isProfileComplete = (user) =>
    Boolean(
        user.username &&
        user.customer?.fname &&
        user.customer?.lname &&
        user.customer?.phone
    )

const createGoogleUser = async ({ email, uid, name, picture }) => {
    const { fname, lname } = splitName(name)

    // Google users never type a password; store a random, unusable one
    // because the password field is required by the model.
    const randomPassword = await bcrypt.hash(
        crypto.randomBytes(32).toString('hex'),
        10
    )

    return User.create({
        email,
        username: await generateUniqueUsername(email),
        password: randomPassword,
        auth_provider: 'google',
        google_uid: uid,
        email_verified_at: new Date(),
        role: 'User',
        status: 'Active',
        registration_completed: true,
        profile_image: picture || null,
        customer: {
            fname,
            lname
        }
    })
}

// POST /api/users/google   body: { idToken }
// idToken comes from Firebase signInWithPopup on the frontend.
const googleLogin = async (req, res) => {
    const { idToken } = req.body

    if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({
            message: 'Missing Google sign-in token.'
        })
    }

    let decoded

    try {
        decoded = await verifyFirebaseIdToken(idToken)
    } catch (error) {
        if (error.message?.startsWith('Google sign-in is not configured') ||
            error.message?.startsWith('Firebase service account file')) {
            console.error('Firebase config error:', error.message)
            return res.status(500).json({ message: error.message })
        }

        console.error('Google token verification failed:', error.code || '', error.message)

        let message = 'Google sign-in failed. Please try again.'

        if (/"aud"|audience|"iss"|issuer/i.test(error.message || '')) {
            // Token was issued for a different Firebase project
            message = 'Google sign-in failed: FIREBASE_PROJECT_ID in backend/.env must exactly match VITE_FIREBASE_PROJECT_ID in frontend/.env. Restart the backend after fixing it.'
        } else if (error.code === 'auth/id-token-expired') {
            message = 'Your Google sign-in expired. Please try again.'
        } else if (process.env.NODE_ENV !== 'production') {
            // Extra detail while developing; hidden in production
            message = `Google sign-in failed (${error.code || 'token rejected'}). Check the backend terminal for details.`
        }

        return res.status(401).json({ message })
    }

    try {
        const email = String(decoded.email || '').trim().toLowerCase()

        if (decoded.firebase?.sign_in_provider !== 'google.com') {
            return res.status(400).json({
                message: 'Please sign in with a Google account.'
            })
        }

        if (!email || decoded.email_verified !== true) {
            return res.status(400).json({
                message: 'Your Google account email is not verified.'
            })
        }

        let user =
            (await User.findOne({ google_uid: decoded.uid })) ||
            (await User.findOne({ email }))

        if (user) {
            if (user.deleted_at || user.status !== 'Active') {
                return res.status(403).json({
                    message: 'This account is not active.'
                })
            }

            if (user.google_uid && user.google_uid !== decoded.uid) {
                return res.status(409).json({
                    message: 'This email is linked to a different Google account.'
                })
            }

            // Link an existing email/password account to Google and
            // fill in anything that is still empty.
            const { fname, lname } = splitName(decoded.name)

            if (!user.google_uid) user.google_uid = decoded.uid
            if (!user.email_verified_at) user.email_verified_at = new Date()
            if (!user.profile_image && decoded.picture) user.profile_image = decoded.picture
            if (!user.customer) user.customer = {}
            if (!user.customer.fname && fname) user.customer.fname = fname
            if (!user.customer.lname && lname) user.customer.lname = lname
            if (!user.username) user.username = await generateUniqueUsername(email)
        } else {
            try {
                user = await createGoogleUser({
                    email,
                    uid: decoded.uid,
                    name: decoded.name,
                    picture: decoded.picture
                })
            } catch (error) {
                // Two sign-ins at the same moment: use the account
                // the other request just created.
                if (error.code !== 11000) throw error
                user = await User.findOne({ email })
                if (!user) throw error
            }

            // A half-finished email registration is no longer needed
            await TemporaryRegistration.deleteOne({ email }).catch(() => {})
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )

        user.token = token
        user.updated_at = new Date()
        await user.save()

        const profileComplete = isProfileComplete(user)

        // Same response shape as the normal /login endpoint
        return res.status(200).json({
            message: profileComplete
                ? 'Login successful'
                : 'Signed in with Google. Please complete your profile.',
            token,
            profile_complete: profileComplete,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status,
                profile_image: user.profile_image,
                customer: user.customer,
                auth_provider: user.auth_provider
            }
        })
    } catch (error) {
        console.error('Google login error:', error)
        return res.status(500).json({
            message: 'Error signing in with Google'
        })
    }
}

module.exports = {
    googleLogin,
    // exported for tests
    makeBaseUsername,
    splitName,
    isProfileComplete
}
