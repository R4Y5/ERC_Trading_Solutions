
import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react'

import {
    addShopItemToCart,
    getShopItem,
    getShopItems
} from '../services/shopService'

import { getToken } from '../utils/auth'

const getActiveReviews = (item) =>
    (item?.reviews || []).filter(
        (review) => !review.deleted_at
    )

export const getProductRating = (item) => {
    const reviews = getActiveReviews(item)

    if (reviews.length === 0) return 0

    const total = reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
    )

    return total / reviews.length
}

export const getProductReviewCount = (item) =>
    getActiveReviews(item).length

function useShop() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    // Search and filters
    const [searchTerm, setSearchTerm] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [minRating, setMinRating] = useState('0')
    const [reviewFilter, setReviewFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')

    // Display mode
    const [displayMode, setDisplayMode] = useState('pagination')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)
    const [visibleCount, setVisibleCount] = useState(12)

    // Product details and cart
    const [selectedItem, setSelectedItem] = useState(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [addingItemId, setAddingItemId] = useState(null)

    const loadItems = useCallback(async () => {
        try {
            setLoading(true)
            setMessage('')

            const data = await getShopItems()
            setItems(data)
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to load products.'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadItems()
    }, [loadItems])

    // Available product categories
    const categories = useMemo(() => {
        return [
            ...new Set(
                items
                    .map((item) => item.category)
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b))
    }, [items])

    // Apply search, filters, and sorting
    const filteredItems = useMemo(() => {
        let result = [...items]

        const search = searchTerm.trim().toLowerCase()

        if (search) {
            result = result.filter((item) =>
                `${item.item_name || ''} ${item.description || ''} ${item.category || ''}`
                    .toLowerCase()
                    .includes(search)
            )
        }

        if (minPrice !== '') {
            result = result.filter(
                (item) => Number(item.sell_price) >= Number(minPrice)
            )
        }

        if (maxPrice !== '') {
            result = result.filter(
                (item) => Number(item.sell_price) <= Number(maxPrice)
            )
        }

        if (selectedCategory) {
            result = result.filter(
                (item) => item.category === selectedCategory
            )
        }

        if (Number(minRating) > 0) {
            result = result.filter(
                (item) => getProductReviewCount(item) > 0 &&
                    getProductRating(item) >= Number(minRating)
            )
        }

        if (reviewFilter === 'reviewed') {
            result = result.filter(
                (item) => getProductReviewCount(item) > 0
            )
        } else if (reviewFilter === '5') {
            result = result.filter(
                (item) => getProductReviewCount(item) >= 5
            )
        } else if (reviewFilter === '10') {
            result = result.filter(
                (item) => getProductReviewCount(item) >= 10
            )
        }

        switch (sortBy) {
            case 'name':
                result.sort((a, b) =>
                    (a.item_name || '').localeCompare(b.item_name || '')
                )
                break

            case 'price-low':
                result.sort(
                    (a, b) => Number(a.sell_price) - Number(b.sell_price)
                )
                break

            case 'price-high':
                result.sort(
                    (a, b) => Number(b.sell_price) - Number(a.sell_price)
                )
                break

            case 'rating':
                result.sort(
                    (a, b) => getProductRating(b) - getProductRating(a)
                )
                break

            case 'reviews':
                result.sort(
                    (a, b) =>
                        getProductReviewCount(b) -
                        getProductReviewCount(a)
                )
                break

            case 'newest':
            default:
                result.sort(
                    (a, b) =>
                        new Date(b.created_at || 0) -
                        new Date(a.created_at || 0)
                )
                break
        }

        return result
    }, [
        items,
        searchTerm,
        minPrice,
        maxPrice,
        selectedCategory,
        minRating,
        reviewFilter,
        sortBy
    ])

    // Reset the displayed position whenever filters or sorting change
    useEffect(() => {
        setCurrentPage(1)
        setVisibleCount(itemsPerPage)
    }, [
        searchTerm,
        minPrice,
        maxPrice,
        selectedCategory,
        minRating,
        reviewFilter,
        sortBy,
        displayMode,
        itemsPerPage
    ])

    // Products for pagination mode
    const totalPages = Math.max(
        1,
        Math.ceil(filteredItems.length / itemsPerPage)
    )

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage

        return filteredItems.slice(start, start + itemsPerPage)
    }, [filteredItems, currentPage, itemsPerPage])

    // Products revealed so far in infinite-scroll mode
    const visibleItems = useMemo(() => {
        return filteredItems.slice(0, visibleCount)
    }, [filteredItems, visibleCount])

    const loadMoreItems = useCallback(() => {
        setVisibleCount((previous) =>
            Math.min(previous + itemsPerPage, filteredItems.length)
        )
    }, [itemsPerPage, filteredItems.length])

    const openDetails = async (item) => {
        setSelectedItem(item)
        setQuantity(1)
        setDetailsLoading(true)

        try {
            const fullItem = await getShopItem(item._id)
            setSelectedItem(fullItem)
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to load product details.'
            )
        } finally {
            setDetailsLoading(false)
        }
    }

    const closeDetails = () => {
        setSelectedItem(null)
        setQuantity(1)
    }

    const addToCart = async (item, requestedQuantity = quantity) => {
        if (!getToken()) {
            setMessage('Please log in to add products to your cart.')
            return
        }

        const amount = Number(requestedQuantity)
        const stock = Number(item.stock?.quantity ?? 0)

        if (!Number.isInteger(amount) || amount < 1) {
            setMessage('Quantity must be a positive integer.')
            return
        }

        if (amount > stock) {
            setMessage(`Only ${stock} unit(s) are available.`)
            return
        }

        try {
            setAddingItemId(item._id)
            setMessage('')

            const response = await addShopItemToCart(item._id, amount)

            setMessage(
                response.message || 'Product added to cart successfully.'
            )
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to add product to cart.'
            )
        } finally {
            setAddingItemId(null)
        }
    }

    const resetFilters = () => {
        setSearchTerm('')
        setMinPrice('')
        setMaxPrice('')
        setSelectedCategory('')
        setMinRating('0')
        setReviewFilter('all')
        setSortBy('newest')
    }

    return {
        items,
        loading,
        message,
        setMessage,

        searchTerm,
        setSearchTerm,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        selectedCategory,
        setSelectedCategory,
        minRating,
        setMinRating,
        reviewFilter,
        setReviewFilter,
        sortBy,
        setSortBy,
        categories,

        filteredItems,
        displayMode,
        setDisplayMode,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        totalPages,
        paginatedItems,
        visibleItems,
        visibleCount,
        loadMoreItems,

        selectedItem,
        detailsLoading,
        quantity,
        setQuantity,
        addingItemId,
        openDetails,
        closeDetails,
        addToCart,
        resetFilters
    }
}

export default useShop
