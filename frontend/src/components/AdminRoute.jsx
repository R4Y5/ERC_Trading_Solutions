import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AdminRoute({ children }) {
    const { token, user } = useSelector((state) => state.auth)

    if (!token || !user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'Admin') {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminRoute
