import { Link, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import AuthLayout from '../components/layout/AuthLayout'
import { useState } from 'react'
import CompleteRegistrationForm from '../components/auth/CompleteRegistrationForm'
import { useCompleteRegistration } from '../hooks/useCompleteRegistration'

function CompleteRegistration() {
    const navigate = useNavigate()

    const registrationToken = sessionStorage.getItem('registrationToken')
    const registrationEmail = sessionStorage.getItem('registrationEmail')

    const [profilePicture, setProfilePicture] = useState(null)

    const {
        submitRegistration,
        loading,
        error,
    } = useCompleteRegistration()

    const handleSubmit = async (values) => {
        const result = await submitRegistration(
            values,
            profilePicture,
            registrationToken
        )

        if (result) {
            alert(
                result.message ||
                'Registration completed successfully!'
            )

            navigate('/login')
        }
    }

    if (!registrationToken || !registrationEmail) {
        return (
            <AuthLayout
                title="Registration session missing"
                subtitle="Please start the registration process again."
            >
                <Button component={Link} to="/register" variant="contained" fullWidth>
                    Go to Registration
                </Button>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Complete your registration"
            subtitle={<>Registering with: <strong>{registrationEmail}</strong></>}
            maxWidth={640}
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login">Log in</Link>
                </>
            }
        >
            <CompleteRegistrationForm
                onSubmit={handleSubmit}
                profilePicture={profilePicture}
                onProfilePictureChange={setProfilePicture}
                loading={loading}
                serverError={error}
            />
        </AuthLayout>
    )
}

export default CompleteRegistration