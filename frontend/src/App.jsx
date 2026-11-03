import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import CompleteRegistration from "./pages/CompleteRegistration";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Items from "./pages/Items";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import Reviews from "./pages/Reviews";
import AdminReviews from "./pages/AdminReviews";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<h1>ERC Trading Solutions</h1>} />

        {/* Registration */}
        <Route path="/register" element={<Register />} />

        <Route
          path="/complete-registration"
          element={<CompleteRegistration />}
        />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Customer Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Pages */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />

        <Route
          path="/items"
          element={
            <AdminRoute>
              <Items />
            </AdminRoute>
          }
        />

        {/* Customer Pages */}
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* Order Management */}
        <Route
          path="/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

        {/* Reviews */}
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews/admin"
          element={
            <AdminRoute>
              <AdminReviews />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
