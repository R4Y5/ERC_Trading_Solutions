import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

function ShopSearch({ searchTerm, onSearchChange }) {
  return (
    <TextField
      id="shop-search"
      type="search"
      label="Search products"
      placeholder="Search by product, description, or category..."
      value={searchTerm}
      onChange={(event) => onSearchChange(event.target.value)}
      size="medium"
      sx={{ mb: 2, bgcolor: "background.paper" }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
}

export default ShopSearch;
