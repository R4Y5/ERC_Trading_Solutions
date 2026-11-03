import { useState } from 'react'
import api from '../services/api'

export function useCompleteRegistration() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const submitRegistration = async (
        values,
        profilePicture,
        registrationToken
    ) => {
        setLoading(true)
        setError('')

        try {
            if (!registrationToken) {
                throw new Error(
                    'Your registration session has expired. Please register again.'
                )
            }

            const formData = new FormData()

            formData.append('registrationToken', registrationToken)

            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value)
            })

            if (profilePicture) {
                formData.append('profile_image', profilePicture)
            }

            const response = await api.post(
                '/users/complete-registration',
                formData
            )

            sessionStorage.removeItem('registrationToken')
            sessionStorage.removeItem('registrationEmail')

            return response.data
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Unable to complete registration. Please try again.'
            )

            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        submitRegistration,
        loading,
        error,
    }
}