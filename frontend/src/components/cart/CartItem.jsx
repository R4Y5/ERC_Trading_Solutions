import { useEffect, useState } from 'react'

function CartItem({
    cartItem,
    selected,
    onToggleSelect,
    onUpdateQuantity,
    onRemove,
    updating,
    removing
}) {
    const product = cartItem?.item
    const itemId = product?._id

    const cartQuantity = Number(cartItem?.quantity || 1)
    const stockQuantity = Number(product?.stock?.quantity ?? 0)
    const price = Number(product?.sell_price || 0)
    const subtotal = price * cartQuantity

    const [quantityInput, setQuantityInput] = useState(String(cartQuantity))
    const [quantityError, setQuantityError] = useState('')

    useEffect(() => {
        setQuantityInput(String(cartQuantity))
    }, [cartQuantity])

    const imagePath =
        product?.images?.find(image => image.image_path)?.image_path ||
        product?.image ||
        ''

    const formatPrice = amount =>
        amount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })

    const handleInputChange = value => {
        if (value === '' || /^\d+$/.test(value)) {
            setQuantityInput(value)
            setQuantityError('')
        }
    }

    const saveQuantity = async () => {
        if (updating) return

        if (quantityInput.trim() === '') {
            setQuantityError('Enter a quantity.')
            setQuantityInput(String(cartQuantity))
            return
        }

        const quantity = Number(quantityInput)

        if (!Number.isInteger(quantity) || quantity < 1) {
            setQuantityError('Quantity must be at least 1.')
            setQuantityInput(String(cartQuantity))
            return
        }

        if (quantity > stockQuantity) {
            setQuantityError(`Only ${stockQuantity} available.`)
            setQuantityInput(String(cartQuantity))
            return
        }

        if (quantity === cartQuantity) return

        const success = await onUpdateQuantity(itemId, quantity)

        if (success === false) {
            setQuantityInput(String(cartQuantity))
        }
    }

    const decreaseQuantity = async () => {
        if (updating || cartQuantity <= 1) return

        setQuantityError('')
        await onUpdateQuantity(itemId, cartQuantity - 1)
    }

    const increaseQuantity = async () => {
        if (updating) return

        if (cartQuantity >= stockQuantity) {
            setQuantityError('Maximum available stock reached.')
            return
        }

        setQuantityError('')
        await onUpdateQuantity(itemId, cartQuantity + 1)
    }

    if (!product) {
        return (
            <div className="cart-item-card">
                <p>This product is no longer available.</p>

                <button
                    type="button"
                    onClick={() => onRemove(cartItem?._id)}
                    disabled={removing}
                >
                    {removing ? 'Removing...' : 'Remove'}
                </button>
            </div>
        )
    }

    return (
        <article className="cart-item-card">
            <div className="cart-item-top-row">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(itemId)}
                    aria-label={`Select ${product.item_name}`}
                    className="cart-item-checkbox"
                />

                {imagePath ? (
                    <img
                        src={imagePath}
                        alt={product.item_name}
                        className="cart-item-image"
                    />
                ) : (
                    <div className="cart-item-image cart-no-image">
                        No image
                    </div>
                )}

                <div className="cart-item-details">
                    <h3 className="cart-item-name">
                        {product.item_name}
                    </h3>

                    <p className="cart-item-price">
                        ₱{formatPrice(price)}
                    </p>

                    <p className="cart-stock">
                        Available stock: {stockQuantity}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(itemId)}
                    disabled={removing || updating}
                    className="cart-remove-button"
                >
                    {removing ? 'Removing...' : 'Remove'}
                </button>
            </div>

            <div className="cart-item-bottom-row">
                <div className="cart-quantity-section">
                    <label className="cart-quantity-label">
                        Quantity
                    </label>

                    <div className="cart-quantity-controls">
                        <button
                            type="button"
                            onClick={decreaseQuantity}
                            disabled={updating || cartQuantity <= 1}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <input
                            type="number"
                            min="1"
                            max={stockQuantity}
                            step="1"
                            value={quantityInput}
                            disabled={updating}
                            onChange={event =>
                                handleInputChange(event.target.value)
                            }
                            onBlur={saveQuantity}
                            onKeyDown={event => {
                                if (event.key === 'Enter') {
                                    event.currentTarget.blur()
                                }
                            }}
                            aria-label={`Quantity for ${product.item_name}`}
                        />

                        <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={
                                updating ||
                                cartQuantity >= stockQuantity
                            }
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>

                    {updating && (
                        <span className="cart-updating-text">
                            Updating...
                        </span>
                    )}

                    {quantityError && (
                        <p className="cart-quantity-error" role="alert">
                            {quantityError}
                        </p>
                    )}
                </div>

                <p className="cart-item-subtotal">
                    Subtotal: ₱{formatPrice(subtotal)}
                </p>
            </div>

            <style>{`
                .cart-item-card {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 18px;
                    margin-bottom: 16px;
                }

                .cart-item-top-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .cart-item-checkbox {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #166534;
                    flex-shrink: 0;
                }

                .cart-item-image {
                    width: 88px;
                    height: 88px;
                    object-fit: cover;
                    border-radius: 8px;
                    flex-shrink: 0;
                    background: #f3f4f6;
                }

                .cart-no-image {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    font-size: 12px;
                }

                .cart-item-details {
                    flex: 1;
                    min-width: 0;
                }

                .cart-item-name {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 8px;
                    overflow-wrap: anywhere;
                }

                .cart-item-price {
                    color: #166534;
                    font-weight: 600;
                    margin: 0 0 5px;
                }

                .cart-stock {
                    color: #6b7280;
                    font-size: 13px;
                    margin: 0;
                }

                .cart-remove-button {
                    border: 0;
                    background: transparent;
                    color: #dc2626;
                    cursor: pointer;
                    padding: 8px;
                    font-weight: 500;
                    flex-shrink: 0;
                }

                .cart-remove-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cart-item-bottom-row {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 16px;
                    margin-top: 18px;
                    padding-top: 14px;
                    border-top: 1px solid #f0f0f0;
                }

                .cart-quantity-label {
                    display: block;
                    font-size: 13px;
                    color: #4b5563;
                    margin-bottom: 7px;
                }

                .cart-quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 0;
                }

                .cart-quantity-controls button {
                    width: 36px;
                    height: 36px;
                    border: 1px solid #d1d5db;
                    background: #f9fafb;
                    cursor: pointer;
                    font-size: 20px;
                }

                .cart-quantity-controls button:first-child {
                    border-radius: 7px 0 0 7px;
                }

                .cart-quantity-controls button:last-child {
                    border-radius: 0 7px 7px 0;
                }

                .cart-quantity-controls button:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                .cart-quantity-controls input {
                    width: 60px;
                    height: 36px;
                    border: 1px solid #d1d5db;
                    border-left: 0;
                    border-right: 0;
                    border-radius: 0;
                    text-align: center;
                    font-size: 15px;
                    outline-offset: -2px;
                }

                .cart-item-subtotal {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 600;
                    text-align: right;
                }

                .cart-updating-text {
                    display: block;
                    color: #6b7280;
                    font-size: 12px;
                    margin-top: 5px;
                }

                .cart-quantity-error {
                    color: #dc2626;
                    font-size: 12px;
                    margin: 6px 0 0;
                }

                @media (max-width: 560px) {
                    .cart-item-card {
                        padding: 12px;
                    }

                    .cart-item-top-row {
                        gap: 9px;
                        flex-wrap: wrap;
                    }

                    .cart-item-image {
                        width: 68px;
                        height: 68px;
                    }

                    .cart-item-name {
                        font-size: 14px;
                    }

                    .cart-remove-button {
                        margin-left: auto;
                    }

                    .cart-item-bottom-row {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .cart-item-subtotal {
                        text-align: left;
                    }
                }
            `}</style>
        </article>
    )
}

export default CartItem
