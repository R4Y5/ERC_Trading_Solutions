
import AdminNavbar from '../components/AdminNavbar'
import UserSearch from '../components/users/UserSearch'
import UserList from '../components/users/UserList'
import useUsers from '../hooks/useUsers'

function Users() {
    const {
        filteredUsers,
        searchTerm,
        setSearchTerm,
        message,
        loading,
        updatingUserId,
        handleStatusChange
    } = useUsers()

    return (
        <div>
            <AdminNavbar />

            <main style={{ padding: '24px' }}>
                <h1>Users</h1>

                <UserSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    resultCount={filteredUsers.length}
                />

                {message && (
                    <p role="status">{message}</p>
                )}

                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <UserList
                        users={filteredUsers}
                        onStatusChange={handleStatusChange}
                        updatingUserId={updatingUserId}
                        searchTerm={searchTerm}
                    />
                )}
            </main>
        </div>
    )
}

export default Users
