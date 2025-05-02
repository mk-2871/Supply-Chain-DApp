"use client"

import { useAuth } from "../contexts/AuthContext"
import { Link, useLocation } from "react-router-dom"
import {
  Users,
  ShoppingBag,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Package,
  Truck,
  ClipboardList,
} from "lucide-react"

const Sidebar = () => {
  const { role, disconnect } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  // Navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case "ADMIN":
        return [
          { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
          { name: "Manage Sellers", path: "/admin/sellers", icon: <Users size={20} /> },
          { name: "All Materials", path: "/admin/materials", icon: <Package size={20} /> },
          { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
        ]
      case "SELLER":
        return [
          { name: "Dashboard", path: "/seller", icon: <LayoutDashboard size={20} /> },
          { name: "My Materials", path: "/seller/materials", icon: <Package size={20} /> },
          { name: "Add Material", path: "/seller/add", icon: <ShoppingBag size={20} /> },
          { name: "Deliveries", path: "/seller/deliveries", icon: <Truck size={20} /> },
        ]
      default: // USER
        return [
          { name: "Browse Materials", path: "/user", icon: <Package size={20} /> },
          { name: "My Orders", path: "/user/orders", icon: <ClipboardList size={20} /> },
          { name: "Profile", path: "/user/profile", icon: <User size={20} /> },
        ]
    }
  }

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {getNavItems().map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg ${
                  isActive(item.path)
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
          <li className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={disconnect}
              className="flex items-center p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
            >
              <LogOut size={20} />
              <span className="ml-3">Disconnect</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
