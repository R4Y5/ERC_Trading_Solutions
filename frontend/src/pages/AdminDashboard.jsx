import AdminNavbar from '../components/AdminNavbar'
import SalesChart from '../components/dashboard/SalesChart'

function AdminDashboard() {
    return (
        <div>
            <AdminNavbar />

            <main style={{ padding: '20px' }}>
                <h1>Admin Dashboard</h1>

                <SalesChart />

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
            </main>
        </div>
    )
}

export default AdminDashboard
