import { initializeApp } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from 'firebase/auth'

// Values come from frontend/.env (see .env.example).
// These web config values are safe to ship to the browser.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

let auth = null

const getFirebaseAuth = () => {
    if (auth) return auth

    const missing = Object.entries(firebaseConfig)
        .filter(([, value]) => !value)
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(
            'Google sign-in is not configured yet. Add the VITE_FIREBASE_* values to frontend/.env and restart the dev server.'
        )
    }

    auth = getAuth(initializeApp(firebaseConfig))
    return auth
}

const CANCELLED_CODES = [
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/user-cancelled'
]

// Plain-English fixes for the most common Firebase setup problems
const FIREBASE_ERROR_HINTS = {
    'auth/popup-blocked':
        'Your browser blocked the Google sign-in popup. Please allow popups for this site.',
    'auth/unauthorized-domain':
        'This domain is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed':
        'Google sign-in is not enabled. In Firebase Console go to Authentication → Sign-in method, enable Google, and click Save.',
    'auth/configuration-not-found':
        'Firebase Authentication is not set up. In Firebase Console open Authentication, click Get started, then enable Google under Sign-in method.',
    'auth/invalid-api-key':
        'The Firebase API key is invalid. Check VITE_FIREBASE_API_KEY in frontend/.env (no quotes or spaces), then restart the frontend.',
    'auth/network-request-failed':
        'Could not reach Google. Check your internet connection and try again.',
    'auth/internal-error':
        'Firebase returned an internal error. Check that all VITE_FIREBASE_* values in frontend/.env are correct, then restart the frontend.'
}

// Opens the Google popup and returns a Firebase ID token for the backend.
// Resolves with null if the user closes the popup.
export const signInWithGoogle = async () => {
    const firebaseAuth = getFirebaseAuth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
        const result = await signInWithPopup(firebaseAuth, provider)
        const idToken = await result.user.getIdToken()

        // The app uses its own JWT from the backend after this point,
        // so the Firebase session isn't needed anymore.
        await signOut(firebaseAuth).catch(() => {})

        return idToken
    } catch (error) {
        if (CANCELLED_CODES.includes(error.code)) return null

        if (error.code === 'auth/popup-blocked') {
            throw new Error('Your browser blocked the Google sign-in popup. Please allow popups for this site.', { cause: error })
        }

        // Show the full Firebase error in the browser console (F12)
        console.error('Firebase Google sign-in error:', error.code, error.message)

        const hint = FIREBASE_ERROR_HINTS[error.code] ||
            (String(error.code || '').startsWith('auth/api-key')
                ? FIREBASE_ERROR_HINTS['auth/invalid-api-key']
                : null)

        if (hint) {
            throw new Error(hint, { cause: error })
        }

        throw new Error(
            `Google sign-in failed (${error.code || error.message}). Please try again.`,
            { cause: error }
        )
    }
}
