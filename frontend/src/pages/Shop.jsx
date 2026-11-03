
import { useEffect, useRef } from 'react'

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
        <div style={styles.page}>
            <CustomerNavbar />

            <main style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Shop Products</h1>
                    <p style={styles.subtitle}>
                        Browse our products and find what you need.
                    </p>
                </header>

                {message && (
                    <div style={styles.message} role="status">
                        <span>{message}</span>

                        <button
                            type="button"
                            onClick={() => setMessage('')}
                            style={styles.dismissButton}
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
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

                <section style={styles.resultsSection}>
                    <div style={styles.toolbar}>
                        <div>
                            <h2 style={styles.resultsTitle}>
                                Available Products
                            </h2>

                            <p style={styles.count}>
                                {loading
                                    ? 'Loading products...'
                                    : `${filteredItems.length} product(s) found`}
                            </p>
                        </div>

                        <div style={styles.modeControl}>
                            <label
                                htmlFor="displayMode"
                                style={styles.modeLabel}
                            >
                                Display:
                            </label>

                            <select
                                id="displayMode"
                                value={displayMode}
                                onChange={(event) =>
                                    setDisplayMode(event.target.value)
                                }
                                style={styles.modeSelect}
                            >
                                <option value="pagination">
                                    Pagination
                                </option>

                                <option value="infinite">
                                    Infinite Scroll
                                </option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p style={styles.statusText}>
                            Loading products...
                        </p>
                    ) : (
                        <>
                            <ProductGrid
                                items={displayedItems}
                                onOpen={openDetails}
                                onAddToCart={addToCart}
                                addingItemId={addingItemId}
                            />

                            {filteredItems.length > 0 &&
                                displayMode === 'pagination' && (
                                    <div
                                        style={styles.pagination}
                                        aria-label="Product pages"
                                    >
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                setCurrentPage((page) =>
                                                    Math.max(1, page - 1)
                                                )
                                            }
                                            style={{
                                                ...styles.pageButton,
                                                ...(currentPage === 1
                                                    ? styles.disabledButton
                                                    : {})
                                            }}
                                        >
                                            Previous
                                        </button>

                                        <span style={styles.pageInfo}>
                                            Page {currentPage} of {totalPages}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                currentPage >= totalPages
                                            }
                                            onClick={() =>
                                                setCurrentPage((page) =>
                                                    Math.min(
                                                        totalPages,
                                                        page + 1
                                                    )
                                                )
                                            }
                                            style={{
                                                ...styles.pageButton,
                                                ...(currentPage >= totalPages
                                                    ? styles.disabledButton
                                                    : {})
                                            }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}

                            {displayMode === 'infinite' &&
                                visibleCount < filteredItems.length && (
                                    <div
                                        ref={loadMoreRef}
                                        style={styles.loadMore}
                                        aria-live="polite"
                                    >
                                        Loading more products...
                                    </div>
                                )}

                            {displayMode === 'infinite' &&
                                filteredItems.length > 0 &&
                                visibleCount >= filteredItems.length && (
                                    <p style={styles.endMessage}>
                                        You've reached the end of the products.
                                    </p>
                                )}
                        </>
                    )}
                </section>
            </main>

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

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#1e293b'
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
    },
    header: {
        marginBottom: '24px'
    },
    title: {
        margin: '0 0 8px',
        fontSize: '32px',
        fontWeight: '700'
    },
    subtitle: {
        margin: 0,
        color: '#64748b'
    },
    message: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        borderRadius: '8px',
        backgroundColor: '#e0f2fe',
        color: '#075985'
    },
    dismissButton: {
        border: 'none',
        background: 'transparent',
        fontSize: '22px',
        cursor: 'pointer',
        color: 'inherit'
    },
    resultsSection: {
        marginTop: '28px'
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px'
    },
    resultsTitle: {
        margin: '0 0 6px',
        fontSize: '22px'
    },
    count: {
        margin: 0,
        color: '#64748b',
        fontSize: '14px'
    },
    modeControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    modeLabel: {
        fontSize: '14px',
        fontWeight: '600'
    },
    modeSelect: {
        padding: '10px 12px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        backgroundColor: '#fff',
        fontSize: '14px',
        cursor: 'pointer'
    },
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        margin: '32px 0'
    },
    pageButton: {
        padding: '10px 18px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        backgroundColor: '#fff',
        color: '#1e293b',
        fontWeight: '600',
        cursor: 'pointer'
    },
    disabledButton: {
        opacity: 0.45,
        cursor: 'not-allowed'
    },
    pageInfo: {
        fontSize: '14px',
        color: '#475569'
    },
    loadMore: {
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        margin: '20px 0'
    },
    endMessage: {
        textAlign: 'center',
        color: '#64748b',
        padding: '24px'
    },
    statusText: {
        textAlign: 'center',
        padding: '32px',
        color: '#64748b'
    }
}

export default Shop
