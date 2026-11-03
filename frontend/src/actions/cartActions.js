import {
    getCart as getCartRequest,
    updateCartItem as updateCartItemRequest,
    removeCartItem as removeCartItemRequest,
    checkoutCart as checkoutCartRequest
} from '../services/cartService'
import { addShopItemToCart } from '../services/shopService'
import {
    CART_REQUEST,
    CART_SUCCESS,
    CART_FAIL,
    CART_UPDATED
} from '../constants/cartConstants'

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.message || fallback

// Each thunk resolves with the server's response data, or rejects
// with an Error whose message can be shown to the user.

export const fetchCart = () => async (dispatch) => {
    dispatch({ type: CART_REQUEST })

    try {
        const data = await getCartRequest()
        dispatch({ type: CART_SUCCESS, payload: data.cart || null })
        return data.cart || null
    } catch (error) {
        const message = getErrorMessage(error, 'Unable to load your cart.')
        dispatch({ type: CART_FAIL, payload: message })
        throw new Error(message, { cause: error })
    }
}

// After a change, store the cart the server sent back,
// or reload it if the response didn't include one.
const applyCartResponse = async (dispatch, data) => {
    if (data.cart) {
        dispatch({ type: CART_UPDATED, payload: data.cart })
    } else {
        await dispatch(fetchCart())
    }
    return data
}

export const addToCart = (itemId, quantity = 1) => async (dispatch) => {
    try {
        const data = await addShopItemToCart(itemId, quantity)
        return await applyCartResponse(dispatch, data)
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Failed to add product to cart.'), { cause: error })
    }
}

export const updateCartQuantity = (itemId, quantity) => async (dispatch) => {
    try {
        const data = await updateCartItemRequest(itemId, quantity)
        return await applyCartResponse(dispatch, data)
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Unable to update quantity.'), { cause: error })
    }
}

export const removeFromCart = (itemId) => async (dispatch) => {
    try {
        const data = await removeCartItemRequest(itemId)
        return await applyCartResponse(dispatch, data)
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Unable to remove item.'), { cause: error })
    }
}

// Remove several items one by one, then refresh the cart once
export const removeManyFromCart = (itemIds) => async (dispatch) => {
    try {
        for (const itemId of itemIds) {
            await removeCartItemRequest(itemId)
        }
    } catch (error) {
        throw new Error(
            getErrorMessage(error, 'Some items could not be removed. Refreshing your cart.'),
            { cause: error }
        )
    } finally {
        await dispatch(fetchCart()).catch(() => {})
    }
}

// Place an order for the selected cart items, then refresh the cart
export const checkoutCart = (itemIds) => async (dispatch) => {
    try {
        return await checkoutCartRequest(itemIds)
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Checkout failed.'), { cause: error })
    } finally {
        await dispatch(fetchCart()).catch(() => {})
    }
}
