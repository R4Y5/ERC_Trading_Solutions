import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CustomerNavbar from "../components/CustomerNavbar";
import ProfilePicture from "../components/profile/ProfilePicture";
import ProfileAccountInfo from "../components/profile/ProfileAccountInfo";
import ProfileForm from "../components/profile/ProfileForm";
import useProfile from "../hooks/useProfile";

// Fields counted toward "profile complete"
const PROFILE_FIELDS = [
  "title",
  "fname",
  "lname",
  "phone",
  "gender",
  "date_of_birth",
  "addressline",
  "town",
];

function Profile() {
  const {
    user,
    formData,
    loading,
    saving,
    uploadingImage,
    editing,
    message,
    error,
    setMessage,
    setError,
    saveProfile,
    uploadImage,
    startEditing,
    cancelEditing,
    fetchProfile,
  } = useProfile();

  const storedUser = useSelector((state) => state.auth.user);

  // Set by Google sign-in when the account still needs a phone number
  const [searchParams] = useSearchParams();
  const needsCompletion =
    searchParams.get("complete") === "1" && !user?.customer?.phone;

  if (loading) {
    return (
      <div>
        <CustomerNavbar />
        <Box component="main" sx={{ py: 3 }}>
          <Skeleton width={220} height={48} />
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" height={420} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="rounded" height={320} />
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <CustomerNavbar />
        <Box component="main" sx={{ py: 3, maxWidth: 520 }}>
          <Typography variant="h1">My Profile</Typography>
          <Alert severity="error" sx={{ my: 2 }}>
            {error || "Unable to load your profile."}
          </Alert>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={fetchProfile}>
              Try Again
            </Button>
            <Button component={RouterLink} to="/shop">
              Back to Shop
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }

  const fullName =
    [user.customer?.fname, user.customer?.lname].filter(Boolean).join(" ") ||
    user.username ||
    "Customer";

  const filledCount = PROFILE_FIELDS.filter((field) => formData[field]).length;
  const completion = Math.round((filledCount / PROFILE_FIELDS.length) * 100);

  return (
    <div>
      <CustomerNavbar />

      <Box component="main" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h1">My Profile</Typography>
          <Typography color="text.secondary">
            View and manage your personal information.
          </Typography>
        </Box>

        {needsCompletion && (
          <Alert severity="info" role="status" sx={{ mb: 2 }}>
            Welcome! You signed in with Google. Please click <strong>Edit Profile</strong> and
            add your contact number and the rest of your details to finish setting up your account.
          </Alert>
        )}

        {message && (
          <Alert severity="success" role="status" onClose={() => setMessage("")} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" role="alert" onClose={() => setError("")} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ overflow: "visible" }}>
              <Box
                sx={{
                  height: 88,
                  borderRadius: "10px 10px 0 0",
                  background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #2747a8 100%)",
                }}
              />
              <CardContent sx={{ pt: 0, mt: "-60px" }}>
                <ProfilePicture
                  user={user}
                  uploading={uploadingImage}
                  onUpload={uploadImage}
                  onMessage={setMessage}
                  onError={setError}
                />

                <Box sx={{ textAlign: "center", mt: 1.5, mb: 2 }}>
                  <Typography variant="h3" sx={{ mb: 0.25 }}>
                    {fullName}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    @{user.username || "user"}
                  </Typography>
                  <Chip
                    size="small"
                    label={user.status || "Active"}
                    color={user.status === "Active" ? "success" : "default"}
                    variant="outlined"
                  />
                </Box>

                {/* Profile completeness */}
                <Box sx={{ mb: 2.5 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Profile completeness
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completion}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={completion}
                    color={completion === 100 ? "success" : "primary"}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  {completion < 100 && (
                    <Typography variant="caption" color="text.secondary">
                      Add your missing details for faster checkout.
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <ProfileAccountInfo user={user} storedUser={storedUser} />

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Button component={RouterLink} to="/my-orders" variant="outlined" startIcon={<ReceiptLongOutlinedIcon />} fullWidth>
                    My Orders
                  </Button>
                  <Button component={RouterLink} to="/reviews" variant="outlined" startIcon={<RateReviewOutlinedIcon />} fullWidth>
                    My Reviews
                  </Button>
                  <Button component={RouterLink} to="/shop" startIcon={<StorefrontOutlinedIcon />} fullWidth>
                    Continue Shopping
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal information */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="h2" sx={{ mb: 0.25 }}>
                    Personal Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editing
                      ? "Update your details, then click Save Changes."
                      : "These details are used for your orders and deliveries."}
                  </Typography>
                </Box>

                <ProfileForm
                  formData={formData}
                  editing={editing}
                  saving={saving}
                  onSubmit={saveProfile}
                  onEdit={startEditing}
                  onCancel={cancelEditing}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default Profile;