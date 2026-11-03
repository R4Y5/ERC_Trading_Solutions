import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ProductCard from "./ProductCard";

function ProductGrid({ items, onOpen, onAddToCart, addingItemId }) {
  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
        <SearchOffIcon sx={{ fontSize: 48, mb: 1, color: "grey.400" }} />
        <Typography variant="h3">No products found</Typography>
        <Typography>Try changing your search or filters.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {items.map((item) => (
        <Grid key={item._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ProductCard
            item={item}
            onOpen={onOpen}
            onAddToCart={onAddToCart}
            adding={addingItemId === item._id}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default ProductGrid;
