
import api from './api'

// Get all users
const getUsers = async () => {
    const response = await api.get('/users')
    return response.data
}

// Activate or deactivate a user
const updateUserStatus = async (userId, status) => {
    const response = await api.patch(
        `/users/${userId}/status`,
        { status }
    )

    return response.data
}

const userService = {
    getUsers,
    updateUserStatus
}

export default userService
