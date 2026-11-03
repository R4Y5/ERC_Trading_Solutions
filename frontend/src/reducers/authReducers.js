import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    UPDATE_AUTH_USER,
    CLEAR_AUTH_ERROR
} from '../constants/authConstants'

const initialState = {
    token: null,
    user: null,
    loading: false,
    error: null
}

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return { ...state, loading: true, error: null }

        case LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                token: action.payload.token,
                user: action.payload.user,
                error: null
            }

        case LOGIN_FAIL:
            return { ...state, loading: false, error: action.payload }

        case UPDATE_AUTH_USER:
            return { ...state, user: action.payload }

        case LOGOUT:
            return { ...initialState }

        case CLEAR_AUTH_ERROR:
            return { ...state, error: null }

        default:
            return state
    }
}
