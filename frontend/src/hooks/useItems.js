import { useEffect, useMemo, useState } from "react";

import {
  getItems,
  getDeletedItems,
  createItem,
  updateItem,
  deleteItem,
  bulkDeleteItems,
  restoreItem,
  bulkRestoreItems,
} from "../services/itemService";

const emptyForm = {
  item_name: "",
  description: "",
  cost_price: "",
  sell_price: "",
  category: "",
  quantity: "",
};

function useItems() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkRestoring, setBulkRestoring] = useState(false);

  const [viewDeleted, setViewDeleted] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minRating, setMinRating] = useState("0");
  const [reviewFilter, setReviewFilter] = useState("all");

  // Fetch active products.
  const getActiveProducts = async () => {
    try {
      const data = await getItems();
      const fetchedItems = data.items || [];

      setItems(fetchedItems);

      setSelectedItemIds((previous) =>
        previous.filter((id) =>
          fetchedItems.some((item) => item._id === id)
        )
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to get products"
      );
    }
  };

  // Load active products when the hook is first used.
  useEffect(() => {
    getActiveProducts();
  }, []);

  // Fetch deleted products.
  const handleShowDeletedItems = async () => {
    try {
      const data = await getDeletedItems();

      setItems(data.items || []);
      setSelectedItemIds([]);
      setViewDeleted(true);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to fetch deleted products"
      );
    }
  };

  // Switch back to active products.
  const showActiveItems = async () => {
    setViewDeleted(false);
    setSelectedItemIds([]);
    setMessage("");

    await getActiveProducts();
  };

  // Reset the form.
  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingItem(null);
    setSelectedFiles([]);
    setExistingImages([]);
    setImagesToRemove([]);

    const fileInput = document.getElementById("item-images");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Handle changes from existing controlled inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Validate and select new images.
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setMessage(
        "Choose image files only. Each image must be 5 MB or smaller."
      );
    } else {
      setMessage("");
    }

    if (selectedFiles.length + validFiles.length > 10) {
      setMessage("You can select up to 10 new images at a time.");
      event.target.value = "";
      return;
    }

    setSelectedFiles((previous) => [
      ...previous,
      ...validFiles,
    ]);

    event.target.value = "";
  };

  // Remove a newly selected image.
  const removeSelectedFile = (indexToRemove) => {
    setSelectedFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  };

  // Mark or unmark an existing image for removal.
  const toggleExistingImageRemoval = (imageId) => {
    setImagesToRemove((previous) =>
      previous.includes(imageId)
        ? previous.filter((id) => id !== imageId)
        : [...previous, imageId]
    );
  };

  // Create or update a product using Formik's validated values.
  const handleSubmit = async (values) => {
    setLoading(true);
    setMessage("");

    try {
      // Formik passes validated values directly.
      // Fall back to formData if this function is called without values.
      const submittedValues =
        values &&
        typeof values === "object" &&
        !("preventDefault" in values)
          ? values
          : formData;

      const itemName = String(
        submittedValues.item_name ?? ""
      ).trim();

      const description = String(
        submittedValues.description ?? ""
      ).trim();

      const costPrice = Number(submittedValues.cost_price);
      const sellPrice = Number(submittedValues.sell_price);
      const category = String(
        submittedValues.category ?? ""
      ).trim();
      const quantity = Number(submittedValues.quantity);

      // Extra safety checks before sending the request.
      // Yup handles the user-facing validation in ItemForm.jsx.
      if (
        !itemName ||
        itemName.length > 100 ||
        !description ||
        !category
      ) {
        setMessage(
          "Please provide a valid product name, description, and category."
        );
        return;
      }

      if (
        submittedValues.cost_price === "" ||
        !Number.isFinite(costPrice) ||
        costPrice < 0 ||
        Math.round(costPrice * 100) !==
          Math.round(costPrice * 1000000) / 10000
      ) {
        // The Yup schema remains the primary source for decimal
        // validation; this check ensures a finite nonnegative price.
        if (
          submittedValues.cost_price === "" ||
          !Number.isFinite(costPrice) ||
          costPrice < 0
        ) {
          setMessage("Please enter a valid cost price.");
          return;
        }
      }

      if (
        submittedValues.sell_price === "" ||
        !Number.isFinite(sellPrice) ||
        sellPrice < 0
      ) {
        setMessage("Please enter a valid selling price.");
        return;
      }

      if (
        submittedValues.quantity === "" ||
        !Number.isInteger(quantity) ||
        quantity < 0
      ) {
        setMessage(
          "Stock quantity must be a nonnegative whole number."
        );
        return;
      }

      
      // Check whether anything actually changed when editing.
      if (editingItem) {
        const originalValues = {
          item_name: editingItem.item_name || "",
          description: editingItem.description || "",
          cost_price: editingItem.cost_price ?? "",
          sell_price: editingItem.sell_price ?? "",
          category: editingItem.category || "",
          quantity: editingItem.stock?.quantity ?? 0,
        };

        const hasFieldChanges =
          String(submittedValues.item_name ?? "").trim() !==
            String(originalValues.item_name).trim() ||
          String(submittedValues.description ?? "").trim() !==
            String(originalValues.description).trim() ||
          Number(submittedValues.cost_price) !==
            Number(originalValues.cost_price) ||
          Number(submittedValues.sell_price) !==
            Number(originalValues.sell_price) ||
          String(submittedValues.category ?? "").trim() !==
            String(originalValues.category).trim() ||
          Number(submittedValues.quantity) !==
            Number(originalValues.quantity);

        const hasImageChanges =
          selectedFiles.length > 0 || imagesToRemove.length > 0;

        if (!hasFieldChanges && !hasImageChanges) {
          setMessage(
            "No changes detected. Please update at least one field or image."
          );
          return;
        }
      }


      const data = new FormData();

      data.append("item_name", itemName);
      data.append("description", description);
      data.append("cost_price", String(costPrice));
      data.append("sell_price", String(sellPrice));
      data.append("category", category);
      data.append("quantity", String(quantity));

      selectedFiles.forEach((file) => {
        data.append("images", file);
      });

      let response;

      if (editingItem) {
        if (imagesToRemove.length > 0) {
          data.append(
            "remove_image_ids",
            JSON.stringify(imagesToRemove)
          );
        }

        response = await updateItem(editingItem._id, data);

        setMessage(
          response.message || "Product updated successfully"
        );
      } else {
        response = await createItem(data);

        setMessage(
          response.message || "Product created successfully"
        );
      }

      resetForm();
      setViewDeleted(false);
      setSelectedItemIds([]);

      await getActiveProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  // Populate the form for editing.
  const handleEdit = (item) => {
    if (viewDeleted) return;

    setEditingItem(item);

    setFormData({
      item_name: item.item_name || "",
      description: item.description || "",
      cost_price: item.cost_price ?? "",
      sell_price: item.sell_price ?? "",
      category: item.category || "",
      quantity: item.stock?.quantity ?? 0,
    });

    setExistingImages(
      (item.images || []).filter(
        (image) => !image.deleted_at
      )
    );

    setImagesToRemove([]);
    setSelectedFiles([]);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing.
  const handleCancelEdit = () => {
    resetForm();
    setMessage("");
  };

  // Soft-delete one product.
  const handleDelete = async (id) => {
    if (viewDeleted) return;

    const confirmed = window.confirm(
      "Are you sure you want to move this product to Deleted Products?"
    );

    if (!confirmed) return;

    try {
      const response = await deleteItem(id);

      setSelectedItemIds((previous) =>
        previous.filter((selectedId) => selectedId !== id)
      );

      if (editingItem?._id === id) {
        resetForm();
      }

      setMessage(
        response.message || "Product moved to Deleted Products"
      );

      await getActiveProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  };

  // Select or deselect one product.
  const toggleItemSelection = (itemId) => {
    setSelectedItemIds((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId]
    );
  };

  // Select or deselect all visible products.
  const toggleSelectAll = () => {
    const allItemsSelected =
      items.length > 0 &&
      items.every((item) =>
        selectedItemIds.includes(item._id)
      );

    if (allItemsSelected) {
      setSelectedItemIds((previous) =>
        previous.filter(
          (id) => !items.some((item) => item._id === id)
        )
      );
    } else {
      setSelectedItemIds((previous) => [
        ...new Set([
          ...previous,
          ...items.map((item) => item._id),
        ]),
      ]);
    }
  };

  // Soft-delete selected products.
  const handleBulkDelete = async () => {
    if (viewDeleted) return;

    if (selectedItemIds.length === 0) {
      setMessage("Please select at least one product.");
      return;
    }

    const confirmed = window.confirm(
      `Move ${selectedItemIds.length} selected product(s) to Deleted Products?`
    );

    if (!confirmed) return;

    setBulkDeleting(true);
    setMessage("");

    try {
      const response = await bulkDeleteItems(selectedItemIds);

      const deletedIds = new Set(selectedItemIds);

      if (
        editingItem &&
        deletedIds.has(editingItem._id)
      ) {
        resetForm();
      }

      setSelectedItemIds([]);

      setMessage(
        response.message ||
          "Selected products moved to Deleted Products"
      );

      await getActiveProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to delete selected products"
      );
    } finally {
      setBulkDeleting(false);
    }
  };

  // Restore one deleted product.
  const handleRestore = async (id) => {
    try {
      const response = await restoreItem(id);

      if (viewDeleted) {
        await handleShowDeletedItems();
      } else {
        await getActiveProducts();
      }

      setMessage(
        response.message || "Product restored successfully"
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to restore product"
      );
    }
  };

  // Restore selected deleted products.
  const handleBulkRestore = async () => {
    if (!viewDeleted) return;

    if (selectedItemIds.length === 0) {
      setMessage(
        "Please select at least one deleted product."
      );
      return;
    }

    const confirmed = window.confirm(
      `Restore ${selectedItemIds.length} selected product(s)?`
    );

    if (!confirmed) return;

    setBulkRestoring(true);
    setMessage("");

    try {
      const response = await bulkRestoreItems(
        selectedItemIds
      );

      setSelectedItemIds([]);

      await handleShowDeletedItems();

      setMessage(
        response.message ||
          "Selected products restored successfully"
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to restore selected products"
      );
    } finally {
      setBulkRestoring(false);
    }
  };

  // Get the available product categories.
  const categories = useMemo(() => {
    return [
      ...new Set(
        items.map((item) => item.category).filter(Boolean)
      ),
    ];
  }, [items]);

  // Apply all product filters.
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        (item.item_name || "")
          .toLowerCase()
          .includes(search) ||
        (item.description || "")
          .toLowerCase()
          .includes(search);

      if (!matchesSearch) return false;

      const price = Number(item.sell_price) || 0;

      const activeReviews = (item.reviews || []).filter(
        (review) => !review.deleted_at
      );

      const averageRating =
        activeReviews.length > 0
          ? activeReviews.reduce(
              (total, review) =>
                total + Number(review.rating),
              0
            ) / activeReviews.length
          : 0;

      if (minPrice !== "" && price < Number(minPrice)) {
        return false;
      }

      if (maxPrice !== "" && price > Number(maxPrice)) {
        return false;
      }

      if (
        selectedCategory !== "all" &&
        item.category !== selectedCategory
      ) {
        return false;
      }

      if (
        Number(minRating) > 0 &&
        averageRating < Number(minRating)
      ) {
        return false;
      }

      if (
        reviewFilter === "reviewed" &&
        activeReviews.length === 0
      ) {
        return false;
      }

      if (
        reviewFilter === "10" &&
        activeReviews.length < 10
      ) {
        return false;
      }

      return true;
    });
  }, [
    items,
    searchTerm,
    minPrice,
    maxPrice,
    selectedCategory,
    minRating,
    reviewFilter,
  ]);

  return {
    items,
    message,
    setMessage,
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
  };
}

export default useItems;
