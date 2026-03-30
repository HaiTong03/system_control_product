import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import Layout from "./components/Layout"
import LoginPage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import ProductsPage from "./pages/ProductsPage"
import AddProductPage from "./pages/AddProductPage"
import OrdersPage from "./pages/OrdersPage"
import OldProductsPage from "./pages/OldProductsPage"
import PaymentHistoryPage from "./pages/PaymentHistoryPage"
import UserProductActionsPage from "./pages/UserProductActionsPage"

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return user?.role === "admin" ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="add-product" element={<AddProductPage />} />
        <Route
          path="orders"
          element={
            <AdminRoute>
              <OrdersPage />
            </AdminRoute>
          }
        />
        <Route
          path="old-products"
          element={
            <AdminRoute>
              <OldProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="payment-history"
          element={
            <AdminRoute>
              <PaymentHistoryPage />
            </AdminRoute>
          }
        />
        <Route
          path="user-product-actions"
          element={
            <AdminRoute>
              <UserProductActionsPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
