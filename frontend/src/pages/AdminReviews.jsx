import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Skeleton from '@mui/material/Skeleton'
import SearchIcon from '@mui/icons-material/Search'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
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

    const [search, setSearch] = useState('')
    const [ratingFilter, setRatingFilter] = useState('all')
    const [replyFilter, setReplyFilter] = useState('all')

    const visibleReviews = useMemo(() => {
        const term = search.trim().toLowerCase()
        return reviews.filter((review) => {
            if (ratingFilter !== 'all' && Number(review.rating) !== Number(ratingFilter)) return false
            if (replyFilter === 'unanswered' && review.admin_reply?.trim()) return false
            if (replyFilter === 'answered' && !review.admin_reply?.trim()) return false
            if (!term) return true
            const c = review.customer || {}
            return [review.item?.item_name, review.review_text, c.email, c.username, c.customer?.fname, c.customer?.lname]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        })
    }, [reviews, search, ratingFilter, replyFilter])

    return (
        <div>
            <AdminNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h1">Reviews</Typography>
                    <Typography color="text.secondary">
                        Reply to customer reviews or remove inappropriate ones.
                    </Typography>
                </Box>

                {message && (
                    <Alert
                        severity={messageType === 'error' ? 'error' : 'success'}
                        role="status"
                        sx={{ mb: 2 }}
                    >
                        {message}
                    </Alert>
                )}

                <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    placeholder="Search product, customer, or review text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
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
                            </Grid>
                            <Grid size={{ xs: 6, md: 3 }}>
                                <TextField
                                    select
                                    label="Rating"
                                    value={ratingFilter}
                                    onChange={(event) => setRatingFilter(event.target.value)}
                                >
                                    <MenuItem value="all">All ratings</MenuItem>
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <MenuItem key={star} value={String(star)}>
                                            {'★'.repeat(star)} ({star})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 6, md: 3 }}>
                                <TextField
                                    select
                                    label="Reply"
                                    value={replyFilter}
                                    onChange={(event) => setReplyFilter(event.target.value)}
                                >
                                    <MenuItem value="all">All reviews</MenuItem>
                                    <MenuItem value="unanswered">Needs a reply</MenuItem>
                                    <MenuItem value="answered">Replied</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {!loading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Showing {visibleReviews.length} of {reviews.length} review(s)
                    </Typography>
                )}

                {loading ? (
                    [0, 1].map((key) => (
                        <Skeleton key={key} variant="rounded" height={260} sx={{ mb: 2 }} />
                    ))
                ) : visibleReviews.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                        <RateReviewOutlinedIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                        <Typography>No reviews found.</Typography>
                    </Box>
                ) : (
                    visibleReviews.map((review) => (
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
            </Box>
        </div>
    )
}

export default AdminReviews
