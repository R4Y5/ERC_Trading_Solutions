import ProductCard from "./ProductCard";

function ProductGrid({ items, onOpen, onAddToCart, addingItemId }) {
  if (items.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 16px",
          color: "#6b7280",
        }}
      >
        <h3>No products found</h3>
        <p>Try changing your search or filters.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))",
        gap: 20,
        alignItems: "stretch",
      }}
    >
      {items.map((item) => (
        <ProductCard
          key={item._id}
          item={item}
          onOpen={onOpen}
          onAddToCart={onAddToCart}
          adding={addingItemId === item._id}
        />
      ))}
    </div>
  );
}

export default ProductGrid;