function ShopSearch({ searchTerm, onSearchChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor="shop-search">Search products</label>
      <input
        id="shop-search"
        type="search"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by product, description, or category..."
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          padding: 12,
          marginTop: 6,
          border: "1px solid #d1d5db",
          borderRadius: 8,
        }}
      />
    </div>
  );
}

export default ShopSearch;