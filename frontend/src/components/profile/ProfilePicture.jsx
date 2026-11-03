
import { useEffect, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

function getImageUrl(image) {
  if (typeof image === "string" && /^https?:\/\//i.test(image)) {
    return image;
  }

  return "/default-profile.png";
}

export default function ProfilePicture({
  user,
  uploading,
  onUpload,
  onMessage,
  onError,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

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

    setImageError(false);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    const success = await onUpload(selectedFile);

    if (success) {
      setSelectedFile(null);
      setImageError(false);
    }
  };

  const handleCancel = () => {
    if (uploading) return;

    setSelectedFile(null);
    setLocalError("");
    onMessage("");
    onError("");
  };

  const imageSrc = previewUrl || getImageUrl(user?.profile_image);
  const fullName = [
    user?.customer?.fname,
    user?.customer?.lname,
  ]
    .filter(Boolean)
    .join(" ") || "Customer";

  return (
    <section style={styles.section}>
      <img
        key={imageSrc}
        src={imageError && !previewUrl ? "/default-profile.png" : imageSrc}
        alt="Customer profile"
        style={styles.picture}
        onError={() => {
          if (previewUrl) {
            setLocalError("Unable to preview this image.");
          } else {
            setImageError(true);
          }
        }}
      />

      <h3 style={styles.name}>{fullName}</h3>
      <p style={styles.caption}>Profile Picture</p>

      <label style={styles.fileLabel}>
        {selectedFile ? "Choose Another Picture" : "Change Profile Picture"}
        <input
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          onChange={handleSelect}
          disabled={uploading}
          style={styles.fileInput}
        />
      </label>

      {selectedFile && (
        <div style={styles.actions}>
          <button
            type="button"
            style={{
              ...styles.button,
              ...(uploading ? styles.disabled : {}),
            }}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Picture"}
          </button>

          <button
            type="button"
            style={styles.cancelButton}
            onClick={handleCancel}
            disabled={uploading}
          >
            Cancel
          </button>
        </div>
      )}

      <p style={styles.hint}>
        JPG, JPEG, or PNG. Maximum file size: 5 MB.
      </p>

      {localError && <p style={styles.error}>{localError}</p>}
    </section>
  );
}

const styles = {
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    margin: "28px 0",
    textAlign: "center",
  },
  picture: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  name: {
    margin: "8px 0 0",
  },
  caption: {
    color: "#6b7280",
    margin: 0,
    fontSize: "14px",
  },
  fileLabel: {
    display: "inline-block",
    padding: "10px 18px",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  fileInput: {
    display: "none",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
  },
  button: {
    padding: "10px 18px",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  cancelButton: {
    padding: "10px 18px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  hint: {
    color: "#6b7280",
    fontSize: "12px",
    margin: 0,
  },
  error: {
    color: "#b91c1c",
    fontSize: "13px",
    margin: 0,
  },
};
