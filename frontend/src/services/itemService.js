
import api from "./api";

// Fetch active products.
export const getItems = async () => {
  const response = await api.get("/items");
  return response.data;
};

// Fetch soft-deleted products.
export const getDeletedItems = async () => {
  const response = await api.get("/items/deleted");
  return response.data;
};

// Create a product.
export const createItem = async (data) => {
  const response = await api.post("/items", data);
  return response.data;
};

// Update a product.
export const updateItem = async (id, data) => {
  const response = await api.put(`/items/${id}`, data);
  return response.data;
};

// Soft-delete one product.
export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

// Soft-delete multiple products.
export const bulkDeleteItems = async (ids) => {
  const response = await api.delete("/items/bulk", {
    data: { ids },
  });
  return response.data;
};

// Restore one deleted product.
export const restoreItem = async (id) => {
  const response = await api.patch(`/items/${id}/restore`);
  return response.data;
};

// Restore multiple deleted products.
export const bulkRestoreItems = async (ids) => {
  const response = await api.patch("/items/bulk/restore", {
    ids,
  });
  return response.data;
};
