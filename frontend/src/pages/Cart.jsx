import { Link } from 'react-router-dom'
import CustomerNavbar from '../components/CustomerNavbar'
import CartItem from '../components/cart/CartItem'
import useCart from '../hooks/useCart'

function Cart() {
    const {
        cartItems,
        selectedItemIds,
        loading,
        message,
        messageType,
        setMessage,
        totalQuantity,
        totalSubtotal,
        selectedQuantity,
        selectedSubtotal,
        allSelected,
        hasUnavailableItems,
        updatingItemId,
        removingItemId,
        deletingSelected,
        checkingOut,
        toggleItemSelection,
        toggleSelectAll,
        updateQuantity,
        removeItem,
        deleteSelectedItems,
        checkoutSelected
    } = useCart()

    const formatPrice = amount =>
        Number(amount || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })

    const handleCheckout = async () => {
        if (selectedItemIds.length === 0) return

        const confirmed = window.confirm(
            `Proceed to checkout ${selectedQuantity} item(s) for ₱${formatPrice(selectedSubtotal)}?`
        )

        if (confirmed) {
            await checkoutSelected()
        }
    }

    return (
        <>
            <CustomerNavbar />

            <main className="cart-page">
                <header className="cart-page-header">
                    <h1>My Shopping Cart</h1>
                    <p>Review your items before checkout.</p>
                </header>

                {message && (
                    <div
                        className={`cart-message ${messageType}`}
                        role="status"
                    >
                        <span>{message}</span>
                        <button
                            type="button"
                            onClick={() => setMessage('')}
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {loading ? (
                    <p className="cart-loading">Loading your cart...</p>
                ) : cartItems.length === 0 ? (
                    <section className="cart-empty">
                        <h2>Your cart is empty</h2>
                        <p>Add products from the shop to get started.</p>
                        <Link to="/shop" className="cart-shop-link">
                            Browse Shop
                        </Link>
                    </section>
                ) : (
                    <div className="cart-layout">
                        <section className="cart-list-section">
                            <div className="cart-list-toolbar">
                                <label className="cart-select-all">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                    />
                                    Select all ({cartItems.length})
                                </label>

                                <button
                                    type="button"
                                    className="cart-delete-selected"
                                    onClick={deleteSelectedItems}
                                    disabled={
                                        selectedItemIds.length === 0 ||
                                        deletingSelected ||
                                        checkingOut
                                    }
                                >
                                    {deletingSelected
                                        ? 'Deleting...'
                                        : `Delete selected (${selectedItemIds.length})`}
                                </button>
                            </div>

                            {cartItems.map(cartItem => {
                                const itemId = cartItem.item?._id
                                const id = String(itemId || cartItem._id)

                                return (
                                    <CartItem
                                        key={id}
                                        cartItem={cartItem}
                                        selected={selectedItemIds.includes(id)}
                                        onToggleSelect={toggleItemSelection}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeItem}
                                        updating={updatingItemId === id}
                                        removing={removingItemId === id}
                                    />
                                )
                            })}
                        </section>

                        <aside className="cart-summary">
                            <h2>Order Summary</h2>

                            <div className="cart-summary-row">
                                <span>All cart items</span>
                                <span>{totalQuantity}</span>
                            </div>

                            <div className="cart-summary-row">
                                <span>Cart subtotal</span>
                                <span>₱{formatPrice(totalSubtotal)}</span>
                            </div>

                            <hr />

                            <div className="cart-summary-row">
                                <span>Selected quantity</span>
                                <span>{selectedQuantity}</span>
                            </div>

                            <div className="cart-summary-total">
                                <span>Selected subtotal</span>
                                <strong>₱{formatPrice(selectedSubtotal)}</strong>
                            </div>

                            {hasUnavailableItems && (
                                <p className="cart-summary-warning">
                                    One or more selected items are unavailable
                                    or have insufficient stock.
                                </p>
                            )}

                            <button
                                type="button"
                                className="cart-checkout-button"
                                onClick={handleCheckout}
                                disabled={
                                    selectedItemIds.length === 0 ||
                                    hasUnavailableItems ||
                                    checkingOut ||
                                    deletingSelected ||
                                    Boolean(updatingItemId) ||
                                    Boolean(removingItemId)
                                }
                            >
                                {checkingOut
                                    ? 'Processing...'
                                    : 'Checkout Selected Items'}
                            </button>

                            <Link to="/shop" className="cart-continue-link">
                                Continue Shopping
                            </Link>
                        </aside>
                    </div>
                )}
            </main>

            <style>{`
                .cart-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px 20px 60px;
                    color: #1f2937;
                }

                .cart-page-header {
                    margin-bottom: 24px;
                }

                .cart-page-header h1 {
                    font-size: 30px;
                    margin: 0 0 8px;
                }

                .cart-page-header p {
                    color: #6b7280;
                    margin: 0;
                }

                .cart-message {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                }

                .cart-message.success {
                    background: #dcfce7;
                    color: #166534;
                }

                .cart-message.error {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .cart-message button {
                    border: 0;
                    background: transparent;
                    font-size: 20px;
                    cursor: pointer;
                }

                .cart-loading {
                    padding: 40px 0;
                    text-align: center;
                }

                .cart-empty {
                    padding: 56px 20px;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                }

                .cart-empty p {
                    color: #6b7280;
                }

                .cart-shop-link,
                .cart-continue-link {
                    display: inline-block;
                    text-decoration: none;
                    color: #166534;
                    font-weight: 600;
                    margin-top: 12px;
                }

                .cart-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 320px;
                    align-items: start;
                    gap: 24px;
                }

                .cart-list-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 14px 16px;
                    margin-bottom: 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    background: #fff;
                }

                .cart-select-all {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    cursor: pointer;
                }

                .cart-select-all input {
                    accent-color: #166534;
                }

                .cart-delete-selected {
                    color: #dc2626;
                    background: transparent;
                    border: 0;
                    cursor: pointer;
                    font-weight: 600;
                }

                .cart-delete-selected:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                .cart-summary {
                    position: sticky;
                    top: 20px;
                    padding: 22px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: #fff;
                }

                .cart-summary h2 {
                    margin: 0 0 20px;
                    font-size: 20px;
                }

                .cart-summary-row,
                .cart-summary-total {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 14px;
                }

                .cart-summary-row span:first-child,
                .cart-summary-total span {
                    color: #4b5563;
                }

                .cart-summary-total {
                    align-items: flex-start;
                    font-size: 16px;
                }

                .cart-summary-total strong {
                    text-align: right;
                }

                .cart-summary-warning {
                    color: #b45309;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .cart-checkout-button {
                    width: 100%;
                    border: 0;
                    border-radius: 8px;
                    padding: 13px 16px;
                    background: #166534;
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 12px;
                }

                .cart-checkout-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cart-continue-link {
                    display: block;
                    text-align: center;
                }

                @media (max-width: 850px) {
                    .cart-layout {
                        grid-template-columns: 1fr;
                    }

                    .cart-summary {
                        position: static;
                    }
                }

                @media (max-width: 520px) {
                    .cart-page {
                        padding: 22px 12px 40px;
                    }

                    .cart-page-header h1 {
                        font-size: 25px;
                    }

                    .cart-list-toolbar {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                }
            `}</style>
        </>
    )
}

export default Cart
