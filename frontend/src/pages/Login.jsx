import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import AuthLayout from '../components/layout/AuthLayout'

function Login() {
    const navigate = useNavigate()

    // The home page sends admins to the dashboard and customers to the shop
    const handleLoginSuccess = () => {
        navigate('/')
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to your ERC Trading account."
            footer={
                <>
                    Don't have an account?{' '}
                    <Link to="/register">Create an account</Link>
                </>
            }
        >
            <LoginForm onLoginSuccess={handleLoginSuccess} />

            <GoogleLoginButton />
        </AuthLayout>
    )
}

export default Login