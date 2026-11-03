import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'

const highlights = [
    'Browse quality trading goods',
    'Track every order in real time',
    'Itemized PDF receipts by email'
]

// Two-column layout for Login / Register / Complete Registration.
// Left: brand panel (hidden on phones). Right: the form card.
function AuthLayout({ title, subtitle, children, footer, maxWidth = 440 }) {
    return (
        <Box
            className="full-bleed"
            sx={{
                flex: 1,
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }
            }}
        >
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 6,
                    color: '#fff',
                    background: 'linear-gradient(160deg, #172554 0%, #1e3a8a 65%, #2747a8 100%)'
                }}
            >
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none' }}
                >
                    <StorefrontIcon sx={{ color: 'secondary.main' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: 20 }}>ERC Trading Solutions</Typography>
                </Box>

                <Box>
                    <Typography sx={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, mb: 3 }}>
                        Your trusted source for quality trading goods.
                    </Typography>
                    <Stack spacing={1.5}>
                        {highlights.map((text) => (
                            <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CheckCircleOutlineIcon sx={{ color: 'secondary.main' }} />
                                <Typography sx={{ opacity: 0.9 }}>{text}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>

                <Typography sx={{ opacity: 0.6, fontSize: 13 }}>
                    © {new Date().getFullYear()} ERC Trading Solutions
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, sm: 4 },
                    bgcolor: 'background.default'
                }}
            >
                <Box sx={{ width: '100%', maxWidth }}>
                    {/* Brand for phones (left panel is hidden) */}
                    <Box
                        component={RouterLink}
                        to="/"
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mb: 3,
                            color: 'primary.dark',
                            textDecoration: 'none'
                        }}
                    >
                        <StorefrontIcon sx={{ color: 'secondary.main' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: 18 }}>ERC Trading Solutions</Typography>
                    </Box>

                    <Card sx={{ boxShadow: '0 10px 30px rgba(16,24,40,0.08)' }}>
                        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                            <Typography variant="h1" sx={{ fontSize: 26, mb: 0.5 }}>{title}</Typography>
                            {subtitle && (
                                <Typography color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>
                            )}
                            {children}
                        </CardContent>
                    </Card>

                    {footer && (
                        <Typography sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
                            {footer}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default AuthLayout