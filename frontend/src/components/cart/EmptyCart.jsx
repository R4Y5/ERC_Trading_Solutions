
import { Link } from 'react-router-dom'

function EmptyCart() {
    return (
        <section style={styles.container}>
            <div style={styles.icon} aria-hidden="true">
                🛒
            </div>

            <h2 style={styles.title}>Your cart is empty</h2>

            <p style={styles.description}>
                Looks like you haven't added anything yet.
                Explore our products to find something you'll love.
            </p>

            <Link to="/shop" style={styles.button}>
                Continue Shopping
            </Link>
        </section>
    )
}

const styles = {
    container: {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '56px 24px',
        textAlign: 'center'
    },
    icon: {
        fontSize: '52px',
        marginBottom: '16px'
    },
    title: {
        fontSize: '24px',
        color: '#0f172a',
        margin: '0 0 12px'
    },
    description: {
        maxWidth: '420px',
        margin: '0 auto 24px',
        lineHeight: 1.7,
        color: '#64748b'
    },
    button: {
        display: 'inline-block',
        textDecoration: 'none',
        backgroundColor: '#0f766e',
        color: '#fff',
        padding: '12px 22px',
        borderRadius: '9px',
        fontWeight: '600'
    }
}

export default EmptyCart
