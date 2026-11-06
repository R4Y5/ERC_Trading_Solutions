import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// For pages only logged-out visitors should see (login, register).
// A user who is already logged in is sent to their own area instead.
function GuestRoute({ children }) {
    const { token, user } = useSelector((state) => state.auth)

    // Only check once, when the page opens. Logging in on this page
    // must not trigger this redirect: the login form and the Google
    // button choose where to go next (e.g. /profile?complete=1).
    const [alreadyLoggedIn] = useState(() => Boolean(token))

    if (alreadyLoggedIn) {
        return <Navigate to={user?.role === 'Admin' ? '/admin' : '/shop'} replace />
    }

    return children
}

export default GuestRoute