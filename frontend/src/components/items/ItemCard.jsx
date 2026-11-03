
function ItemCard({
  item,
  viewDeleted,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
  onRestore,
}) {
  const images = (item.images || []).filter(
    (image) => !image.deleted_at && image.image_path
  );

  return (
    <article
      style={{
        padding: "20px",
        backgroundColor: "#ffffff",
        border: isSelected
          ? "2px solid #2563eb"
          : "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        minWidth: 0,
      }}
    >
      {/* Product name and selection */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(item._id)}
          />

          <strong>{item.item_name}</strong>
        </label>

        <span
          style={{
            padding: "5px 9px",
            borderRadius: "20px",
            fontSize: "12px",
            backgroundColor: viewDeleted ? "#fee2e2" : "#dcfce7",
            color: viewDeleted ? "#991b1b" : "#166534",
          }}
        >
          {viewDeleted ? "Deleted" : "Active"}
        </span>
      </div>

      {/* Product images */}
      {images.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {images.map((image, index) => (
            <img
              key={image._id || image.image_path}
              src={image.image_path}
              alt={`${item.item_name} ${index + 1}`}
              loading="lazy"
              style={{
                width: "100%",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ))}
        </div>
      ) : (
        <p style={{ color: "#9ca3af" }}>No product images</p>
      )}

      {/* Product details */}
      <div style={{ lineHeight: 1.8 }}>
        <p>
          <strong>Cost Price:</strong> {item.cost_price ?? "—"}
        </p>

        <p>
          <strong>Selling Price:</strong> {item.sell_price ?? "—"}
        </p>

        <p>
          <strong>Stock:</strong> {item.stock?.quantity ?? 0}
        </p>

        <p>
          <strong>Category:</strong> {item.category || "Uncategorized"}
        </p>

        <p>
          <strong>Description:</strong>{" "}
          {item.description || "No description provided."}
        </p>

        {viewDeleted && item.deleted_at && (
          <p style={{ color: "#6b7280", fontSize: "13px" }}>
            Deleted on {new Date(item.deleted_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* Product actions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {viewDeleted ? (
          <button
            type="button"
            onClick={() => onRestore(item._id)}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#15803d",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Restore
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(item)}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(item._id)}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default ItemCard;
