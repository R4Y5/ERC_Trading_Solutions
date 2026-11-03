
import { useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const replySchema = Yup.object({
    admin_reply: Yup.string()
        .trim()
        .required('Please enter a reply.')
        .max(1000, 'Reply cannot exceed 1000 characters.')
})

function AdminReviewReply({
    initialReply = '',
    onSubmit,
    submitting
}) {
    return (
        <Formik
            initialValues={{
                admin_reply: initialReply
            }}
            enableReinitialize
            validationSchema={replySchema}
            onSubmit={async (values, { resetForm }) => {
                const saved = await onSubmit(
                    values.admin_reply.trim()
                )

                if (saved) {
                    resetForm({
                        values: {
                            admin_reply: values.admin_reply.trim()
                        }
                    })
                }
            }}
        >
            {({ values, isSubmitting }) => (
                <Form>
                    <label htmlFor="admin_reply">
                        Admin Reply
                    </label>

                    <br />

                    <Field
                        as="textarea"
                        id="admin_reply"
                        name="admin_reply"
                        placeholder="Write a response to the customer..."
                        rows={4}
                        maxLength={1000}
                        disabled={submitting || isSubmitting}
                        style={{
                            width: '100%',
                            maxWidth: '600px'
                        }}
                    />

                    <ErrorMessage
                        name="admin_reply"
                        component="p"
                        className="error-message"
                    />

                    <p>{values.admin_reply.length}/1000 characters</p>

                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            isSubmitting ||
                            !values.admin_reply.trim()
                        }
                    >
                        {submitting || isSubmitting
                            ? 'Saving Reply...'
                            : initialReply
                                ? 'Update Reply'
                                : 'Send Reply'}
                    </button>
                </Form>
            )}
        </Formik>
    )
}

export default AdminReviewReply
