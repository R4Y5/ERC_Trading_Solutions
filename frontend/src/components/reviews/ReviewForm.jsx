
import { useState } from 'react'
import * as yup from 'yup'

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

function ReviewForm({
    initialValues = { rating: '', review_text: '' },
    submitLabel = 'Submit Review',
    onSubmit,
    onCancel
}) {
    const [rating, setRating] = useState(
        initialValues.rating ?? ''
    )
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

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div>
                <label htmlFor="review-rating">
                    Rating:
                </label>

                <select
                    id="review-rating"
                    value={rating}
                    onChange={(event) => {
                        setRating(event.target.value)
                        setErrors((previous) => ({
                            ...previous,
                            rating: ''
                        }))
                    }}
                    disabled={submitting}
                    required
                >
                    <option value="">Select a rating</option>
                    <option value="1">1 - Very Poor</option>
                    <option value="2">2 - Poor</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                </select>

                {errors.rating && (
                    <p role="alert" style={{ color: 'red' }}>
                        {errors.rating}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="review-text">
                    Your review:
                </label>

                <textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(event) => {
                        setReviewText(event.target.value)
                        setErrors((previous) => ({
                            ...previous,
                            review_text: ''
                        }))
                    }}
                    rows={4}
                    maxLength={1000}
                    placeholder="Write your review here..."
                    disabled={submitting}
                    required
                />

                <p>{reviewText.length}/1000 characters</p>

                {errors.review_text && (
                    <p role="alert" style={{ color: 'red' }}>
                        {errors.review_text}
                    </p>
                )}
            </div>

            <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : submitLabel}
            </button>

            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </button>
            )}
        </form>
    )
}

export default ReviewForm
