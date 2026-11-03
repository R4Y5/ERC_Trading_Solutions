import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Container from '@mui/material/Container'
import MenuIcon from '@mui/icons-material/Menu'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import { logout } from '../../actions/authActions'

const isHttpUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value)

// Shared top navigation bar for customers and admins.
// links: [{ to, label, icon, badge? }]
function AppNavbar({ links, homePath, subtitle, profilePath }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const user = useSelector((state) => state.auth.user)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [menuAnchor, setMenuAnchor] = useState(null)

    const displayName =
        [user?.customer?.fname, user?.customer?.lname].filter(Boolean).join(' ') ||
        user?.username ||
        user?.email ||
        'Account'

    const isActive = (to) =>
        location.pathname === to || location.pathname.startsWith(`${to}/`)

    const handleLogout = () => {
        setMenuAnchor(null)
        setDrawerOpen(false)
        dispatch(logout())
        navigate('/login')
    }

    const renderLabel = (link) =>
        link.badge ? (
            <Badge badgeContent={link.badge} color="secondary" max={99}>
                <Box component="span" sx={{ pr: 1 }}>{link.label}</Box>
            </Badge>
        ) : (
            link.label
        )

    return (
        <AppBar
            position="sticky"
            className="app-navbar"
            sx={{ bgcolor: 'primary.dark', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
            <Container maxWidth="lg" disableGutters sx={{ px: 2 }}>
                <Toolbar disableGutters sx={{ gap: 1, minHeight: { xs: 60, md: 68 } }}>
                    {/* Mobile menu button */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        aria-label="Open navigation menu"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Brand */}
                    <Box
                        component={RouterLink}
                        to={homePath}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'inherit',
                            textDecoration: 'none',
                            mr: 2
                        }}
                    >
                        <StorefrontIcon sx={{ color: 'secondary.main' }} />
                        <Box>
                            <Typography
                                component="span"
                                sx={{ fontWeight: 800, fontSize: { xs: 16, md: 18 }, display: 'block', lineHeight: 1.1 }}
                            >
                                ERC Trading
                            </Typography>
                            {subtitle && (
                                <Typography
                                    component="span"
                                    sx={{ fontSize: 11, opacity: 0.75, letterSpacing: 1, textTransform: 'uppercase' }}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Desktop links */}
                    <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
                        {links.map((link) => (
                            <Button
                                key={link.to}
                                component={RouterLink}
                                to={link.to}
                                color="inherit"
                                startIcon={link.icon}
                                aria-current={isActive(link.to) ? 'page' : undefined}
                                sx={{
                                    px: 1.5,
                                    opacity: isActive(link.to) ? 1 : 0.85,
                                    bgcolor: isActive(link.to) ? 'rgba(255,255,255,0.12)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', opacity: 1 }
                                }}
                            >
                                {renderLabel(link)}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

                    {/* Account menu */}
                    <Tooltip title={displayName}>
                        <IconButton
                            onClick={(event) => setMenuAnchor(event.currentTarget)}
                            aria-label="Open account menu"
                            sx={{ p: 0.5 }}
                        >
                            <Avatar
                                src={isHttpUrl(user?.profile_image) ? user.profile_image : undefined}
                                alt={displayName}
                                sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700 }}
                            >
                                {displayName.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        slotProps={{ paper: { sx: { mt: 1, minWidth: 220 } } }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography sx={{ fontWeight: 700 }} noWrap>{displayName}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider />
                        {profilePath && (
                            <MenuItem
                                component={RouterLink}
                                to={profilePath}
                                onClick={() => setMenuAnchor(null)}
                            >
                                <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                                My Profile
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </Container>

            {/* Mobile drawer */}
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 260 }} role="presentation">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'primary.dark', color: '#fff' }}>
                        <StorefrontIcon sx={{ color: 'secondary.main' }} />
                        <Typography sx={{ fontWeight: 800 }}>ERC Trading</Typography>
                    </Box>
                    <List>
                        {links.map((link) => (
                            <ListItemButton
                                key={link.to}
                                component={RouterLink}
                                to={link.to}
                                selected={isActive(link.to)}
                                onClick={() => setDrawerOpen(false)}
                            >
                                <ListItemIcon>
                                    {link.badge ? (
                                        <Badge badgeContent={link.badge} color="secondary" max={99}>
                                            {link.icon}
                                        </Badge>
                                    ) : link.icon}
                                </ListItemIcon>
                                <ListItemText primary={link.label} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Divider />
                    <List>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    )
}

export default AppNavbar
