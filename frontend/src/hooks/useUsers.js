
import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react'

import userService from '../services/userService'

function useUsers() {
    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [updatingUserId, setUpdatingUserId] = useState(null)

    const getUsers = useCallback(async () => {
        try {
            setLoading(true)

            const data = await userService.getUsers()
            setUsers(data.users || [])
            setMessage('')
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get users.'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        getUsers()
    }, [getUsers])

    // Filter users using the search term
    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()

        if (!query) {
            return users
        }

        const normalizedQuery = query.replace(/\s+/g, ' ')
        const phoneQuery = query.replace(/\D/g, '')

        return users.filter((user) => {
            const fullName = [
                user.customer?.fname,
                user.customer?.lname
            ]
                .filter(Boolean)
                .join(' ')

            const searchableFields = [
                fullName,
                user.username,
                user.email,
                user.customer?.phone,
                user.role,
                user.status
            ]

            const matchesText = searchableFields.some((field) =>
                String(field || '')
                    .toLowerCase()
                    .includes(normalizedQuery)
            )

            const phone = String(user.customer?.phone || '')
                .replace(/\D/g, '')

            const matchesPhone =
                phoneQuery.length > 0 &&
                phone.includes(phoneQuery)

            return matchesText || matchesPhone
        })
    }, [users, searchTerm])

    // Activate or deactivate an account
    const handleStatusChange = async (user) => {
        const newStatus =
            user.status === 'Active'
                ? 'Deactivated'
                : 'Active'

        const action =
            newStatus === 'Active'
                ? 'activate'
                : 'deactivate'

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this account?`
        )

        if (!confirmed) {
            return
        }

        try {
            setUpdatingUserId(user._id)
            setMessage('')

            const data = await userService.updateUserStatus(
                user._id,
                newStatus
            )

            setMessage(
                data.message ||
                `Account ${action}d successfully.`
            )

            await getUsers()
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to update account status.'
            )
        } finally {
            setUpdatingUserId(null)
        }
    }

    return {
        users,
        filteredUsers,
        searchTerm,
        setSearchTerm,
        message,
        loading,
        updatingUserId,
        getUsers,
        handleStatusChange
    }
}

export default useUsers
