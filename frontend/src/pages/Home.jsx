import { Link as RouterLink, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'

const features = [
    {
        icon: <VerifiedOutlinedIcon fontSize="large" color="primary" />,
        title: 'Quality products',
        text: 'Browse our catalog with real ratings and reviews from verified buyers.'
    },
    {
        icon: <LocalShippingOutlinedIcon fontSize="large" color="primary" />,
        title: 'Order tracking',
        text: 'Follow every order from pending to delivered, with email updates.'
    },
    {
        icon: <ReceiptLongOutlinedIcon fontSize="large" color="primary" />,
        title: 'PDF receipts',
        text: 'Get an itemized receipt in your inbox whenever your order is updated.'
    }
]

function Home() {
    const { token, user } = useSelector((state) => state.auth)

    // Logged-in users go straight to their area
    if (token && user) {
        return <Navigate to={user.role === 'Admin' ? '/admin' : '/shop'} replace />
    }

    return (
        <Box className="full-bleed" sx={{ flex: 1 }}>
            {/* Hero */}
            <Box
                sx={{
                    color: '#fff',
                    background: 'linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #2747a8 100%)',
                    py: { xs: 8, md: 12 }
                }}
            >
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <StorefrontIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '2.25rem', md: '3rem' }, mb: 2 }}>
                        ERC Trading Solutions
                    </Typography>
                    <Typography sx={{ opacity: 0.85, fontSize: { xs: 17, md: 19 }, mb: 4, maxWidth: 560, mx: 'auto' }}>
                        Quality trading goods, simple ordering, and real-time order updates — all in one place.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
                        <Button component={RouterLink} to="/login" variant="contained" color="secondary" size="large">
                            Log in
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/register"
                            variant="outlined"
                            size="large"
                            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        >
                            Create an account
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Features */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                <Grid container spacing={3}>
                    {features.map((feature) => (
                        <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 3 }}>
                                    {feature.icon}
                                    <Typography variant="h3" sx={{ mt: 1.5, mb: 1 }}>{feature.title}</Typography>
                                    <Typography color="text.secondary">{feature.text}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    )
}

export default Home
