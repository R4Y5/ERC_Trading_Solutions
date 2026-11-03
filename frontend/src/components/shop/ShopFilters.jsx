import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";

// Price, category, rating, and review filters for the shop (MP2)
function ShopFilters({
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
  sortBy,
  setSortBy,
  onReset,
}) {
  const peso = {
    input: {
      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
    },
    htmlInput: { min: 0 },
  };

  return (
    <Card>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField
              label="Min price"
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
              slotProps={peso}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField
              label="Max price"
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Any"
              slotProps={peso}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField
              select
              label="Category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                select: { displayEmpty: true },
              }}
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField
              select
              label="Minimum rating"
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
            >
              <MenuItem value="0">Any rating</MenuItem>
              <MenuItem value="1">1★ & up</MenuItem>
              <MenuItem value="2">2★ & up</MenuItem>
              <MenuItem value="3">3★ & up</MenuItem>
              <MenuItem value="4">4★ & up</MenuItem>
              <MenuItem value="5">5★ only</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField
              select
              label="Customer reviews"
              value={reviewFilter}
              onChange={(event) => setReviewFilter(event.target.value)}
            >
              <MenuItem value="all">All products</MenuItem>
              <MenuItem value="reviewed">Has reviews</MenuItem>
              <MenuItem value="5">5+ reviews</MenuItem>
              <MenuItem value="10">10+ reviews</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 1.8 }}>
            <TextField
              select
              label="Sort by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="name">Name A–Z</MenuItem>
              <MenuItem value="price-low">Price: low to high</MenuItem>
              <MenuItem value="price-high">Price: high to low</MenuItem>
              <MenuItem value="rating">Highest rating</MenuItem>
              <MenuItem value="reviews">Most reviews</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 1.4 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterAltOffOutlinedIcon />}
              onClick={onReset}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ShopFilters;
