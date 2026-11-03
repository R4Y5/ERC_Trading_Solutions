import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
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
    const customerName =
        (customer ? `${customer.fname || ''} ${customer.lname || ''}`.trim() : '') ||
        review.customer?.username ||
        'Customer'

    const currentReply = review.admin_reply || ''

    const handleReply = async (replyText) => {
        const saved = await onReply(review._id, replyText)

        if (saved) {
            setEditingReply(false)
        }

        return saved
    }

    return (
        <Card component="section" sx={{ mb: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Product and rating */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="overline" color="text.secondary">
                            Product
                        </Typography>
                        <Typography variant="h4" component="h3" noWrap>
                            {review.item?.item_name || 'Item unavailable'}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Rating value={Number(review.rating) || 0} readOnly />
                        <Typography sx={{ fontWeight: 700 }}>{review.rating}/5</Typography>
                    </Stack>
                </Stack>

                {/* Customer and review */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 15 }}>
                        {customerName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }} noWrap>{customerName}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {review.customer?.email || 'No email'}
                            {review.created_at &&
                                ` · ${new Date(review.created_at).toLocaleString('en-PH', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}`}
                        </Typography>
                    </Box>
                </Stack>

                <Typography
                    sx={{
                        whiteSpace: 'pre-wrap',
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        p: 1.5,
                        mb: 2
                    }}
                >
                    {review.review_text}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Admin response */}
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Admin Response</Typography>

                {currentReply && !editingReply && (
                    <Box
                        sx={{
                            p: 1.5,
                            borderLeft: 3,
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(30,58,138,0.04)',
                            borderRadius: 1,
                            mb: 1
                        }}
                    >
                        <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>{currentReply}</Typography>
                        <Button
                            size="small"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => setEditingReply(true)}
                            disabled={replying || deleting}
                        >
                            Edit Reply
                        </Button>
                    </Box>
                )}

                {(!currentReply || editingReply) && (
                    <AdminReviewReply
                        key={`${review._id}-${editingReply ? 'edit' : 'new'}`}
                        initialReply={editingReply ? currentReply : ''}
                        onSubmit={handleReply}
                        submitting={replying}
                    />
                )}

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 2 }}>
                    {editingReply && (
                        <Button onClick={() => setEditingReply(false)} disabled={replying}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => onDelete(review._id)}
                        disabled={deleting || replying}
                    >
                        {deleting ? 'Deleting...' : 'Delete Review'}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    )
}

export default AdminReviewCard
