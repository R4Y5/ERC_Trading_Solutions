
import { useCallback, useEffect, useState } from 'react'
import {
    getAllAdminReviews,
    deleteAdminReview,
    saveAdminReviewReply
} from '../services/adminReviewService'

export default function useAdminReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [deletingReviewId, setDeletingReviewId] = useState(null)
    const [replyingReviewId, setReplyingReviewId] = useState(null)

    const loadReviews = useCallback(async () => {
        try {
            setLoading(true)
            setMessage('')
            setMessageType('')

            const fetchedReviews = await getAllAdminReviews()
            setReviews(fetchedReviews)
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get reviews'
            )
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    const deleteReview = async (reviewId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this review?'
        )

        if (!confirmed) {
            return
        }

        try {
            setDeletingReviewId(reviewId)
            setMessage('')
            setMessageType('')

            const response = await deleteAdminReview(reviewId)

            setReviews((previousReviews) =>
                previousReviews.filter(
                    (review) => review._id !== reviewId
                )
            )

            setMessage(
                response.message || 'Review deleted successfully.'
            )
            setMessageType('success')
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to delete review'
            )
            setMessageType('error')
        } finally {
            setDeletingReviewId(null)
        }
    }

    const replyToReview = async (reviewId, adminReply) => {
        const trimmedReply = adminReply.trim()

        if (!trimmedReply) {
            setMessage('Please enter a reply.')
            setMessageType('error')
            return false
        }

        if (trimmedReply.length > 1000) {
            setMessage('Reply cannot exceed 1000 characters.')
            setMessageType('error')
            return false
        }

        try {
            setReplyingReviewId(reviewId)
            setMessage('')
            setMessageType('')

            const response = await saveAdminReviewReply(
                reviewId,
                trimmedReply
            )

            const savedReply =
                response.review?.admin_reply ?? trimmedReply

            setReviews((previousReviews) =>
                previousReviews.map((review) =>
                    review._id === reviewId
                        ? { ...review, admin_reply: savedReply }
                        : review
                )
            )

            setMessage(
                response.message || 'Reply saved successfully.'
            )
            setMessageType('success')

            return true
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to save reply'
            )
            setMessageType('error')
            return false
        } finally {
            setReplyingReviewId(null)
        }
    }

    return {
        reviews,
        loading,
        message,
        messageType,
        deletingReviewId,
        replyingReviewId,
        deleteReview,
        replyToReview,
        refreshReviews: loadReviews
    }
}
