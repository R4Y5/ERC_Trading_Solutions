import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import SearchIcon from '@mui/icons-material/Search'
import AdminNavbar from '../components/AdminNavbar'
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

    const isError = /fail|error|unable|cannot/i.test(message || '')

    return (
        <div>
            <AdminNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h1">Users</Typography>
                    <Typography color="text.secondary">
                        View registered accounts and activate or deactivate them.
                    </Typography>
                </Box>

                {message && (
                    <Alert severity={isError ? 'error' : 'success'} role="status" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <Card>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <TextField
                            id="user-search"
                            placeholder="Search name, email, username, phone..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            sx={{ mb: 1, maxWidth: 480 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {filteredUsers.length} user(s) found
                        </Typography>

                        {loading ? (
                            <Skeleton variant="rounded" height={320} />
                        ) : (
                            <UserList
                                users={filteredUsers}
                                onStatusChange={handleStatusChange}
                                updatingUserId={updatingUserId}
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>
        </div>
    )
}

export default Users
