import { Link as RouterLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AdminNavbar from '../components/AdminNavbar'
import SalesChart from '../components/dashboard/SalesChart'
import TopProductsChart from '../components/dashboard/TopProductsChart'
import useDashboardStats from '../hooks/useDashboardStats'

function StatCard({ label, value, icon, color, to, loading }) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardActionArea component={RouterLink} to={to} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${color}.main`, color: '#fff', width: 48, height: 48 }}>
                        {icon}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {label}
                        </Typography>
                        {loading ? (
                            <Skeleton width={48} height={36} />
                        ) : (
                            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
                                {value ?? '—'}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

const quickLinks = [
    { to: '/items', label: 'Manage products', text: 'Add, edit, and bulk-delete items', icon: <Inventory2OutlinedIcon /> },
    { to: '/orders', label: 'Process orders', text: 'Update statuses and email receipts', icon: <ReceiptLongOutlinedIcon /> },
    { to: '/users', label: 'Manage users', text: 'Activate or deactivate accounts', icon: <PeopleOutlinedIcon /> },
    { to: '/reviews/admin', label: 'Moderate reviews', text: 'Reply to or remove reviews', icon: <RateReviewOutlinedIcon /> }
]

function AdminDashboard() {
    const user = useSelector((state) => state.auth.user)
    const { stats, loading } = useDashboardStats()
    const firstName = user?.customer?.fname || user?.username || 'Admin'

    return (
        <div>
            <AdminNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h1">Welcome back, {firstName}</Typography>
                    <Typography color="text.secondary">
                        Here's what's happening in your store.
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard label="Active products" value={stats.products} icon={<Inventory2OutlinedIcon />} color="primary" to="/items" loading={loading} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard label="Low stock (under 10)" value={stats.lowStock} icon={<WarningAmberOutlinedIcon />} color="warning" to="/items" loading={loading} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard label="Customers" value={stats.customers} icon={<PeopleOutlinedIcon />} color="success" to="/users" loading={loading} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard label="Pending orders" value={stats.pendingOrders} icon={<PendingActionsOutlinedIcon />} color="secondary" to="/orders" loading={loading} />
                    </Grid>
                </Grid>

                <SalesChart />

                <TopProductsChart />

                <Typography variant="h2" sx={{ mt: 4, mb: 2 }}>
                    Quick actions
                </Typography>
                <Grid container spacing={2}>
                    {quickLinks.map((link) => (
                        <Grid key={link.to} size={{ xs: 12, sm: 6, lg: 3 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardActionArea component={RouterLink} to={link.to} sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Avatar sx={{ bgcolor: 'rgba(30,58,138,0.08)', color: 'primary.main' }}>
                                                {link.icon}
                                            </Avatar>
                                            <ArrowForwardIcon color="action" fontSize="small" />
                                        </Stack>
                                        <Typography sx={{ fontWeight: 700 }}>{link.label}</Typography>
                                        <Typography variant="body2" color="text.secondary">{link.text}</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </div>
    )
}

export default AdminDashboard
