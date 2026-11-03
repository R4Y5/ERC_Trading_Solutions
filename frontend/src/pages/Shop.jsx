import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import CircularProgress from '@mui/material/CircularProgress'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'

import CustomerNavbar from '../components/CustomerNavbar'
import ShopSearch from '../components/shop/ShopSearch'
import ShopFilters from '../components/shop/ShopFilters'
import ProductGrid from '../components/shop/ProductGrid'
import ProductDetails from '../components/shop/ProductDetails'

import useShop from '../hooks/useShop'

function Shop() {
    const shop = useShop()
    const loadMoreRef = useRef(null)

    const {
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
    } = shop

    // Automatically reveal more products while scrolling
    useEffect(() => {
        if (
            displayMode !== 'infinite' ||
            loading ||
            visibleCount >= filteredItems.length
        ) {
            return
        }

        const target = loadMoreRef.current

        if (!target) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreItems()
                }
            },
            {
                root: null,
                rootMargin: '250px',
                threshold: 0
            }
        )

        observer.observe(target)

        return () => observer.disconnect()
    }, [
        displayMode,
        loading,
        visibleCount,
        filteredItems.length,
        loadMoreItems
    ])

    const displayedItems =
        displayMode === 'pagination'
            ? paginatedItems
            : visibleItems

    return (
        <div>
            <CustomerNavbar />

            <Box component="main" sx={{ py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h1">Shop Products</Typography>
                    <Typography color="text.secondary">
                        Browse our products and find what you need.
                    </Typography>
                </Box>

                {message && (
                    <Alert
                        severity={/fail|error|only|log in|must/i.test(message) ? 'warning' : 'success'}
                        role="status"
                        onClose={() => setMessage('')}
                        sx={{ mb: 2 }}
                    >
                        {message}
                    </Alert>
                )}

                <ShopSearch
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                <ShopFilters
                    categories={categories}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    reviewFilter={reviewFilter}
                    setReviewFilter={setReviewFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onReset={resetFilters}
                />

                <Box component="section" sx={{ mt: 3 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
                    >
                        <Box>
                            <Typography variant="h2" sx={{ mb: 0.25 }}>
                                Available Products
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {loading
                                    ? 'Loading products...'
                                    : `${filteredItems.length} product(s) found`}
                            </Typography>
                        </Box>

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            color="primary"
                            value={displayMode}
                            onChange={(_, value) => value && setDisplayMode(value)}
                            aria-label="Display mode"
                        >
                            <ToggleButton value="pagination" aria-label="Pagination">
                                <ViewModuleOutlinedIcon fontSize="small" sx={{ mr: 0.75 }} />
                                Pagination
                            </ToggleButton>
                            <ToggleButton value="infinite" aria-label="Infinite Scroll">
                                <AllInclusiveIcon fontSize="small" sx={{ mr: 0.75 }} />
                                Infinite Scroll
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    {loading ? (
                        <Grid container spacing={2.5}>
                            {Array.from({ length: 8 }).map((_, index) => (
                                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                    <Skeleton variant="rounded" height={200} />
                                    <Skeleton width="40%" sx={{ mt: 1.5 }} />
                                    <Skeleton width="85%" />
                                    <Skeleton width="55%" />
                                    <Skeleton variant="rounded" height={38} sx={{ mt: 1 }} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <>
                            <ProductGrid
                                items={displayedItems}
                                onOpen={openDetails}
                                onAddToCart={addToCart}
                                addingItemId={addingItemId}
                            />

                            {filteredItems.length > 0 &&
                                displayMode === 'pagination' &&
                                totalPages > 1 && (
                                    <Stack spacing={1} sx={{ alignItems: 'center', my: 4 }}>
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage}
                                            onChange={(_, page) => {
                                                setCurrentPage(page)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                            color="primary"
                                            shape="rounded"
                                            showFirstButton
                                            showLastButton
                                            aria-label="Product pages"
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Page {currentPage} of {totalPages} · {itemsPerPage} per page
                                        </Typography>
                                    </Stack>
                                )}

                            {displayMode === 'infinite' &&
                                visibleCount < filteredItems.length && (
                                    <Stack
                                        ref={loadMoreRef}
                                        direction="row"
                                        spacing={1.5}
                                        aria-live="polite"
                                        sx={{ justifyContent: 'center', alignItems: 'center', my: 4, color: 'text.secondary' }}
                                    >
                                        <CircularProgress size={20} />
                                        <span>Loading more products...</span>
                                    </Stack>
                                )}

                            {displayMode === 'infinite' &&
                                filteredItems.length > 0 &&
                                visibleCount >= filteredItems.length && (
                                    <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>
                                        You've reached the end of the products.
                                    </Typography>
                                )}
                        </>
                    )}
                </Box>
            </Box>

            {selectedItem && (
                <ProductDetails
                    item={selectedItem}
                    loading={detailsLoading}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    onClose={closeDetails}
                    onAddToCart={addToCart}
                    adding={addingItemId === selectedItem._id}
                />
            )}
        </div>
    )
}

export default Shop