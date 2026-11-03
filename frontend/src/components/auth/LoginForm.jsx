import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import api from '../../services/api'

// Validation stays inside this file
const loginSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address')
        .required('Email is required'),

    password: Yup.string()
        .required('Password is required'),
})

function LoginForm({ onLoginSuccess }) {
    const [serverError, setServerError] = useState('')

    const handleSubmit = async (values, { setSubmitting }) => {
        setServerError('')

        try {
            const response = await api.post('/users/login', {
                email: values.email.trim().toLowerCase(),
                password: values.password,
            })

            // Adjust these property names if your backend returns
            // a different response structure.
            const token = response.data.token

            if (!token) {
                throw new Error('Login succeeded, but no token was returned.')
            }

            localStorage.setItem('token', token)

            if (response.data.user) {
                localStorage.setItem(
                    'user',
                    JSON.stringify(response.data.user)
                )
            }

            onLoginSuccess()
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                error.message ||
                'Unable to log in. Please try again.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Formik
            initialValues={{
                email: '',
                password: '',
            }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form>
                    <div>
                        <label htmlFor="email">Email Address</label>

                        <Field
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter your email"
                        />

                        <ErrorMessage
                            name="email"
                            component="p"
                            className="error"
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>

                        <Field
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />

                        <ErrorMessage
                            name="password"
                            component="p"
                            className="error"
                        />
                    </div>

                    {serverError && (
                        <p role="alert" className="error">
                            {serverError}
                        </p>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Log In'}
                    </button>
                </Form>
            )}
        </Formik>
    )
}

export default LoginForm