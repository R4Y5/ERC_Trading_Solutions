
import ItemCard from "./ItemCard";

function ItemList({
  items,
  viewDeleted,
  selectedItemIds,
  bulkDeleting,
  bulkRestoring,
  onToggleSelection,
  onToggleSelectAll,
  onBulkDelete,
  onBulkRestore,
  onEdit,
  onDelete,
  onRestore,
}) {
  const allItemsSelected =
    items.length > 0 &&
    items.every((item) => selectedItemIds.includes(item._id));

  return (
    <section>
      <h2>
        {viewDeleted ? "Deleted Products" : "Active Products"}
      </h2>

      {items.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              checked={allItemsSelected}
              onChange={onToggleSelectAll}
              aria-label="Select all products"
            />
            Select All Products
          </label>

          {viewDeleted ? (
            <button
              type="button"
              onClick={onBulkRestore}
              disabled={
                selectedItemIds.length === 0 || bulkRestoring
              }
            >
              {bulkRestoring
                ? "Restoring..."
                : `Restore Selected (${selectedItemIds.length})`}
            </button>
          ) : (
            <button
              type="button"
              onClick={onBulkDelete}
              disabled={
                selectedItemIds.length === 0 || bulkDeleting
              }
            >
              {bulkDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedItemIds.length})`}
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p>
          {viewDeleted
            ? "No deleted products found."
            : "No active products found."}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              viewDeleted={viewDeleted}
              isSelected={selectedItemIds.includes(item._id)}
              onToggleSelection={onToggleSelection}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ItemList;
