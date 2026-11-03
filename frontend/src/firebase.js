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

        if (error.code === 'auth/unauthorized-domain') {
            throw new Error('This domain is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.', { cause: error })
        }

        throw new Error('Google sign-in failed. Please try again.', { cause: error })
    }
}
