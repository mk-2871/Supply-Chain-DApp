import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { config } from "./config/wagmi"
import Layout from "./components/Layout"
import AdminDashboard from "./pages/AdminDashboard"
import SellerDashboard from "./pages/SellerDashboard"
import UserDashboard from "./pages/UserDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import ConnectWallet from "./pages/ConnectWallet"

function App() {
  const queryClient = new QueryClient()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <Toaster position="top-right" />
              <Routes>
                <Route path="/" element={<ConnectWallet />} />
                <Route element={<Layout />}>
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="ADMIN">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller"
                    element={
                      <ProtectedRoute requiredRole="SELLER">
                        <SellerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user"
                    element={
                      <ProtectedRoute requiredRole="USER">
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
