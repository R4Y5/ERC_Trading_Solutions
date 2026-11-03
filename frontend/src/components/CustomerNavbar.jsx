import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

function CustomerNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.brand}>ERC Trading Solutions</h2>

      <div style={styles.navLinks}>
        <Link to="/profile" style={styles.navLink}>
          My Profile
        </Link>

        <Link to="/shop" style={styles.navLink}>
          Shop
        </Link>

        <Link to="/cart" style={styles.navLink}>
          My Cart
        </Link>

        <Link to="/my-orders" style={styles.navLink}>
          My Orders
        </Link>

        <Link to="/reviews" style={styles.navLink}>
          Reviews
        </Link>

        <button
          type="button"
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: "#172554",
    color: "#fff",
    padding: "16px 24px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  brand: {
    margin: 0,
  },
  navLinks: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "16px",
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
  },
  logoutButton: {
    padding: "8px 12px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default CustomerNavbar;