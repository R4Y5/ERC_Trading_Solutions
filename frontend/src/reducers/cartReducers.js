import {
    CART_REQUEST,
    CART_SUCCESS,
    CART_FAIL,
    CART_UPDATED,
    CART_RESET
} from '../constants/cartConstants'

const initialState = {
    cart: null,
    loading: true,
    loaded: false,
    error: null
}

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case CART_REQUEST:
            return { ...state, loading: true, error: null }

        case CART_SUCCESS:
        case CART_UPDATED:
            return {
                cart: action.payload,
                loading: false,
                loaded: true,
                error: null
            }

        case CART_FAIL:
            return { ...state, loading: false, error: action.payload }

        case CART_RESET:
            return { ...initialState }

        default:
            return state
    }
}
