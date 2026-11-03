
import { useState } from 'react'
import AdminReviewReply from './AdminReviewReply'

function AdminReviewCard({
    review,
    onDelete,
    onReply,
    deleting,
    replying
}) {
    const [editingReply, setEditingReply] = useState(false)

    const customer = review.customer?.customer

    const customerName = customer
        ? `${customer.fname || ''} ${customer.lname || ''}`.trim()
        : 'N/A'

    const currentReply = review.admin_reply || ''

    const handleReply = async (replyText) => {
        const saved = await onReply(review._id, replyText)

        if (saved) {
            setEditingReply(false)
        }

        return saved
    }

    return (
        <section
            style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
            }}
        >
            <h3>
                Item: {review.item?.item_name || 'Item unavailable'}
            </h3>

            <p>Customer: {customerName || 'N/A'}</p>

            <p>Email: {review.customer?.email || 'N/A'}</p>

            <p>Rating: {review.rating} / 5</p>

            <p>Review: {review.review_text}</p>

            <p>
                Date:{' '}
                {review.created_at
                    ? new Date(review.created_at).toLocaleString()
                    : 'Not available'}
            </p>

            <hr />

            <h4>Admin Response</h4>

            {currentReply && !editingReply && (
                <div>
                    <p>{currentReply}</p>

                    <button
                        type="button"
                        onClick={() => setEditingReply(true)}
                        disabled={replying || deleting}
                    >
                        Edit Reply
                    </button>
                </div>
            )}

            {(!currentReply || editingReply) && (
                <AdminReviewReply
                    key={`${review._id}-${editingReply ? 'edit' : 'new'}`}
                    initialReply={editingReply ? currentReply : ''}
                    onSubmit={handleReply}
                    submitting={replying}
                />
            )}

            {editingReply && (
                <button
                    type="button"
                    onClick={() => setEditingReply(false)}
                    disabled={replying}
                >
                    Cancel
                </button>
            )}

            <hr />

            <button
                type="button"
                onClick={() => onDelete(review._id)}
                disabled={deleting || replying}
            >
                {deleting ? 'Deleting...' : 'Delete Review'}
            </button>
        </section>
    )
}

export default AdminReviewCard
