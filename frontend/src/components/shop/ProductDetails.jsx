import { getProductRating, getProductReviewCount } from "../../hooks/useShop";

function ProductDetails({
  item,
  loading,
  quantity,
  setQuantity,
  onClose,
  onAddToCart,
  adding,
}) {
  if (!item) return null;

  const activeImages = (item.images || []).filter(
    (image) => !image.deleted_at && image.image_path,
  );

  const reviews = (item.reviews || []).filter((review) => !review.deleted_at);

  const stock = Number(item.stock?.quantity) || 0;
  const rating = getProductRating(item);
  const reviewCount = getProductReviewCount(item);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 850,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h2 id="product-details-title">Product Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p>Loading product details...</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: 24,
              }}
            >
              <div>
                {activeImages.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(100px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {activeImages.map((image, index) => (
                      <img
                        key={image._id || image.image_path}
                        src={image.image_path}
                        alt={`${item.item_name} image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p>No product images available.</p>
                )}
              </div>

              <div>
                <p style={{ color: "#6b7280" }}>{item.category}</p>
                <h3>{item.item_name}</h3>

                <p style={{ fontSize: 24, fontWeight: 700, color: "#166534" }}>
                  ₱
                  {Number(item.sell_price || 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>

                <p>
                  {rating > 0 ? `★ ${rating.toFixed(1)} / 5` : "No rating yet"}
                  {" · "}
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </p>

                <p>
                  <strong>Stock:</strong>{" "}
                  {stock > 0 ? `${stock} available` : "Out of stock"}
                </p>

                <p>
                  <strong>Description</strong>
                </p>
                <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {item.description || "No description provided."}
                </p>

                <label
                  htmlFor="product-quantity"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  Quantity
                </label>

                <input
                  id="product-quantity"
                  type="number"
                  min="1"
                  max={stock}
                  value={quantity}
                  disabled={stock <= 0}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setQuantity(
                      Number.isFinite(value) && value >= 1
                        ? Math.min(Math.floor(value), stock)
                        : 1,
                    );
                  }}
                  style={{
                    width: 100,
                    padding: 10,
                    boxSizing: "border-box",
                    marginRight: 10,
                  }}
                />

                <button
                  type="button"
                  disabled={stock <= 0 || adding || quantity < 1}
                  onClick={() => onAddToCart(item, quantity)}
                  style={{
                    padding: 12,
                    backgroundColor: stock > 0 ? "#166534" : "#9ca3af",
                    color: "#fff",
                    border: 0,
                    borderRadius: 8,
                    cursor: stock > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  {adding ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>

            <hr style={{ margin: "28px 0" }} />

            <section>
              <h3>Customer Reviews ({reviewCount})</h3>

              {reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review this product!</p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {reviews.map((review) => (
                    <article
                      key={review._id}
                      style={{
                        padding: 14,
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                      }}
                    >
                      <p style={{ marginTop: 0 }}>
                        <strong>
                          {review.customer?.fname
                            ? `${review.customer.fname} ${review.customer.lname || ""}`
                            : "Customer"}
                        </strong>
                        {" · "}
                        {"★".repeat(
                          Math.max(0, Math.min(5, Number(review.rating) || 0)),
                        )}
                        {"☆".repeat(
                          5 -
                            Math.max(
                              0,
                              Math.min(5, Number(review.rating) || 0),
                            ),
                        )}
                      </p>

                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {review.review_text}
                      </p>

                      {review.admin_reply?.trim() && (
                        <div
                          style={{
                            marginTop: 12,
                            marginBottom: 12,
                            marginLeft: 12,
                            padding: 12,
                            backgroundColor: "#f0fdf4",
                            borderLeft: "4px solid #166534",
                            borderRadius: 6,
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 6px",
                              fontWeight: 700,
                              color: "#166534",
                            }}
                          >
                            Admin Reply
                          </p>

                          <p
                            style={{
                              margin: 0,
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {review.admin_reply}
                          </p>
                        </div>
                      )}

                      {review.images
                        ?.filter(
                          (image) => !image.deleted_at && image.image_path,
                        )
                        .map((image, index) => (
                          <img
                            key={image._id || image.image_path}
                            src={image.image_path}
                            alt={`Review image ${index + 1}`}
                            loading="lazy"
                            style={{
                              width: 90,
                              height: 90,
                              objectFit: "cover",
                              borderRadius: 6,
                              marginRight: 8,
                            }}
                          />
                        ))}

                      {review.created_at && (
                        <small style={{ color: "#6b7280" }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </small>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </div>
  );
}

export default ProductDetails;
