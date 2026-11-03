import {
    legacy_createStore as createStore,
    combineReducers,
    applyMiddleware
} from 'redux'
import { thunk } from 'redux-thunk'

import { authReducer } from './reducers/authReducers'
import { productsReducer, productDetailsReducer } from './reducers/productReducers'
import { cartReducer } from './reducers/cartReducers'

const readStoredUser = () => {
    try {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    } catch {
        return null
    }
}

const reducer = combineReducers({
    auth: authReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer
})

// Restore the logged-in session after a page refresh
const initialState = {
    auth: {
        token: localStorage.getItem('token'),
        user: readStoredUser(),
        loading: false,
        error: null
    }
}

const middleware = [thunk]

const store = createStore(
    reducer,
    initialState,
    applyMiddleware(...middleware)
)

export default store
