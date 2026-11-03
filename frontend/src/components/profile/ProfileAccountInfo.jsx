
export default function ProfileAccountInfo({ user, storedUser }) {
  return (
    <section style={styles.section}>
      <h3 style={styles.heading}>Account Information</h3>

      <p>
        <strong>Email:</strong>{" "}
        {user?.email || storedUser?.email || "Not available"}
      </p>

      <p>
        <strong>Username:</strong>{" "}
        {user?.username || storedUser?.username || "Not available"}
      </p>

      <p>
        <strong>Account status:</strong>{" "}
        {user?.status || "Not available"}
      </p>
    </section>
  );
}

const styles = {
  section: {
    lineHeight: "1.8",
    overflowWrap: "anywhere",
  },
  heading: {
    marginBottom: "12px",
  },
};
