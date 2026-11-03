import { Link, useNavigate } from 'react-router-dom'
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
            <div>
                <h1>Registration Session Missing</h1>
                <p>
                    Please start the registration process again.
                </p>

                <Link to="/register">
                    Go to Registration
                </Link>
            </div>
        )
    }

    return (
        <div>
            <h1>Complete Your Registration</h1>

            <p>
                Registering with: <strong>{registrationEmail}</strong>
            </p>

            <CompleteRegistrationForm
                onSubmit={handleSubmit}
                profilePicture={profilePicture}
                onProfilePictureChange={setProfilePicture}
                loading={loading}
                serverError={error}
            />

            <p>
                Already have an account?{' '}
                <Link to="/login">Log in</Link>
            </p>
        </div>
    )
}

export default CompleteRegistration
