import { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { login } from '../../actions/authActions'

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
    const dispatch = useDispatch()
    const [serverError, setServerError] = useState('')

    const handleSubmit = async (values, { setSubmitting }) => {
        setServerError('')

        try {
            await dispatch(login(values.email, values.password))

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
            {({ isSubmitting, errors, touched }) => (
                <Form noValidate>
                    <Stack spacing={2.5}>
                        <Field
                            as={TextField}
                            id="email"
                            name="email"
                            type="email"
                            label="Email Address"
                            autoComplete="email"
                            placeholder="you@example.com"
                            error={Boolean(touched.email && errors.email)}
                            helperText={touched.email && errors.email}
                            size="medium"
                        />

                        <Field
                            as={TextField}
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            autoComplete="current-password"
                            error={Boolean(touched.password && errors.password)}
                            helperText={touched.password && errors.password}
                            size="medium"
                        />

                        {serverError && (
                            <Alert severity="error" role="alert">
                                {serverError}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </Button>
                    </Stack>
                </Form>
            )}
        </Formik>
    )
}

export default LoginForm