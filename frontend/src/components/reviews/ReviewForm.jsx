import { useState } from 'react'
import * as yup from 'yup'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Rating from '@mui/material/Rating'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'

// Validation (unchanged)
const reviewSchema = yup.object({
    rating: yup
        .number()
        .transform((value, originalValue) =>
            originalValue === '' ? undefined : value
        )
        .typeError('Please select a rating')
        .integer('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5')
        .required('Please select a rating'),

    review_text: yup
        .string()
        .trim()
        .required('Please write a review')
        .max(1000, 'Review must not exceed 1000 characters')
})

const RATING_LABELS = {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent'
}

function ReviewForm({
    initialValues = { rating: '', review_text: '' },
    submitLabel = 'Submit Review',
    onSubmit,
    onCancel
}) {
    const [rating, setRating] = useState(
        initialValues.rating ?? ''
    )
    const [hoverRating, setHoverRating] = useState(-1)
    const [reviewText, setReviewText] = useState(
        initialValues.review_text ?? ''
    )
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrors({})

        try {
            const values = await reviewSchema.validate(
                {
                    rating,
                    review_text: reviewText
                },
                { abortEarly: false }
            )

            setSubmitting(true)

            await onSubmit({
                rating: Number(values.rating),
                review_text: values.review_text.trim()
            })
        } catch (error) {
            if (error.name === 'ValidationError') {
                const nextErrors = {}

                error.inner.forEach((validationError) => {
                    if (
                        validationError.path &&
                        !nextErrors[validationError.path]
                    ) {
                        nextErrors[validationError.path] =
                            validationError.message
                    }
                })

                setErrors(nextErrors)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const shownRating = hoverRating !== -1 ? hoverRating : Number(rating) || 0

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Your rating
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Rating
                    name="review-rating"
                    value={Number(rating) || null}
                    size="large"
                    disabled={submitting}
                    onChange={(_, value) => {
                        setRating(value ?? '')
                        setErrors((previous) => ({ ...previous, rating: '' }))
                    }}
                    onChangeActive={(_, value) => setHoverRating(value)}
                    aria-label="Rating"
                />
                <Typography color="text.secondary" sx={{ minWidth: 90 }}>
                    {shownRating ? RATING_LABELS[shownRating] : 'Tap a star'}
                </Typography>
            </Stack>

            {errors.rating && (
                <Typography variant="caption" color="error" role="alert" sx={{ display: 'block', mb: 1 }}>
                    {errors.rating}
                </Typography>
            )}

            <TextField
                id="review-text"
                label="Your review"
                placeholder="What did you like or dislike? How was the quality?"
                multiline
                minRows={3}
                value={reviewText}
                onChange={(event) => {
                    setReviewText(event.target.value)
                    setErrors((previous) => ({ ...previous, review_text: '' }))
                }}
                disabled={submitting}
                error={Boolean(errors.review_text)}
                helperText={errors.review_text || `${reviewText.length}/1000 characters`}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
                sx={{ mt: 1.5 }}
            />

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SendOutlinedIcon />}
                    disabled={submitting}
                >
                    {submitting ? 'Saving...' : submitLabel}
                </Button>

                {onCancel && (
                    <Button onClick={onCancel} disabled={submitting}>
                        Cancel
                    </Button>
                )}
            </Stack>
        </Box>
    )
}

export default ReviewForm
