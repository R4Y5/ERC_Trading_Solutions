import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'

function Login() {
    const navigate = useNavigate()

    const handleLoginSuccess = () => {
        navigate('/')
    }

    return (
        <div>
            <h1>Login</h1>
            <p>Welcome back! Please log in to your account.</p>

            <LoginForm onLoginSuccess={handleLoginSuccess} />

            <p>
                Don't have an account?{' '}
                <Link to="/register">Create an account</Link>
            </p>
        </div>
    )
}

export default Login
