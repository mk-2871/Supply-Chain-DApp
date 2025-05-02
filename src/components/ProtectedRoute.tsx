"use client"

import { Navigate } from "react-router-dom"
import { useAuth, type UserRole } from "../contexts/AuthContext"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole: UserRole
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isConnected, role } = useAuth()

  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  // Check if user has required role
  const hasRequiredRole = () => {
    if (requiredRole === "ADMIN") {
      return role === "ADMIN"
    }
    if (requiredRole === "SELLER") {
      return role === "ADMIN" || role === "SELLER"
    }
    return true // Everyone can access USER routes
  }

  if (!hasRequiredRole()) {
    // Redirect to appropriate dashboard based on role
    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />
    } else if (role === "SELLER") {
      return <Navigate to="/seller" replace />
    } else {
      return <Navigate to="/user" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
