import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'ERC Trading Solutions'

// Browser tab title for each page (exact paths)
const PAGE_TITLES = {
    '/': 'Home',
    '/login': 'Log In',
    '/register': 'Create Account',
    '/complete-registration': 'Complete Registration',

    // Customer pages
    '/shop': 'Shop',
    '/cart': 'My Cart',
    '/my-orders': 'My Orders',
    '/reviews': 'My Reviews',
    '/profile': 'My Profile',

    // Admin pages
    '/admin': 'Admin Dashboard',
    '/users': 'Users',
    '/items': 'Products',
    '/orders': 'Orders',
    '/reviews/admin': 'Reviews'
}

// Updates the browser tab text whenever the page changes,
// e.g. "My Cart | ERC Trading Solutions".
function PageTitle() {
    const { pathname } = useLocation()

    useEffect(() => {
        // "/cart/" and "/cart" show the same title
        const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
        const page = PAGE_TITLES[path]

        document.title = page ? `${page} | ${SITE_NAME}` : SITE_NAME
    }, [pathname])

    return null
}

export default PageTitle
