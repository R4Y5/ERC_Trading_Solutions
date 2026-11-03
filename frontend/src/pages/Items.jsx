import AdminNavbar from "../components/AdminNavbar";
import ItemForm from "../components/items/ItemForm";
import ItemList from "../components/items/ItemList";
import useItems from "../hooks/useItems";

function Items() {
  const {
    items,
    message,
    editingItem,
    formData,
    selectedFiles,
    existingImages,
    imagesToRemove,
    loading,
    selectedItemIds,
    bulkDeleting,
    bulkRestoring,
    viewDeleted,

    handleShowDeletedItems,
    showActiveItems,
    handleChange,
    handleFileChange,
    removeSelectedFile,
    toggleExistingImageRemoval,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    toggleItemSelection,
    toggleSelectAll,
    handleBulkDelete,
    handleRestore,
    handleBulkRestore,

    searchTerm,
    setSearchTerm,
    filteredItems,
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
  } = useItems();

  return (
    <div>
      <AdminNavbar />

      <h1>Product Management</h1>

      {!viewDeleted && (
        <ItemForm
          editingItem={editingItem}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          loading={loading}
          selectedFiles={selectedFiles}
          onFileChange={handleFileChange}
          onRemoveSelectedFile={removeSelectedFile}
          existingImages={existingImages}
          imagesToRemove={imagesToRemove}
          onToggleExistingImageRemoval={toggleExistingImageRemoval}
        />
      )}

      {message && <p role="status">{message}</p>}

      <hr />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <button type="button" onClick={showActiveItems} disabled={!viewDeleted}>
          Active Products
        </button>

        <button
          type="button"
          onClick={handleShowDeletedItems}
          disabled={viewDeleted}
        >
          Deleted Products
        </button>
      </div>

      <div className="item-search">
        <label htmlFor="item-search">Search Items</label>

        <input
          id="item-search"
          type="search"
          placeholder="Search by item name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-section">
        <h3>Filter Products</h3>

        {/* Price filter */}
        <div>
          <label>Minimum Price</label>
          <input
            type="number"
            min="0"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <label>Maximum Price</label>
          <input
            type="number"
            min="0"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div>
          <label>Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Ratings filter */}
        <div>
          <label>Minimum Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="0">All Ratings</option>
            <option value="3">3 Stars & Above</option>
            <option value="4">4 Stars & Above</option>
            <option value="5">5 Stars Only</option>
          </select>
        </div>

        {/* Review filter */}
        <div>
          <label>Reviews</label>
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="reviewed">Has Reviews</option>
            <option value="10">10 or More Reviews</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setMinPrice("");
            setMaxPrice("");
            setSelectedCategory("all");
            setMinRating("0");
            setReviewFilter("all");
          }}
        >
          Clear Filters
        </button>
      </div>

      <ItemList
        items={filteredItems}
        viewDeleted={viewDeleted}
        selectedItemIds={selectedItemIds}
        bulkDeleting={bulkDeleting}
        bulkRestoring={bulkRestoring}
        onToggleSelection={toggleItemSelection}
        onToggleSelectAll={toggleSelectAll}
        onBulkDelete={handleBulkDelete}
        onBulkRestore={handleBulkRestore}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />
    </div>
  );
}

export default Items;
