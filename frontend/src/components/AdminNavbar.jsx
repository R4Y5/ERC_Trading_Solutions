import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../utils/auth'

function AdminNavbar() {
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav>
            <h2>ERC Trading Solutions</h2>

            <div>
                <Link to="/admin">
                    Dashboard
                </Link>

                {' | '}

                <Link to="/users">
                    Users
                </Link>

                {' | '}

                <Link to="/items">
                    Items
                </Link>

                {' | '}

                <Link to="/orders">
                    Orders
                </Link>

                {' | '}

                <Link to="/reviews/admin">
                    Reviews
                </Link>

                {' | '}

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default AdminNavbar