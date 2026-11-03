
import AdminNavbar from '../components/AdminNavbar'
import AdminReviewCard from '../components/adminReviews/AdminReviewCard'
import useAdminReviews from '../hooks/useAdminReviews'

function AdminReviews() {
    const {
        reviews,
        loading,
        message,
        messageType,
        deletingReviewId,
        replyingReviewId,
        deleteReview,
        replyToReview
    } = useAdminReviews()

    return (
        <div>
            <AdminNavbar />

            <main style={{ padding: '20px' }}>
                <h1>Admin Reviews</h1>

                {message && (
                    <p
                        role="status"
                        style={{
                            color:
                                messageType === 'error'
                                    ? 'red'
                                    : 'green'
                        }}
                    >
                        {message}
                    </p>
                )}

                {loading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p>No reviews found.</p>
                ) : (
                    reviews.map((review) => (
                        <AdminReviewCard
                            key={review._id}
                            review={review}
                            onDelete={deleteReview}
                            onReply={replyToReview}
                            deleting={deletingReviewId === review._id}
                            replying={replyingReviewId === review._id}
                        />
                    ))
                )}
            </main>
        </div>
    )
}

export default AdminReviews
