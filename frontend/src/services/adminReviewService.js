
import api from './api'
import { getToken } from '../utils/auth'

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
})

export const getAllAdminReviews = async () => {
    const response = await api.get(
        '/reviews/admin/all',
        getAuthConfig()
    )

    return response.data.reviews || []
}

export const deleteAdminReview = async (reviewId) => {
    const response = await api.delete(
        `/reviews/admin/${reviewId}`,
        getAuthConfig()
    )

    return response.data
}

export const saveAdminReviewReply = async (reviewId, adminReply) => {
    const response = await api.put(
        `/reviews/admin/${reviewId}/reply`,
        { admin_reply: adminReply },
        getAuthConfig()
    )

    return response.data
}
