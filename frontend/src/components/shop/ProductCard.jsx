import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import {
  getProductRating,
  getProductReviewCount,
} from "../../hooks/useShop";

const peso = (value) =>
  "₱" +
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function ProductCard({ item, onOpen, onAddToCart, adding }) {
  const image = (item.images || []).find(
    (entry) => !entry.deleted_at && entry.image_path
  );
  const stock = Number(item.stock?.quantity) || 0;
  const rating = getProductRating(item);
  const reviewCount = getProductReviewCount(item);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(16,24,40,0.10)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea
        onClick={() => onOpen(item)}
        aria-label={`View details for ${item.item_name}`}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box sx={{ position: "relative" }}>
          {image ? (
            <CardMedia
              component="img"
              image={image.image_path}
              alt={item.item_name}
              loading="lazy"
              sx={{ height: 200, objectFit: "cover", bgcolor: "grey.100" }}
            />
          ) : (
            <Box
              sx={{
                height: 200,
                display: "grid",
                placeItems: "center",
                bgcolor: "grey.100",
                color: "grey.500",
              }}
            >
              <Stack sx={{ alignItems: "center" }} spacing={0.5}>
                <ImageNotSupportedOutlinedIcon />
                <Typography variant="body2">No image</Typography>
              </Stack>
            </Box>
          )}

          {stock === 0 && (
            <Chip
              label="Out of stock"
              color="error"
              size="small"
              sx={{ position: "absolute", top: 10, left: 10 }}
            />
          )}
          {stock > 0 && stock < 10 && (
            <Chip
              label={`Only ${stock} left`}
              color="warning"
              size="small"
              sx={{ position: "absolute", top: 10, left: 10 }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, width: "100%" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}
          >
            {item.category}
          </Typography>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.3,
              mt: 0.5,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em",
            }}
          >
            {item.item_name}
          </Typography>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 1 }}>
            <Rating value={rating} precision={0.5} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              {reviewCount > 0
                ? `${rating.toFixed(1)} (${reviewCount})`
                : "No reviews yet"}
            </Typography>
          </Stack>

          <Typography sx={{ fontWeight: 800, fontSize: 20, color: "primary.main" }}>
            {peso(item.sell_price)}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          onClick={() => onAddToCart(item, 1)}
          disabled={adding || stock === 0}
        >
          {adding ? "Adding..." : stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard;
