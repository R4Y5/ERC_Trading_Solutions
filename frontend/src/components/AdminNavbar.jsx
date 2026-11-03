import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import AppNavbar from './layout/AppNavbar'

const links = [
    { to: '/admin', label: 'Dashboard', icon: <DashboardOutlinedIcon /> },
    { to: '/users', label: 'Users', icon: <PeopleOutlineIcon /> },
    { to: '/items', label: 'Items', icon: <Inventory2OutlinedIcon /> },
    { to: '/orders', label: 'Orders', icon: <ReceiptLongOutlinedIcon /> },
    { to: '/reviews/admin', label: 'Reviews', icon: <RateReviewOutlinedIcon /> }
]

function AdminNavbar() {
    return <AppNavbar links={links} homePath="/admin" subtitle="Admin" />
}

export default AdminNavbar