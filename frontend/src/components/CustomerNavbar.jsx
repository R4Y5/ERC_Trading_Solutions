import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import AppNavbar from "./layout/AppNavbar";
import { fetchCart } from "../actions/cartActions";

function CustomerNavbar() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { cart, loaded: cartLoaded } = useSelector((state) => state.cart);

  // Cart count comes from the Redux store, so it updates as soon as
  // anything is added, changed or removed anywhere in the app.
  const cartCount = (cart?.items || []).reduce(
    (total, cartItem) => total + Number(cartItem.quantity || 0),
    0
  );

  useEffect(() => {
    if (token && !cartLoaded) {
      dispatch(fetchCart()).catch(() => {});
    }
  }, [token, cartLoaded, dispatch]);

  const links = [
    { to: "/shop", label: "Shop", icon: <StorefrontOutlinedIcon /> },
    {
      to: "/cart",
      label: "My Cart",
      icon: <ShoppingCartOutlinedIcon />,
      badge: cartCount,
    },
    { to: "/my-orders", label: "My Orders", icon: <ReceiptLongOutlinedIcon /> },
    { to: "/reviews", label: "Reviews", icon: <RateReviewOutlinedIcon /> },
    { to: "/profile", label: "My Profile", icon: <PersonOutlineIcon /> },
  ];

  return <AppNavbar links={links} homePath="/shop" profilePath="/profile" />;
}

export default CustomerNavbar;
