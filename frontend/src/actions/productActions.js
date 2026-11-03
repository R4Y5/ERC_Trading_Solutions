import { getShopItem, getShopItems } from '../services/shopService'
import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_DETAILS_RESET
} from '../constants/productConstants'

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.message || fallback

// Load every active product for the shop
export const getProducts = () => async (dispatch) => {
    dispatch({ type: ALL_PRODUCTS_REQUEST })

    try {
        const items = await getShopItems()
        dispatch({ type: ALL_PRODUCTS_SUCCESS, payload: items })
        return items
    } catch (error) {
        const message = getErrorMessage(error, 'Failed to load products.')
        dispatch({ type: ALL_PRODUCTS_FAIL, payload: message })
        throw new Error(message, { cause: error })
    }
}

// Show the card's data right away, then load the full product
export const getProductDetails = (item) => async (dispatch) => {
    dispatch({ type: PRODUCT_DETAILS_REQUEST, payload: item })

    try {
        const fullItem = await getShopItem(item._id)
        dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: fullItem })
        return fullItem
    } catch (error) {
        const message = getErrorMessage(error, 'Failed to load product details.')
        dispatch({ type: PRODUCT_DETAILS_FAIL, payload: message })
        throw new Error(message, { cause: error })
    }
}

export const closeProductDetails = () => ({ type: PRODUCT_DETAILS_RESET })
