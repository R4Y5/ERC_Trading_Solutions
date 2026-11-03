
import { Link } from "react-router-dom";

import CustomerNavbar from "../components/CustomerNavbar";
import ProfilePicture from "../components/profile/ProfilePicture";
import ProfileAccountInfo from "../components/profile/ProfileAccountInfo";
import ProfileForm from "../components/profile/ProfileForm";

import useProfile from "../hooks/useProfile";
import { getUser } from "../utils/auth";

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

  const storedUser = getUser();

  if (loading) {
    return (
      <div style={styles.container}>
        <CustomerNavbar />
        <p style={styles.loading}>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <CustomerNavbar />

        <main style={styles.card}>
          <h1>My Profile</h1>
          <p style={styles.error}>
            {error || "Unable to load your profile."}
          </p>

          <button
            type="button"
            style={styles.button}
            onClick={fetchProfile}
          >
            Try Again
          </button>

          <p>
            <Link to="/shop">Back to Shop</Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <CustomerNavbar />

      <main style={styles.card}>
        <h1 style={styles.heading}>My Profile</h1>

        <p style={styles.subtitle}>
          View and manage your personal information.
        </p>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <ProfilePicture
          user={user}
          uploading={uploadingImage}
          onUpload={uploadImage}
          onMessage={setMessage}
          onError={setError}
        />

        <ProfileAccountInfo
          user={user}
          storedUser={storedUser}
        />

        <hr style={styles.divider} />

        <ProfileForm
          formData={formData}
          editing={editing}
          saving={saving}
          onSubmit={saveProfile}
          onEdit={startEditing}
          onCancel={cancelEditing}
        />
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "Arial, sans-serif",
    color: "#222",
  },
  card: {
    width: "calc(100% - 32px)",
    maxWidth: "850px",
    boxSizing: "border-box",
    margin: "32px auto",
    padding: "28px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },
  heading: {
    marginBottom: "8px",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 0,
  },
  divider: {
    border: 0,
    borderTop: "1px solid #e5e7eb",
    margin: "24px 0",
  },
  button: {
    padding: "10px 18px",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  success: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "10px",
    borderRadius: "5px",
    overflowWrap: "anywhere",
  },
  error: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    padding: "10px",
    borderRadius: "5px",
    overflowWrap: "anywhere",
  },
  loading: {
    padding: "24px",
  },
};

export default Profile;
