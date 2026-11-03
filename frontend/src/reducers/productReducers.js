import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_DETAILS_RESET
} from '../constants/productConstants'

export const productsReducer = (
    state = { items: [], loading: true, loaded: false, error: null },
    action
) => {
    switch (action.type) {
        case ALL_PRODUCTS_REQUEST:
            return { ...state, loading: true, error: null }

        case ALL_PRODUCTS_SUCCESS:
            return { items: action.payload, loading: false, loaded: true, error: null }

        case ALL_PRODUCTS_FAIL:
            return { ...state, loading: false, error: action.payload }

        default:
            return state
    }
}

export const productDetailsReducer = (
    state = { item: null, loading: false, error: null },
    action
) => {
    switch (action.type) {
        case PRODUCT_DETAILS_REQUEST:
            // payload is the product card's data, shown while full details load
            return { item: action.payload || null, loading: true, error: null }

        case PRODUCT_DETAILS_SUCCESS:
            return { item: action.payload, loading: false, error: null }

        case PRODUCT_DETAILS_FAIL:
            return { ...state, loading: false, error: action.payload }

        case PRODUCT_DETAILS_RESET:
            return { item: null, loading: false, error: null }

        default:
            return state
    }
}
