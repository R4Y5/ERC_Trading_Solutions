import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const isHttpUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value);

// Large avatar with a camera button to choose a new picture,
// then Upload / Cancel to confirm.
export default function ProfilePicture({
  user,
  uploading,
  onUpload,
  onMessage,
  onError,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [localError, setLocalError] = useState("");

  // Show a preview of the chosen file (and free the old preview)
  const choosePreviewFile = (file) => {
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return file ? URL.createObjectURL(file) : "";
    });
    setSelectedFile(file);
  };

  // Free the preview when it changes or the page is left
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = (event) => {
    const file = event.target.files?.[0];

    // Permit selecting the same file again.
    event.target.value = "";

    if (!file) return;

    setLocalError("");
    onMessage("");
    onError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError("Please select a JPG, JPEG, or PNG image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalError("The image must not exceed 5 MB.");
      return;
    }

    choosePreviewFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    const success = await onUpload(selectedFile);

    if (success) {
      choosePreviewFile(null);
    }
  };

  const handleCancel = () => {
    if (uploading) return;
    choosePreviewFile(null);
    setLocalError("");
    onMessage("");
    onError("");
  };

  const fullName =
    [user?.customer?.fname, user?.customer?.lname].filter(Boolean).join(" ") ||
    user?.username ||
    "Customer";

  const imageSrc =
    previewUrl || (isHttpUrl(user?.profile_image) ? user.profile_image : undefined);

  return (
    <Stack sx={{ alignItems: "center" }}>
      <Box sx={{ position: "relative", mb: 1 }}>
        <Avatar
          src={imageSrc}
          alt={fullName}
          sx={{
            width: 120,
            height: 120,
            fontSize: 44,
            fontWeight: 700,
            bgcolor: "secondary.main",
            color: "primary.dark",
            border: "4px solid #fff",
            boxShadow: "0 4px 14px rgba(16,24,40,0.15)",
          }}
        >
          {fullName.charAt(0).toUpperCase()}
        </Avatar>

        {uploading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.6)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        <Tooltip title="Change profile picture">
          <IconButton
            component="label"
            aria-label="Change profile picture"
            disabled={uploading}
            sx={{
              position: "absolute",
              right: 0,
              bottom: 4,
              bgcolor: "primary.main",
              color: "#fff",
              border: "3px solid #fff",
              "&:hover": { bgcolor: "primary.dark" },
            }}
            size="small"
          >
            <PhotoCameraOutlinedIcon fontSize="small" />
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={handleSelect}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {selectedFile && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button size="small" variant="contained" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Save Photo"}
          </Button>
          <Button size="small" onClick={handleCancel} disabled={uploading}>
            Cancel
          </Button>
        </Stack>
      )}

      {selectedFile && !uploading && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Preview — click Save Photo to keep it.
        </Typography>
      )}

      {localError && (
        <Typography variant="caption" color="error" role="alert" sx={{ mt: 0.5, textAlign: "center" }}>
          {localError}
        </Typography>
      )}
    </Stack>
  );
}