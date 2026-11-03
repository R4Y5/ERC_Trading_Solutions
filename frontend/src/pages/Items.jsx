import { useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import AdminNavbar from "../components/AdminNavbar";
import ItemForm from "../components/items/ItemForm";
import ItemsTable from "../components/items/ItemsTable";
import useItems from "../hooks/useItems";

function Items() {
  const formRef = useRef(null);

  const {
    message,
    editingItem,
    formData,
    selectedFiles,
    existingImages,
    imagesToRemove,
    loading,
    selectedItemIds,
    setSelectedItemIds,
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

  // Open the form for editing and bring it into view
  const startEditing = (item) => {
    handleEdit(item);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("all");
    setMinRating("0");
    setReviewFilter("all");
  };

  const isError = /fail|error|invalid|required|cannot|please/i.test(message || "");

  return (
    <div>
      <AdminNavbar />

      <Box sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h1">Product Management</Typography>
          <Typography color="text.secondary">
            Add, edit, and remove products. Select several rows to delete them at once.
          </Typography>
        </Box>

        {message && (
          <Alert severity={isError ? "error" : "success"} role="status" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {!viewDeleted && (
          <Card ref={formRef} sx={{ mb: 3, scrollMarginTop: 90 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
            </CardContent>
          </Card>
        )}

        <Card>
          <Tabs
            value={viewDeleted ? 1 : 0}
            onChange={(_, value) =>
              value === 1 ? handleShowDeletedItems() : showActiveItems()
            }
            sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Active Products" />
            <Tab label="Deleted Products" />
          </Tabs>

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Search and filters */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Search products"
                  placeholder="Name or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 1.5 }}>
                <TextField
                  label="Min price"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 1.5 }}>
                <TextField
                  label="Max price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 1.75 }}>
                <TextField
                  select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
                <TextField
                  select
                  label="Rating"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                >
                  <MenuItem value="0">All ratings</MenuItem>
                  <MenuItem value="3">3★ & above</MenuItem>
                  <MenuItem value="4">4★ & above</MenuItem>
                  <MenuItem value="5">5★ only</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 1.75 }}>
                <TextField
                  select
                  label="Reviews"
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                >
                  <MenuItem value="all">All products</MenuItem>
                  <MenuItem value="reviewed">Has reviews</MenuItem>
                  <MenuItem value="10">10+ reviews</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
                <Button
                  size="small"
                  startIcon={<FilterAltOffOutlinedIcon />}
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </Grid>
            </Grid>

            <ItemsTable
              items={filteredItems}
              viewDeleted={viewDeleted}
              selectedItemIds={selectedItemIds}
              onSelectionChange={setSelectedItemIds}
              bulkDeleting={bulkDeleting}
              bulkRestoring={bulkRestoring}
              onBulkDelete={handleBulkDelete}
              onBulkRestore={handleBulkRestore}
              onEdit={startEditing}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

export default Items;
