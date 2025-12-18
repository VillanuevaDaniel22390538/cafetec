// src/App.jsx - VERSIÓN CORREGIDA
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";

// Páginas públicas
import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RedirectAfterLogin from "./pages/auth/RedirectAfterLogin";

// Rutas protegidas
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import ClientRoute from "./routes/ClientRoute";

// Cliente
import ClientDashboard from "./pages/client/Dashboard";
import Menu from "./pages/client/Menu";
import Cart from "./pages/client/Cart";
import SelectTime from "./pages/client/SelectTime";
import OrderConfirmed from "./pages/client/OrderConfirmed";
import OrderTracking from "./pages/client/OrderTracking";
import Payment from "./pages/client/Payment";
import Profile from "./pages/client/Profile";
// NUEVAS PÁGINAS AÑADIDAS ↓
import OrderDetail from "./pages/client/OrderDetail";
import ClientOrderList from "./pages/client/OrderList"; // ← CAMBIADO NOMBRE

// Administrador
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductList from "./pages/admin/ProductList";
import ProductForm from "./pages/admin/ProductForm";
import AdminOrderList from "./pages/admin/OrderList"; // ← MANTENIDO ORIGINAL
import Reports from "./pages/admin/Reports";
import UserManagement from "./pages/admin/UserManagement";
import OrderDetails from "./pages/admin/OrderDetails";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Router>
            <Routes>
              {/* RUTAS PÚBLICAS */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/redirect" element={<RedirectAfterLogin />} />

              {/* RUTAS DE CLIENTE */}
              <Route
                path="/client/*"
                element={
                  <ClientRoute>
                    <Routes>
                      <Route path="dashboard" element={<ClientDashboard />} />
                      <Route path="menu" element={<Menu />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="select-time" element={<SelectTime />} />
                      <Route path="order-confirmed" element={<OrderConfirmed />} />
                      <Route path="order-tracking" element={<OrderTracking />} />
                      <Route path="order-tracking/:orderId" element={<OrderTracking />} />
                      <Route path="payment/:orderId" element={<Payment />} />
                      {/* NUEVAS RUTAS AÑADIDAS ↓ */}
                      <Route path="orders" element={<ClientOrderList />} /> {/* Lista de todos los pedidos */}
                      <Route path="orders/:id" element={<OrderDetail />} /> {/* Detalle de un pedido específico */}
                      <Route path="profile" element={<Profile />} />
                      {/* Redirección por defecto */}
                      <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
                    </Routes>
                  </ClientRoute>
                }
              />

              {/* RUTAS DE ADMINISTRADOR */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<ProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                <Route path="orders" element={<AdminOrderList />} /> {/* ← Usa AdminOrderList */}
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="reports" element={<Reports />} />
                <Route path="users" element={<UserManagement />} />
              </Route>

              {/* RUTA POR DEFECTO */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;