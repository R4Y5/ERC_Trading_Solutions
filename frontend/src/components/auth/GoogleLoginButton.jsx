import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { googleLogin } from '../../actions/authActions'

// Google's multicolor "G" mark
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    )
}

// "Continue with Google" button used on the Login and Register pages.
// After signing in, new Google users without a phone number are sent
// to My Profile to finish their details.
function GoogleLoginButton({ label = 'Continue with Google' }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleClick = async () => {
        setError('')
        setLoading(true)

        try {
            const result = await dispatch(googleLogin())

            if (!result) return // popup closed

            if (!result.profileComplete) {
                navigate('/profile?complete=1')
            } else if (result.user?.role === 'Admin') {
                navigate('/admin')
            } else {
                navigate('/shop')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.divider} aria-hidden="true">
                <span style={styles.line} />
                <span>or</span>
                <span style={styles.line} />
            </div>

            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                style={{ ...styles.button, ...(loading ? styles.disabled : {}) }}
            >
                <GoogleIcon />
                <span>{loading ? 'Signing in…' : label}</span>
            </button>

            {error && (
                <p role="alert" style={styles.error}>
                    {error}
                </p>
            )}
        </div>
    )
}

const styles = {
    wrapper: {
        marginTop: 20,
        width: '100%'
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 14,
        marginBottom: 12
    },
    line: {
        flex: 1,
        height: 1,
        background: 'var(--border, #e5e4e7)'
    },
    button: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '10px 16px',
        border: '1px solid #dadce0',
        borderRadius: 6,
        background: '#fff',
        color: '#3c4043',
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer'
    },
    disabled: {
        opacity: 0.7,
        cursor: 'wait'
    },
    error: {
        color: 'red',
        fontSize: 14,
        marginTop: 8
    }
}

export default GoogleLoginButton
