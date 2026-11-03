import AdminNavbar from '../components/AdminNavbar'

function AdminDashboard() {
    return (
        <div>
            <AdminNavbar />

            <h1>Admin Dashboard</h1>

            <div>
                <h2>Users</h2>
                <p>Manage registered users</p>
            </div>

            <div>
                <h2>Items</h2>
                <p>Manage trading items</p>
            </div>

            <div>
                <h2>Orders</h2>
                <p>Manage customer orders</p>
            </div>

            <div>
                <h2>Reviews</h2>
                <p>Manage customer reviews</p>
            </div>
        </div>
    )
}

export default AdminDashboard