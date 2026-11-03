import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Rating from "@mui/material/Rating";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { getProductRating, getProductReviewCount } from "../../hooks/useShop";

const peso = (value) =>
  "₱" +
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Reviewer's display name (the User model keeps names under user.customer)
const reviewerName = (review) => {
  const person = review.customer || {};
  const fname = person.customer?.fname || person.fname;
  const lname = person.customer?.lname || person.lname;
  return [fname, lname].filter(Boolean).join(" ") || person.username || "Customer";
};

function ProductDetails({
  item,
  loading,
  quantity,
  setQuantity,
  onClose,
  onAddToCart,
  adding,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!item) return null;

  const activeImages = (item.images || []).filter(
    (image) => !image.deleted_at && image.image_path,
  );
  const reviews = (item.reviews || []).filter((review) => !review.deleted_at);
  const stock = Number(item.stock?.quantity) || 0;
  const rating = getProductRating(item);
  const reviewCount = getProductReviewCount(item);
  const mainImage = activeImages[Math.min(activeImageIndex, activeImages.length - 1)];

  const changeQuantity = (value) => {
    const next = Number(value);
    setQuantity(
      Number.isFinite(next) && next >= 1 ? Math.min(Math.floor(next), Math.max(stock, 1)) : 1,
    );
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="product-details-title"
    >
      <DialogTitle id="product-details-title" sx={{ pr: 7 }}>
        Product Details
        <IconButton
          onClick={onClose}
          aria-label="Close product details"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Images */}
          <Grid size={{ xs: 12, md: 6 }}>
            {loading && activeImages.length === 0 ? (
              <Skeleton variant="rounded" height={320} />
            ) : mainImage ? (
              <>
                <Box
                  component="img"
                  src={mainImage.image_path}
                  alt={`${item.item_name} image ${activeImageIndex + 1}`}
                  sx={{
                    width: "100%",
                    height: { xs: 260, sm: 340 },
                    objectFit: "cover",
                    borderRadius: 2,
                    bgcolor: "grey.100",
                    display: "block",
                  }}
                />
                {activeImages.length > 1 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1, overflowX: "auto", pb: 0.5 }}>
                    {activeImages.map((image, index) => (
                      <Box
                        key={image._id || image.image_path}
                        component="button"
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`Show image ${index + 1}`}
                        sx={{
                          p: 0,
                          border: 2,
                          borderColor: index === activeImageIndex ? "primary.main" : "transparent",
                          borderRadius: 1.5,
                          overflow: "hidden",
                          cursor: "pointer",
                          flexShrink: 0,
                          bgcolor: "transparent",
                        }}
                      >
                        <Box
                          component="img"
                          src={image.image_path}
                          alt=""
                          sx={{ width: 64, height: 64, objectFit: "cover", display: "block" }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </>
            ) : (
              <Box
                sx={{
                  height: 300,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  color: "grey.500",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Stack sx={{ alignItems: "center" }}>
                  <ImageNotSupportedOutlinedIcon fontSize="large" />
                  <Typography>No product images available.</Typography>
                </Stack>
              </Box>
            )}
          </Grid>

          {/* Info and add to cart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip label={item.category} size="small" variant="outlined" sx={{ mb: 1 }} />
            <Typography variant="h2" sx={{ mb: 1 }}>
              {item.item_name}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
              <Rating value={rating} precision={0.5} readOnly />
              <Typography color="text.secondary">
                {reviewCount > 0
                  ? `${rating.toFixed(1)} · ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                  : "No reviews yet"}
              </Typography>
            </Stack>

            <Typography sx={{ fontSize: 28, fontWeight: 800, color: "primary.main", mb: 1 }}>
              {peso(item.sell_price)}
            </Typography>

            <Chip
              icon={<StorefrontOutlinedIcon />}
              label={stock > 0 ? `${stock} available` : "Out of stock"}
              color={stock === 0 ? "error" : stock < 10 ? "warning" : "success"}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />

            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Description</Typography>
            <Typography
              color="text.secondary"
              sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", mb: 3 }}
            >
              {item.description || "No description provided."}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" } }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  alignSelf: "flex-start",
                }}
              >
                <IconButton
                  onClick={() => changeQuantity(quantity - 1)}
                  disabled={stock <= 0 || quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <RemoveIcon />
                </IconButton>
                <Box
                  component="input"
                  id="product-quantity"
                  type="number"
                  aria-label="Quantity"
                  min={1}
                  max={stock}
                  value={quantity}
                  disabled={stock <= 0}
                  onChange={(event) => changeQuantity(event.target.value)}
                  sx={{
                    width: 56,
                    textAlign: "center",
                    border: 0,
                    font: "inherit",
                    fontWeight: 700,
                    bgcolor: "transparent",
                    "&:focus": { outline: "none" },
                    MozAppearance: "textfield",
                    "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                  }}
                />
                <IconButton
                  onClick={() => changeQuantity(quantity + 1)}
                  disabled={stock <= 0 || quantity >= stock}
                  aria-label="Increase quantity"
                >
                  <AddIcon />
                </IconButton>
              </Stack>

              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCartIcon />}
                disabled={stock <= 0 || adding || quantity < 1}
                onClick={() => onAddToCart(item, quantity)}
                sx={{ flexGrow: 1 }}
              >
                {adding ? "Adding..." : stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Reviews */}
        <Typography variant="h3" sx={{ mb: 2 }}>
          Customer Reviews ({reviewCount})
        </Typography>

        {reviews.length === 0 ? (
          <Typography color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
        ) : (
          <Stack spacing={2}>
            {reviews.map((review) => {
              const name = reviewerName(review);
              const images = (review.images || []).filter(
                (image) => !image.deleted_at && image.image_path,
              );

              return (
                <Paper key={review._id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 15 }}>
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }} noWrap>{name}</Typography>
                      {review.created_at && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                      )}
                    </Box>
                    <Rating value={Number(review.rating) || 0} readOnly size="small" />
                  </Stack>

                  <Typography sx={{ whiteSpace: "pre-wrap" }}>{review.review_text}</Typography>

                  {images.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
                      {images.map((image, index) => (
                        <Box
                          key={image._id || image.image_path}
                          component="img"
                          src={image.image_path}
                          alt={`Review image ${index + 1}`}
                          loading="lazy"
                          sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1.5 }}
                        />
                      ))}
                    </Stack>
                  )}

                  {review.admin_reply?.trim() && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        bgcolor: "grey.50",
                        borderLeft: 3,
                        borderColor: "primary.main",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                        ERC Trading replied
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {review.admin_reply}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetails;
