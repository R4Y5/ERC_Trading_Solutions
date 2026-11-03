import api from '../services/api'
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    UPDATE_AUTH_USER,
    CLEAR_AUTH_ERROR
} from '../constants/authConstants'
import { CART_RESET } from '../constants/cartConstants'

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.message || fallback

// Log in, save the session, and put the user in the store.
// Resolves with { token, user }; rejects with an Error whose
// message is safe to show on the form.
export const login = (email, password) => async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST })

    try {
        const { data } = await api.post('/users/login', {
            email: email.trim().toLowerCase(),
            password
        })

        if (!data.token) {
            throw new Error('Login succeeded, but no token was returned.')
        }

        const user = data.user || null

        // localStorage keeps the session after a page refresh;
        // the api.js interceptor reads the token from there.
        localStorage.setItem('token', data.token)
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }

        dispatch({ type: LOGIN_SUCCESS, payload: { token: data.token, user } })
        return { token: data.token, user }
    } catch (error) {
        const message = getErrorMessage(error, 'Unable to log in. Please try again.')
        dispatch({ type: LOGIN_FAIL, payload: message })
        throw new Error(message, { cause: error })
    }
}

// Sign in with Google through Firebase, then exchange the Firebase
// ID token for this app's own JWT. Resolves with
// { token, user, profileComplete }, or null if the popup was closed.
export const googleLogin = () => async (dispatch) => {
    // Load Firebase only when the button is clicked (keeps the
    // main bundle smaller for everyone else).
    const { signInWithGoogle } = await import('../firebase')

    let idToken
    try {
        idToken = await signInWithGoogle()
    } catch (error) {
        dispatch({ type: LOGIN_FAIL, payload: error.message })
        throw error
    }

    if (!idToken) return null // user closed the popup

    dispatch({ type: LOGIN_REQUEST })

    try {
        const { data } = await api.post('/users/google', { idToken })

        if (!data.token) {
            throw new Error('Google sign-in succeeded, but no token was returned.')
        }

        const user = data.user || null

        localStorage.setItem('token', data.token)
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }

        dispatch({ type: LOGIN_SUCCESS, payload: { token: data.token, user } })

        return {
            token: data.token,
            user,
            profileComplete: data.profile_complete !== false
        }
    } catch (error) {
        const message = getErrorMessage(error, 'Unable to sign in with Google. Please try again.')
        dispatch({ type: LOGIN_FAIL, payload: message })
        throw new Error(message, { cause: error })
    }
}

export const logout = () => (dispatch) => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    dispatch({ type: LOGOUT })
    dispatch({ type: CART_RESET })
}

// Keep the logged-in user in sync after profile changes
export const updateAuthUser = (user) => (dispatch) => {
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: UPDATE_AUTH_USER, payload: user })
}

export const clearAuthError = () => ({ type: CLEAR_AUTH_ERROR })
