import {
  getProductRating,
  getProductReviewCount,
} from "../../hooks/useShop";

function ProductCard({ item, onOpen, onAddToCart, adding }) {
  const image = (item.images || []).find(
    (entry) => !entry.deleted_at && entry.image_path
  );

  const stock = Number(item.stock?.quantity) || 0;
  const rating = getProductRating(item);
  const reviewCount = getProductReviewCount(item);

  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        aria-label={`View details for ${item.item_name}`}
        style={{
          border: 0,
          padding: 0,
          background: "#f3f4f6",
          cursor: "pointer",
        }}
      >
        {image ? (
          <img
            src={image.image_path}
            alt={item.item_name}
            loading="lazy"
            style={{
              display: "block",
              width: "100%",
              height: 210,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              height: 210,
              display: "grid",
              placeItems: "center",
              color: "#6b7280",
            }}
          >
            No image available
          </div>
        )}
      </button>

      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 10,
        }}
      >
        <span style={{ color: "#6b7280", fontSize: 13 }}>
          {item.category}
        </span>

        <button
          type="button"
          onClick={() => onOpen(item)}
          style={{
            textAlign: "left",
            fontSize: 17,
            fontWeight: 700,
            border: 0,
            background: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          {item.item_name}
        </button>

        <strong style={{ fontSize: 20, color: "#166534" }}>
          ₱{Number(item.sell_price || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong>

        <p style={{ margin: 0, color: "#4b5563", fontSize: 14 }}>
          {rating > 0 ? `★ ${rating.toFixed(1)} / 5` : "No rating yet"}
          {" · "}
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </p>

        <p style={{ margin: 0, fontSize: 14 }}>
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </p>

        <button
          type="button"
          onClick={() => onAddToCart(item, 1)}
          disabled={stock <= 0 || adding}
          style={{
            marginTop: "auto",
            padding: 12,
            border: 0,
            borderRadius: 8,
            backgroundColor: stock > 0 ? "#166534" : "#9ca3af",
            color: "#fff",
            cursor: stock > 0 ? "pointer" : "not-allowed",
          }}
        >
          {adding ? "Adding..." : stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;