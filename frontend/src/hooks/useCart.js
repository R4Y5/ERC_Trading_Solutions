import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    getCart,
    updateCartItem as updateCartItemRequest,
    removeCartItem as removeCartItemRequest,
    checkoutCart
} from '../services/cartService'

function useCart() {
    const [cart, setCart] = useState(null)
    const [selectedItemIds, setSelectedItemIds] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingItemId, setUpdatingItemId] = useState(null)
    const [removingItemId, setRemovingItemId] = useState(null)
    const [deletingSelected, setDeletingSelected] = useState(false)
    const [checkingOut, setCheckingOut] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('success')

    const showMessage = (text, type = 'success') => {
        setMessage(text)
        setMessageType(type)
    }

    const loadCart = useCallback(async () => {
        setLoading(true)

        try {
            const data = await getCart()
            const nextCart = data.cart || null
            const nextItems = nextCart?.items || []

            setCart(nextCart)

            const availableIds = nextItems
                .map(cartItem => cartItem.item?._id)
                .filter(Boolean)
                .map(String)

            setSelectedItemIds(previous =>
                previous.filter(id => availableIds.includes(String(id)))
            )
        } catch (error) {
            showMessage(
                error.response?.data?.message || 'Unable to load your cart.',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCart()
    }, [loadCart])

    const cartItems = useMemo(
        () => cart?.items || [],
        [cart]
    )

    const getItemId = cartItem =>
        cartItem.item?._id ? String(cartItem.item._id) : ''

    const selectedItems = useMemo(
        () => cartItems.filter(cartItem =>
            selectedItemIds.includes(getItemId(cartItem))
        ),
        [cartItems, selectedItemIds]
    )

    const selectedQuantity = selectedItems.reduce(
        (total, cartItem) => total + Number(cartItem.quantity || 0),
        0
    )

    const selectedSubtotal = selectedItems.reduce(
        (total, cartItem) => {
            const price = Number(cartItem.item?.sell_price || 0)
            const quantity = Number(cartItem.quantity || 0)
            return total + price * quantity
        },
        0
    )

    const totalQuantity = cartItems.reduce(
        (total, cartItem) => total + Number(cartItem.quantity || 0),
        0
    )

    const totalSubtotal = cartItems.reduce(
        (total, cartItem) => {
            const price = Number(cartItem.item?.sell_price || 0)
            const quantity = Number(cartItem.quantity || 0)
            return total + price * quantity
        },
        0
    )

    const allSelected =
        cartItems.length > 0 &&
        cartItems.every(cartItem =>
            selectedItemIds.includes(getItemId(cartItem))
        )

    const hasUnavailableItems = selectedItems.some(cartItem => {
        const product = cartItem.item
        const quantity = Number(cartItem.quantity || 0)
        const stock = Number(product?.stock?.quantity ?? 0)

        return (
            !product ||
            product.deleted_at ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > stock ||
            !Number.isFinite(Number(product?.sell_price)) ||
            Number(product?.sell_price) < 0
        )
    })

    const toggleItemSelection = itemId => {
        const id = String(itemId)

        setSelectedItemIds(previous =>
            previous.includes(id)
                ? previous.filter(existingId => existingId !== id)
                : [...previous, id]
        )
    }

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedItemIds([])
            return
        }

        setSelectedItemIds(
            cartItems.map(getItemId).filter(Boolean)
        )
    }

    const updateQuantity = async (itemId, quantity) => {
        const id = String(itemId)
        const cartItem = cartItems.find(
            item => getItemId(item) === id
        )
        const stock = Number(cartItem?.item?.stock?.quantity ?? 0)

        if (
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 1
        ) {
            showMessage('Quantity must be a positive whole number.', 'error')
            return false
        }

        if (Number(quantity) > stock) {
            showMessage(`Only ${stock} units are available.`, 'error')
            return false
        }

        setUpdatingItemId(id)

        try {
            const data = await updateCartItemRequest(id, Number(quantity))

            if (data.cart) {
                setCart(data.cart)
            } else {
                await loadCart()
            }

            showMessage(data.message || 'Cart quantity updated.')
            return true
        } catch (error) {
            showMessage(
                error.response?.data?.message || 'Unable to update quantity.',
                'error'
            )

            await loadCart()
            return false
        } finally {
            setUpdatingItemId(null)
        }
    }

    const removeItem = async itemId => {
        if (!itemId) return false

        const id = String(itemId)
        setRemovingItemId(id)

        try {
            const data = await removeCartItemRequest(id)

            if (data.cart) {
                setCart(data.cart)
            } else {
                await loadCart()
            }

            setSelectedItemIds(previous =>
                previous.filter(selectedId => selectedId !== id)
            )

            showMessage(data.message || 'Item removed from cart.')
            return true
        } catch (error) {
            showMessage(
                error.response?.data?.message || 'Unable to remove item.',
                'error'
            )
            return false
        } finally {
            setRemovingItemId(null)
        }
    }

    const deleteSelectedItems = async () => {
        if (selectedItemIds.length === 0) {
            showMessage('Select at least one item to delete.', 'error')
            return false
        }

        const confirmed = window.confirm(
            `Remove ${selectedItemIds.length} selected item(s) from your cart?`
        )

        if (!confirmed) return false

        setDeletingSelected(true)

        try {
            for (const itemId of selectedItemIds) {
                await removeCartItemRequest(itemId)
            }

            setSelectedItemIds([])
            await loadCart()
            showMessage('Selected items were removed.')
            return true
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    'Some items could not be removed. Refreshing your cart.',
                'error'
            )
            await loadCart()
            return false
        } finally {
            setDeletingSelected(false)
        }
    }

    const checkoutSelected = async () => {
        if (selectedItemIds.length === 0) {
            showMessage('Select items before checking out.', 'error')
            return false
        }

        if (hasUnavailableItems) {
            showMessage(
                'Some selected items are unavailable or exceed stock.',
                'error'
            )
            return false
        }

        setCheckingOut(true)

        try {
            const data = await checkoutCart(selectedItemIds)

            setSelectedItemIds([])
            await loadCart()

            showMessage(data.message || 'Checkout completed successfully.')
            return true
        } catch (error) {
            showMessage(
                error.response?.data?.message || 'Checkout failed.',
                'error'
            )
            await loadCart()
            return false
        } finally {
            setCheckingOut(false)
        }
    }

    return {
        cart,
        cartItems,
        selectedItemIds,
        loading,
        updatingItemId,
        removingItemId,
        deletingSelected,
        checkingOut,
        message,
        messageType,
        setMessage,
        totalQuantity,
        totalSubtotal,
        selectedQuantity,
        selectedSubtotal,
        selectedItems,
        allSelected,
        hasUnavailableItems,
        toggleItemSelection,
        toggleSelectAll,
        updateQuantity,
        removeItem,
        deleteSelectedItems,
        checkoutSelected,
        loadCart,
        showMessage
    }
}

export default useCart
