
const formatPrice = amount =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(Number(amount) || 0)

function CartSummary({
    selectedQuantity,
    selectedSubtotal,
    selectedCount,
    onCheckout,
    checkingOut,
    disabled
}) {
    return (
        <aside style={styles.card}>
            <h2 style={styles.title}>Order Summary</h2>

            <div style={styles.row}>
                <span>Selected products</span>
                <span>{selectedCount}</span>
            </div>

            <div style={styles.row}>
                <span>Selected quantity</span>
                <span>{selectedQuantity}</span>
            </div>

            <div style={styles.row}>
                <span>Subtotal</span>
                <strong>{formatPrice(selectedSubtotal)}</strong>
            </div>

            <div style={styles.divider} />

            <div style={styles.totalRow}>
                <span>Estimated total</span>
                <strong>{formatPrice(selectedSubtotal)}</strong>
            </div>

            <p style={styles.note}>
                Shipping fees, if applicable, are not included.
            </p>

            <button
                type="button"
                onClick={onCheckout}
                disabled={disabled || checkingOut}
                style={{
                    ...styles.button,
                    ...(disabled || checkingOut ? styles.disabled : {})
                }}
            >
                {checkingOut
                    ? 'Processing...'
                    : `Checkout ${selectedCount} Selected`}
            </button>
        </aside>
    )
}

const styles = {
    card: {
        padding: '24px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px'
    },
    title: {
        margin: '0 0 24px',
        fontSize: '20px'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '18px',
        fontSize: '14px',
        color: '#475569'
    },
    divider: {
        borderTop: '1px solid #e2e8f0',
        margin: '22px 0'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px'
    },
    note: {
        color: '#64748b',
        fontSize: '12px',
        lineHeight: 1.6,
        margin: '16px 0 20px'
    },
    button: {
        width: '100%',
        padding: '14px',
        border: 'none',
        borderRadius: '9px',
        backgroundColor: '#0f766e',
        color: '#fff',
        fontWeight: '700',
        cursor: 'pointer'
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    }
}

export default CartSummary
