function ShopFilters({
  categories,
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
  onReset,
}) {
  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: 10,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  };

  return (
    <section
      aria-label="Product filters"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 14,
        padding: 16,
        marginBottom: 24,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        backgroundColor: "#f9fafb",
      }}
    >
      <label style={fieldStyle}>
        Minimum price (₱)
        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          placeholder="No minimum"
          style={inputStyle}
        />
      </label>

      <label style={fieldStyle}>
        Maximum price (₱)
        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder="No maximum"
          style={inputStyle}
        />
      </label>

      <label style={fieldStyle}>
        Category
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          style={inputStyle}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label style={fieldStyle}>
        Minimum rating
        <select
          value={minRating}
          onChange={(event) => setMinRating(event.target.value)}
          style={inputStyle}
        >
          <option value="0">Any rating</option>
          <option value="1">1 star and up</option>
          <option value="2">2 stars and up</option>
          <option value="3">3 stars and up</option>
          <option value="4">4 stars and up</option>
          <option value="5">5 stars only</option>
        </select>
      </label>

      <label style={fieldStyle}>
        Customer reviews
        <select
          value={reviewFilter}
          onChange={(event) => setReviewFilter(event.target.value)}
          style={inputStyle}
        >
          <option value="all">All products</option>
          <option value="reviewed">Has reviews</option>
          <option value="5">At least 5 reviews</option>
          <option value="10">At least 10 reviews</option>
        </select>
      </label>

      <label style={fieldStyle}>
        Sort by
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          style={inputStyle}
        >
          <option value="newest">Newest</option>
          <option value="name">Product name</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="rating">Highest rating</option>
          <option value="reviews">Most reviews</option>
        </select>
      </label>

      <div style={{ display: "flex", alignItems: "end" }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}

export default ShopFilters;